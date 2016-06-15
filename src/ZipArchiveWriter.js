/**
 * @constructor
 * @param {boolean} shareMemory
 * @param {number}  chunkSize
 * @example
 * var writer = new jz.zip.ZipArchiveWriter({shareMemory: true, chunkSize: 0xf000});
 * writer
 * .on('data', function(chunk) {
 *   // ...
 * })
 * .on('end', function() {
 *   // ...
 * });
 * .write('foo/bar/baz.txt', buffer)
 * .write('a.mp3', mp3Buff)
 * .writeEnd();
 */
var ZipArchiveWriter = defun(['shareMemory', 'chunkSize'], function ZipArchiveWriter(shareMemory, chunkSize) {
    this.shareMemory = shareMemory;
    this.chunkSize = chunkSize;
    this.dirs = {};
    this.centralDirHeaders = [];
    this.offset = 0;
    this.date = new Date();
    this.listners = {};
});

/**
 * @param {string}     path
 * @param {Uint8Array} buffer
 * @param {number}     level
 * @return {ZipArchiveWriter} return this
 */
ZipArchiveWriter.prototype.write = function(path, buffer, level) {
    var self = this;
    path.split('/').reduce(function(parent, child) {
        self.writeDir(parent + '/');
        return parent + '/' + child;
    });
    this.writeFile(path, buffer, level);
    return this;
};

/**
 * @param  {string} path
 * @return {ZipArchiveWriter} return this
 */
ZipArchiveWriter.prototype.writeDir = function(path) {
    var localFileHeader;
    path += (/.+\/$/.test(path) ? '' : '/');
    if (!this.dirs[path]) {
        this.dirs[path] = true;
        path = utils.toBytes(path);
        localFileHeader = createLocalFileHeader(path, this.date, false);
        this.centralDirHeaders.push(createCentralDirHeader(path, this.date, false, this.offset, 0, 0, 0));
        this.trigger('data', localFileHeader);
        this.offset += localFileHeader.length;
    }
    return this;
};

/**
 * @param  {string}           path
 * @param  {Uint8Array}       buffer
 * @param  {number}           level
 * @return {ZipArchiveWriter} return this
 */
ZipArchiveWriter.prototype.writeFile = function(path, buffer, level) {
    path = utils.toBytes(path);
    var offset = this.offset,
        localFileHeader = createLocalFileHeader(path, this.date, level),
        compressedSize = 0,
        dataDescriptor,
        crc32,
        self = this;
    this.trigger('data', localFileHeader);
    if (level) {
        stream.algorithms.deflate({
            buffer: buffer,
            level: level,
            streamFn: function(chunk) {
                compressedSize += chunk.length;
                self.trigger('data', chunk);
            },
            shareMemory: this.shareMemory,
            chunkSize: this.chunkSize,
        });
    } else {
        compressedSize = buffer.length;
        this.trigger('data', buffer);
    }
    crc32 = algorithms.crc32(buffer);
    dataDescriptor = createDataDescriptor(crc32, compressedSize, buffer.length)
    this.trigger('data', dataDescriptor);
    this.centralDirHeaders.push(createCentralDirHeader(path, this.date, level, offset, buffer.length, compressedSize, crc32));
    this.offset += localFileHeader.length + compressedSize + dataDescriptor.length;
    return this;
};

ZipArchiveWriter.prototype.writeEnd = function() {
    var centralDirHeaderSize = 0,
        self = this;
    this.centralDirHeaders.forEach(function(header) {
        centralDirHeaderSize += header.length;
        self.trigger('data', header);
    });
    this.trigger('data', createEndCentDirHeader(this.centralDirHeaders.length, centralDirHeaderSize, this.offset));
    this.trigger('end', null);
};

/**
 * @param  {string}           name
 * @param  {Function}         callback
 * @return {ZipArchiveWriter} return this
 */
ZipArchiveWriter.prototype.on = function(name, callback) {
    if (!this.listners[name]) this.listners[name] = [];
    this.listners[name].push(callback);
    return this;
};

/**
 * @param {string} name
 * @param {*}      data
 */
ZipArchiveWriter.prototype.trigger = function(name, data) {
    if (!this.listners[name]) return;
    this.listners[name].forEach(function(listner) {
        listner(data);
    });
};

expose('jz.zip.ZipArchiveWriter', ZipArchiveWriter);
exposeProperty('write', ZipArchiveWriter, ZipArchiveWriter.prototype.write);
exposeProperty('writeDir', ZipArchiveWriter, ZipArchiveWriter.prototype.writeDir);
exposeProperty('writeFile', ZipArchiveWriter, ZipArchiveWriter.prototype.writeFile);
exposeProperty('writeEnd', ZipArchiveWriter, ZipArchiveWriter.prototype.writeEnd);
exposeProperty('on', ZipArchiveWriter, ZipArchiveWriter.prototype.on);

/**
 * local file header
 * @param  {string}     fileName
 * @param  {Date}       date
 * @param  {boolean}    isDeflated
 * @return {Uint8Array}
 */
function createLocalFileHeader(fileName, date, isDeflated) {
    var view = new DataView(new ArrayBuffer(30 + fileName.length)),
        bytes = new Uint8Array(view.buffer),
        offset = 0;
    view.setUint32(offset, zip.LOCAL_FILE_SIGNATURE, true); offset += 4; // local file header signature
    view.setUint16(offset, 20, true); offset += 2;                       // version needed to extract
    view.setUint16(offset, 0x0808); offset += 2;                         // general purpose bit flag
    view.setUint16(offset, isDeflated ? 8 : 0, true); offset += 2;       // compression method
    view.setUint16(offset, createDosFileTime(date), true); offset += 2;  // last mod file time
    view.setUint16(offset, createDosFileDate(date), true); offset += 2;  // last mod file date
    // skip below
    // crc-32 4bytes
    // compressed size 4bytes
    // uncompressed size 4bytes
    offset += 12;
    view.setUint16(offset, fileName.length, true); offset += 2;          // file name length
    offset += 2;                                                         // skip extra field length
    bytes.set(fileName, offset);
    return bytes;
}

/**
 * data descriptor
 * @param {number} crc32
 * @param {number} compressedSize
 * @param {number} uncompressedSize
 * @return {Uint8Array}
 */
function createDataDescriptor(crc32, compressedSize, uncompressedSize) {
    var view = new DataView(new ArrayBuffer(16));
    view.setUint32(0, zip.DATA_DESCRIPTOR_SIGNATURE, true);
    view.setUint32(4, crc32, true);
    view.setUint32(8, compressedSize, true);
    view.setUint32(12, uncompressedSize, true);
    return new Uint8Array(view.buffer);
}

/**
 * central directory
 * @param  {string}     fileName
 * @param  {Date}       date
 * @param  {boolean}    isDeflated
 * @param  {number}     fileOffset
 * @param  {Uint8Array} dataDescriptor
 * @return {Uint8Array}
 */
function createCentralDirHeader(fileName, date, isDeflated, fileOffset, uncompressedSize, compressedSize, crc) {
    var view = new DataView(new ArrayBuffer(46 + fileName.length)),
        bytes = new Uint8Array(view.buffer),
        offset = 0;
    view.setUint32(offset, zip.CENTRAL_DIR_SIGNATURE, true); offset += 4; // central file header signature
    view.setUint16(offset, 20, true); offset += 2;                        // version made by (2.0)
    view.setUint16(offset, 20, true); offset += 2;                        // version needed to extract
    view.setUint16(offset, 0x0808); offset += 2;                          // general purpose bit flag (use utf8, data discriptor)
    view.setUint16(offset, isDeflated ? 8 : 0, true); offset += 2;        // compression method
    view.setUint16(offset, createDosFileTime(date), true); offset += 2;   // last mod file time
    view.setUint16(offset, createDosFileDate(date), true); offset += 2;   // last mod file date
    view.setUint32(offset, crc, true); offset += 4;                       // crc-32
    view.setUint32(offset, compressedSize, true); offset += 4;            // compressed size
    view.setUint32(offset, uncompressedSize, true); offset += 4;          // uncompressed size
    view.setUint16(offset, fileName.length, true); offset += 2;           // file name length
    // skip below
    // extra field length 2bytes
    // file comment length 2bytes
    // disk number start 2bytes
    // internal file attributes 2bytes
    // external file attributes 4bytes
    offset += 12;
    view.setUint32(offset, fileOffset, true); offset += 4;                // relative offset of local header
    bytes.set(fileName, offset);                                          // file name
    return bytes;
}

/**
 * end of central dirctory
 * @param  {number} numberOfCentralDirs
 * @param  {number} centralDirHeaderSize
 * @param  {number} centralDirStartOffset
 * @return {Uint8Array}
 */
function createEndCentDirHeader(numberOfCentralDirs, centralDirHeaderSize, centralDirStartOffset) {
    var view = new DataView(new ArrayBuffer(22));
    view.setUint32(0, zip.END_SIGNATURE, true);      // end of central dir signature
    view.setUint16(4, 0, true);                      // number of this disk
    view.setUint16(6, 0, true);                      // number of the disk with the start of the central directory
    view.setUint16(8, numberOfCentralDirs, true);    // total number of entries in the central directory on this disk
    view.setUint16(10, numberOfCentralDirs, true);   // total number of entries in the central directory
    view.setUint32(12, centralDirHeaderSize, true);  // size of the central directory
    view.setUint32(16, centralDirStartOffset, true); // offset of start of central directory with respect to the starting disk number
    view.setUint16(20, 0, true);                     // .ZIP file comment length
    return new Uint8Array(view.buffer);
}

/**
 * create DOS style Date(year, month, day).
 * @param {Date} date
 * @return {number}
 */
function createDosFileDate(date) {
    return ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | (date.getDay());
}

/**
 * create DOS style Time(hour, minute, second).
 * @param {Date} date
 * @return {number}
 */
function createDosFileTime(date) {
    return (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1);
}
