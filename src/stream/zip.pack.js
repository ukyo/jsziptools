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
 * central directory
 * @param  {Uint8Array} buffer
 * @param  {Uint8Array} fileName
 * @param  {Date}       date
 * @param  {boolean}    isDeflated
 * @param  {number}     fileOffset
 * @param  {Uint8Array} dataDescriptor
 * @return {Uint8Array}
 */
function createCentralDirHeader(buffer, fileName, date, isDeflated, fileOffset, dataDescriptor) {
    var view = new DataView(new ArrayBuffer(46 + fileName.length)),
        bytes = new Uint8Array(view.buffer),
        offset = 0;
    view.setUint32(offset, zip.CENTRAL_DIR_SIGNATURE, true); offset += 4; // central file header signature
    view.setUint16(offset, 20, true); offset += 2;                        // version made by (2.0)
    view.setUint16(offset, 20, true); offset += 2;                        // version needed to extract
    view.setUint16(offset, 0x0008); offset += 2;                          // general purpose bit flag (use utf8, data discriptor)
    view.setUint16(offset, isDeflated ? 8 : 0, true); offset += 2;        // compression method
    view.setUint16(offset, createDosFileTime(date), true); offset += 2;   // last mod file time
    view.setUint16(offset, createDosFileDate(date), true); offset += 2;   // last mod file date
    // crc-32
    // compressed size
    // uncompressed size
    bytes.set(dataDescriptor, offset); offset += 12;
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
 * local file header
 * @param  {Uint8Array} buffer
 * @param  {Uint8Array} fileName
 * @param  {Date}       date
 * @param  {boolean}    isDeflated
 * @return {Uint8Array}
 */
function createLocalFileHeader(buffer, fileName, date, isDeflated) {
    var view = new DataView(new ArrayBuffer(30 + fileName.length)),
        bytes = new Uint8Array(view.buffer),
        offset = 0;
    view.setUint32(offset, zip.LOCAL_FILE_SIGNATURE, true); offset += 4; // local file header signature
    view.setUint16(offset, 20, true); offset += 2;                       // version needed to extract
    view.setUint16(offset, 0x0008); offset += 2;                         // general purpose bit flag
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
 * data discriptor
 * @param  {number} uncompressedSize
 * @param  {number} compressedSize
 * @param  {number} crc
 * @return {Uint8Array}
 */
function createDataDescriptor(uncompressedSize, compressedSize, crc) {
    var view = new DataView(new ArrayBuffer(12));
    view.setUint32(0, crc, true);
    view.setUint32(4, compressedSize, true);
    view.setUint32(8, uncompressedSize, true);
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


/**
 * @param {Array} files
 * @param {function(chunk: Uint8Array)} streamFn
 * @param {number} level - optional (default is `6`)
 * @param {boolean} shareMemory - optional (default is `false`)
 * @param {number} chunkSize - optional (default is `0x8000`)
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
 * jz.stream.zip.pack({
 *     files: files,
 *     streamFn: function(chunk) {
 *         // ...
 *     }
 * })
 * .then(function() {
 *   // no args.
 * });
 */
stream.zip.pack = function(files, streamFn, level, shareMemory, chunkSize) {
    var params = utils.getParams(arguments, ['files', 'streamFn', 'level', 'shareMemory', 'chunkSize']),
        offset = 0,
        centralDirHeaders = [],
        date = new Date(),
        files = params.files,
        level = params.level = typeof params.level === 'number' ? params.level : 6,
        chunkSize = params.chunkSize,
        shareMemory = params.shareMemory,
        streamFn = params.streamFn,
        promises = [];

    function packItem(level, path, item) {
        var buffer,
            isDeflated,
            fileNameBytes,
            localFileHeader,
            compressedSize,
            dataDiscriptor,
            centralDirHeader,
            dir = item.children || item.dir || item.folder;

        level = typeof item.level === 'number' ? item.level : level;
        // init buffer and file path.
        if (dir) {
            buffer = new ArrayBuffer(0);
            path += item.name + (/.+\/$/.test(item.name) ? '' : '/');
        } else {
            if (item.buffer != null) buffer = item.buffer;
            if (item.str != null) buffer = item.str;
            if (buffer != null) {
                path += item.name;
            } else {
                throw new Error('jz.zip.pack: This type is not supported.');
            }
        }
        buffer = utils.toBytes(buffer);
        isDeflated = !dir && level;
        fileNameBytes = utils.toBytes(path);

        localFileHeader = createLocalFileHeader(buffer, fileNameBytes, date, isDeflated);
        streamFn(localFileHeader);
        // compress bufer
        compressedSize = 0;
        if (isDeflated) {
            stream.algorithms.deflate({
                buffer: buffer,
                shareMemory: shareMemory,
                chunkSize: chunkSize,
                streamFn: function(chunk) {
                    compressedSize += chunk.length;
                    streamFn(chunk);
                }
            });
        } else {
            streamFn(buffer);
            compressedSize = buffer.length;
        }

        dataDescriptor = createDataDescriptor(buffer.length, compressedSize, algorithms.crc32(buffer));
        centralDirHeader = createCentralDirHeader(buffer, fileNameBytes, date, isDeflated, offset, dataDescriptor);
        centralDirHeaders.push(centralDirHeader);
        
        offset += localFileHeader.length + compressedSize;

        if (dir) dir.forEach(packItem.bind(null, level, path));
    }

    // load files with ajax(async).
    function loadFile(item) {
        var dir = item.children || item.dir || item.folder;
        if(dir) {
            dir.forEach(loadFile);
        } else if (item.url) {
            promises.push(utils.load(item.url).then(function(args) {
                item.buffer = args[0];
                item.url = null;
            }));
        }
    }

    files.forEach(loadFile);
    return Promise.all(promises).then(function() {
        files.forEach(packItem.bind(null, level, ''));
        var centralDir = utils.concatBytes(centralDirHeaders);
        streamFn(centralDir);
        streamFn(createEndCentDirHeader(centralDirHeaders.length, centralDir.length, offset));
    });
};

expose('jz.stream.zip.pack', stream.zip.pack);
