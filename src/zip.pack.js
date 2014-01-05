/* require:
jsziptools.js
utils.js
deflate.js
crc32.js
*/


/**
 * @param {number} n Number of Files and folders.
 * @param {number} centralDirHeaderSize
 * @param {number} offset A start position of a File.
 * @return {Uint8Array}
 */
function getEndCentDirHeader(n, centralDirHeaderSize, offset){
    var view = new DataView(new ArrayBuffer(22));
    view.setUint32(0, zip.END_SIGNATURE, true);
    view.setUint16(4, 0, true);
    view.setUint16(6, 0, true);
    view.setUint16(8, n, true);
    view.setUint16(10, n, true);
    view.setUint32(12, centralDirHeaderSize, true);
    view.setUint32(16, offset, true);
    view.setUint16(20, 0, true);
    return new Uint8Array(view.buffer);
}


/**
 * @constructor
 * @param {ArrayBuffer} buffer
 * @param {string}      filename
 * @param {Date}        date
 * @param {Boolean}     isDir
 * @param {number}      level
 * @param {number}      offset
 */
function ZipElement(buffer, filename, date, isDir, level, offset) {
    if (buffer.byteLength === 0) level = 0;
    this.buffer = buffer;
    this.compressedBuffer = buffer;
    this.filename = utils.toBytes(filename);
    this.date = date;
    this.level = level;
    this.offset = offset;
    this.dirFlag = isDir ? 0x10 : 0;

    if(level > 0 && !isDir) {
        this.compressedBuffer = algorithms.deflate(buffer, level);
        this.deflateFlag = 0x8;
    } else {
        this.compressedBuffer = buffer;
        this.deflateFlag = 0;
    }

    this.commonHeader = this.getCommonHeader();
}

ZipElement.prototype.getCommonHeader = function() {
    var view = new DataView(new ArrayBuffer(26)),
        compsize = this.compressedBuffer.byteLength,
        uncompsize = this.buffer.byteLength,
        utf8Flag = 0x0800;

    view.setUint16(0, 10, true); // version needed to extract
    view.setUint16(2, utf8Flag, true); // general purpose bit flag
    view.setUint16(4, this.deflateFlag, true); // compression method
    view.setUint16(6, getFileTime(this.date), true); // last mod file time
    view.setUint16(8, getFileDate(this.date), true); // last mod file date
    view.setUint32(10, algorithms.crc32(this.buffer), true); // crc-32
    view.setUint32(14, compsize, true); // compressed size
    view.setUint32(18, uncompsize, true); // uncompressed size
    view.setUint16(22, this.filename.length, true); // file name length
    view.setUint16(24, 0, true); // extra field length

    return new Uint8Array(view.buffer);
};

/**
 * @return {Uint8Array}
 */
ZipElement.prototype.getLocalFile = function() {
    return utils.concatByteArrays(
        this.getLocalFileHeader(),
        new Uint8Array(this.compressedBuffer)
    );
};

/**
 * @return {Uint8Array}
 */
ZipElement.prototype.getLocalFileHeader = function() {
    var view = new DataView(new ArrayBuffer(4 + this.commonHeader.length + this.filename.length)),
        bytes = new Uint8Array(view.buffer),
        offset = 0;

    view.setUint32(offset, zip.LOCAL_FILE_SIGNATURE, true); offset += 4;
    bytes.set(this.commonHeader, offset); offset += this.commonHeader.length;
    bytes.set(this.filename, offset);
    return bytes;
};

/**
 * @return {Uint8Array}
 */
ZipElement.prototype.getCentralDirHeader = function() {
    var view = new DataView(new ArrayBuffer(20 + this.commonHeader.length + this.filename.length)),
        bytes = new Uint8Array(view.buffer),
        offset = 0;

    view.setUint32(0, zip.CENTRAL_DIR_SIGNATURE, true); offset += 4; // central file header signature
    view.setUint16(offset, 0x14, true); offset += 2; // version made by
    bytes.set(this.commonHeader, offset); offset += this.commonHeader.length;
    view.setUint16(offset, 0, true); offset += 2; // file comment length
    view.setUint16(offset, 0, true); offset += 2; // disk number start
    view.setUint16(offset, 0, true); offset += 2; // internal file attributes
    view.setUint32(offset, this.dirFlag, true); offset += 4; // external file attributes
    view.setUint32(offset, this.offset, true); offset += 4; // relative offset of local header
    bytes.set(this.filename, offset); // file name

    return bytes;
};


/**
 * Get DOS style Date(year, month, day).
 *
 * @param {Date} date
 * @return {number}
 */
function getFileDate(date){
    return ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | (date.getDay());
}


/**
 * Get DOS style Time(hour, minute, second).
 *
 * @param {Date} date
 * @return {number}
 */
function getFileTime(date){
    return (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1);
}


/**
 * Generate a zip file buffer from a js object.
 *
 * @param {Object} params
 * @return {Promise}
 *
 * @example
 * var files = [
 *     {name: 'foo.txt', str: 'foo'}, // String
 *     {name: 'bar.mp3', buffer: mp3Bytes}, // ArrayBuffer, Uint8Array, Array
 *     {name: 'baz.json', url: 'path/to/baz.json'}, // xhr
 *     {name: 'dir', dir: [ // dir
 *         {name: 'children', children: [ // dir
 *             {name: 'folder', folder: [ // dir
 *                 {name: 'aaa.txt', str: 'aaa.txt'}
 *             ]}
 *         ]}
 *     ], level: 8}
 * ];
 *
 * jz.zip.pack({
 *     files: files,
 *     level: 6, // default is 6
 * })
 * .then(function(buffer) { }) // buffer is ArrayBuffer
 * .catch(function(err) { });
 *
 * jz.zip.pack(files)
 * .then(function(buffer) { })
 * .catch(function(err) { });
 */
zip.pack = function(params){
    var n = 0,
        offset = 0,
        archive = [],
        centralDirs = [],
        date = new Date(),
        index = 0,
        files, level;

    params = Array.isArray(params) ? {files: params} : params;
    files = params.files;
    level = typeof params.level === 'number' ? level : 6;

    function _pack(level, path, item){
        var name, buffer, zipElement, localFile,
            dir = item.children || item.dir || item.folder;

        level = typeof item.level === 'number' ? item.level : level;

        if(dir){
            buffer = new ArrayBuffer(0);
            name = path + item.name + (item.name.substr(-1) === '/' ? '' : '/');
        } else {
            if (item.buffer != null) buffer = item.buffer;
            if (item.str != null) buffer = item.str;
            if (buffer != null) {
                buffer = utils.toBytes(buffer);
                name = path + item.name;
            } else {
                throw new Error('jz.zip.pack: This type is not supported.');
            }
        }

        zipElement = new ZipElement(buffer, name, date, dir, level, offset);
        localFile = zipElement.getLocalFile();

        archive.push(localFile);
        centralDirs.push(zipElement.getCentralDirHeader());

        offset += localFile.byteLength;
        n++;

        if(dir){
            dir.forEach(_pack.bind(null, level, name));
        }
    }

    function pack () {
        files.forEach(_pack.bind(null, level, ''));
        archive.push.apply(archive, centralDirs);
        archive.push(getEndCentDirHeader(n, utils.concatByteArrays(centralDirs).length, offset));
        return utils.concatByteArrays(archive).buffer;
    }

    var promises = [];

    // load files with ajax(async).
    function loadFile (item) {
        var dir = item.children || item.dir || item.folder;
        if(dir) {
            dir.forEach(loadFile);
        } else if(item.url) {
            promises.push(utils.load(item.url).then(function (args) {
                var response = args[0];
                item.buffer = response;
                item.url = null;
            }));
        }
    }

    files.forEach(loadFile);
    return Promise.all(promises).then(pack);
};

expose('jz.zip.pack', zip.pack);
