/**
 * @constructor
 * @param {object} params
 */
function ZipArchiveReader(params) {
    this.bytes = utils.toBytes(params.buffer);
    this.buffer = this.bytes.buffer;
    this.params = params;
};

/**
 * @return {Promise}
 */
ZipArchiveReader.prototype.init = function() {
    var signature, header, endCentDirHeader, i, n, bytes = this.bytes,
        localFileHeaders = [],
        centralDirHeaders = [],
        files = [],
        folders = [],
        offset = bytes.byteLength - 4,
        view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength),
        self = this,
        params = this.params;

    this.files = files;
    this.folders = folders;
    this.localFileHeaders = localFileHeaders;
    this.centralDirHeaders = centralDirHeaders;

    // check the first local file signature
    if (view.getUint32(0, true) !== zip.LOCAL_FILE_SIGNATURE) {
        throw new Error('zip.unpack: invalid zip file');
    }

    // read the end central dir header.
    while (true) {
        if (view.getUint32(offset, true) === zip.END_SIGNATURE) {
            endCentDirHeader = self._getEndCentDirHeader(offset);
            break;
        }
        offset--;
        if (offset === 0) throw new Error('zip.unpack: invalid zip file');
    }

    // read central dir headers.
    offset = endCentDirHeader.startpos;
    for (i = 0, n = endCentDirHeader.direntry; i < n; ++i) {
        header = self._getCentralDirHeader(offset);
        centralDirHeaders.push(header);
        offset += header.allsize;
    }

    // read local file headers.
    for (i = 0; i < n; ++i) {
        offset = centralDirHeaders[i].headerpos;
        header = self._getLocalFileHeader(offset);
        header.crc32 = centralDirHeaders[i].crc32;
        header.compsize = centralDirHeaders[i].compsize;
        header.uncompsize = centralDirHeaders[i].uncompsize;
        localFileHeaders.push(header);
    }

    return this._completeInit();
};

/**
 * @return {Promise}
 */
ZipArchiveReader.prototype._completeInit = function() {
    var files = this.files,
        folders = this.folders,
        params = this.params,
        localFileHeaders = this.localFileHeaders,
        self = this;

    localFileHeaders.forEach(function(header, i) {
        // Is the last char '/'.
        (header.filename[header.filename.length - 1] !== 47 ? files : folders).push(header);
    });

    // detect encoding. cp932 or utf-8.
    if (params.encoding == null) {
        Promise.resolve(localFileHeaders.map(function(header) {
            return header.filename;
        })).then(utils.concatBytes).then(utils.detectEncoding).then(function(encoding) {
            params.encoding = encoding;
        })
    }

    return Promise.all(localFileHeaders.map(function(header, i) {
        return utils.bytesToString(header.filename, params.encoding).then(function(filename) {
            header.filename = filename;
        });
    })).then(function() {
        return self
    });
};

/**
 * @param  {number} offset
 * @return {object}
 */
ZipArchiveReader.prototype._getLocalFileHeader = function(offset) {
    var view = new DataView(this.buffer, offset),
        bytes = new Uint8Array(this.buffer, offset),
        ret = {};

    ret.signature = view.getUint32(0, true);
    ret.needver = view.getUint16(4, true);
    ret.option = view.getUint16(6, true);
    ret.comptype = view.getUint16(8, true);
    ret.filetime = view.getUint16(10, true);
    ret.filedate = view.getUint16(12, true);
    ret.crc32 = view.getUint32(14, true);
    ret.compsize = view.getUint32(18, true);
    ret.uncompsize = view.getUint32(22, true);
    ret.fnamelen = view.getUint16(26, true);
    ret.extralen = view.getUint16(28, true);
    ret.headersize = 30 + ret.fnamelen + ret.extralen;
    ret.allsize = ret.headersize + ret.compsize;
    ret.filename = bytes.subarray(30, 30 + ret.fnamelen);

    return ret;
};

/**
 * @param  {number} offset
 * @return {object}
 */
ZipArchiveReader.prototype._getCentralDirHeader = function(offset) {
    var view = new DataView(this.buffer, offset),
        ret = {};

    ret.signature = view.getUint32(0, true);
    ret.madever = view.getUint16(4, true);
    ret.needver = view.getUint16(6, true);
    ret.option = view.getUint16(8, true);
    ret.comptype = view.getUint16(10, true);
    ret.filetime = view.getUint16(12, true);
    ret.filedate = view.getUint16(14, true);
    ret.crc32 = view.getUint32(16, true);
    ret.compsize = view.getUint32(20, true);
    ret.uncompsize = view.getUint32(24, true);
    ret.fnamelen = view.getUint16(28, true);
    ret.extralen = view.getUint16(30, true);
    ret.commentlen = view.getUint16(32, true);
    ret.disknum = view.getUint16(34, true);
    ret.inattr = view.getUint16(36, true);
    ret.outattr = view.getUint32(38, true);
    ret.headerpos = view.getUint32(42, true);
    ret.allsize = 46 + ret.fnamelen + ret.extralen + ret.commentlen;

    return ret;
};

/**
 * @param  {number} offset
 * @return {object}
 */
ZipArchiveReader.prototype._getEndCentDirHeader = function(offset) {
    var view = new DataView(this.buffer, offset);
    return {
        signature: view.getUint32(0, true),
        disknum: view.getUint16(4, true),
        startdisknum: view.getUint16(6, true),
        diskdirentry: view.getUint16(8, true),
        direntry: view.getUint16(10, true),
        dirsize: view.getUint32(12, true),
        startpos: view.getUint32(16, true),
        commentlen: view.getUint16(20, true)
    };
};

/**
 * @return {Array.<string>} File names
 */
ZipArchiveReader.prototype.getFileNames = function() {
    return this.files.map(function(file) {
        return file.filename;
    });
};

/**
 * @param  {string} filename File name
 * @return {number} File index
 */
ZipArchiveReader.prototype._getFileIndex = function(filename) {
    for (var i = 0, n = this.localFileHeaders.length; i < n; ++i)
    if (filename === this.localFileHeaders[i].filename) return i;
    throw new Error('File is not found.');
};

/**
 * @param  {string} filename File name
 * @return {object} byte offset, byte length and compression flag.
 */
ZipArchiveReader.prototype._getFileInfo = function(filename) {
    var i = this._getFileIndex(filename),
        centralDirHeader = this.centralDirHeaders[i],
        localFileHeader = this.localFileHeaders[i];

    return {
        offset: centralDirHeader.headerpos + localFileHeader.headersize,
        length: localFileHeader.compsize,
        isCompressed: localFileHeader.comptype
    };
};

/**
 * @param  {Uint8Array} bytes        Compressed bytes
 * @param  {boolean}    isCompressed Is file compressed.
 * @return {Uint8Array} Decompressed bytes.
 */
ZipArchiveReader.prototype._decompress = function(bytes, isCompressed) {
    return isCompressed ? algorithms.inflate(bytes) : bytes;
}

/**
 * @param  {string}     filename File name
 * @return {Uint8Array} Decompressed bytes.
 */
ZipArchiveReader.prototype._decompressFile = function(filename) {
    var info = this._getFileInfo(filename);
    return this._decompress(new Uint8Array(this.buffer, info.offset, info.length), info.isCompressed);
}

/**
 * @param  {string} filename File name
 * @return {Promise}
 */
ZipArchiveReader.prototype.readFileAsArrayBuffer = function(filename) {
    return new Promise(function(resolve) {
        resolve(this._decompressFile(filename).buffer);
    }.bind(this));
};

/**
 * @param  {string} type     fileReader.readFileAs[type]
 * @param  {string} filename File name
 * @return {Promise}
 */
ZipArchiveReader.prototype._readFileAs = function(type, filename, encoding) {
    var args = arguments;

    return this.readFileAsBlob(filename).then(function(blob) {
        return utils.readFileAs.call(null, type, blob, encoding);
    });
};

/**
 * @param  {string} filename File name
 * @param  {string} encoding Character encoding
 * @return {Promise}
 */
ZipArchiveReader.prototype.readFileAsText = function(filename, encoding) {
    return this._readFileAs('Text', filename, encoding || 'UTF-8');
};

/**
 * @param  {string} filename File name
 * @return {Promise}
 */
ZipArchiveReader.prototype.readFileAsBinaryString = function(filename) {
    return this._readFileAs('BinaryString', filename);
};

/**
 * @param  {string} filename File name
 * @return {Promise}
 */
ZipArchiveReader.prototype.readFileAsDataURL = function(filename) {
    return this._readFileAs('DataURL', filename);
};

/**
 * @param  {string} filename    File name
 * @param  {string} contentType Content type of file (exp: 'text/plain')
 * @return {Promise}
 */
ZipArchiveReader.prototype.readFileAsBlob = function(filename, contentType) {
    return new Promise(function(resolve) {
        resolve(new Blob([this._decompressFile(filename, false)], {
            type: contentType || mimetypes.guess(filename)
        }));
    }.bind(this));
};

//for worker
if (env.isWorker) {
    /**
     * @param  {string} filename File name
     * @return {ArrayBuffer}
     */
    ZipArchiveReader.prototype.readFileAsArrayBufferSync = function(filename) {
        return this._decompressFile(filename, true).buffer;
    };

    /**
     * @param  {string} filename    File name
     * @param  {string} contentType Content type
     * @return {Blob}
     */
    ZipArchiveReader.prototype.readFileAsBlobSync = function(filename, contentType) {
        return new Blob([this._decompressFile(filename, false)], {
            type: contentType || mimetypes.guess(filename)
        });
    };

    /**
     * @param  {string} filename File name
     * @param  {string} encoding Character encoding
     * @return {string}
     */
    ZipArchiveReader.prototype.readFileAsTextSync = function(filename, encoding) {
        return new FileReaderSync().readAsText(this.readFileAsBlobSync(filename), encoding || 'UTF-8');
    };

    /**
     * @param  {string} filename File name
     * @return {string}
     */
    ZipArchiveReader.prototype.readFileAsBinaryStringSync = function(filename) {
        return new FileReaderSync().readAsBinaryString(this.readFileAsBlobSync(filename));
    };

    /**
     * @param  {string} filename File name
     * @return {string}
     */
    ZipArchiveReader.prototype.readFileAsDataURLSync = function(filename) {
        return new FileReaderSync().readAsDataURL(this.readFileAsBlobSync(filename));
    };

    exposeProperty('readFileAsArrayBufferSync', ZipArchiveReader, ZipArchiveReader.prototype.readFileAsArrayBufferSync);
    exposeProperty('readFileAsBlobSync', ZipArchiveReader, ZipArchiveReader.prototype.readFileAsBlobSync);
    exposeProperty('readFileAsTextSync', ZipArchiveReader, ZipArchiveReader.prototype.readFileAsTextSync);
    exposeProperty('readFileAsBinaryStringSync', ZipArchiveReader, ZipArchiveReader.prototype.readFileAsBinaryStringSync);
    exposeProperty('readFileAsDataURLSync', ZipArchiveReader, ZipArchiveReader.prototype.readFileAsDataURLSync);
}

exposeProperty('getFileNames', ZipArchiveReader, ZipArchiveReader.prototype.getFileNames);
exposeProperty('readFileAsArrayBuffer', ZipArchiveReader, ZipArchiveReader.prototype.readFileAsArrayBuffer);
exposeProperty('readFileAsText', ZipArchiveReader, ZipArchiveReader.prototype.readFileAsText);
exposeProperty('readFileAsBinaryString', ZipArchiveReader, ZipArchiveReader.prototype.readFileAsBinaryString);
exposeProperty('readFileAsDataURL', ZipArchiveReader, ZipArchiveReader.prototype.readFileAsDataURL);
exposeProperty('readFileAsBlob', ZipArchiveReader, ZipArchiveReader.prototype.readFileAsBlob);
