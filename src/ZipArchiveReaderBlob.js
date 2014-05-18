/**
 * @constructor
 * @param {object} params
 */
var ZipArchiveReaderBlob = defun(['buffer', 'encoding', 'chunkSize'], function ZipArchiveReaderBlob(buffer, encoding, chunkSize) {
    this.blob = buffer;
    this.encoding = encoding;
    this.chunkSize = chunkSize;
});

ZipArchiveReaderBlob.prototype = Object.create(ZipArchiveReader.prototype);
ZipArchiveReaderBlob.prototype.constructor = ZipArchiveReaderBlob;

/**
 * @return {Promise}
 */
ZipArchiveReaderBlob.prototype.init = function() {
    var blob = this.blob,
        self = this,
        endCentDirHeader, centralDirHeaders = [],
        localFileHeaders = [],
        files = [],
        folders = [];

    this.files = files;
    this.folders = folders;
    this.localFileHeaders = localFileHeaders;
    this.centralDirHeaders = centralDirHeaders;

    function readChunk(start, end) {
        return utils.readFileAsArrayBuffer(blob.slice(start, end));
    }

    return (function validateFirstLocalFileSignature() {
        return readChunk(0, 4).then(function(chunk) {
            if (new DataView(chunk).getUint32(0, true) === zip.LOCAL_FILE_SIGNATURE) {
                return Math.max(0, blob.size - 0x8000);
            } else {
                throw new Error('zip.unpack: invalid zip file.');
            }
        });
    })()

    .then(function validateEndSignature(offset) {
        return readChunk(offset, Math.min(blob.size, offset + 0x8000)).then(function(buffer) {
            var dv = new DataView(buffer),
                i, n;

            for (i = buffer.byteLength - 4; i--;)
            if (dv.getUint32(i, true) === zip.END_SIGNATURE) return offset + i;

            if (offset) {
                return validateEndSignature(Math.max(offset - 0x8000 + 3, 0));
            } else {
                throw new Error('zip.unpack: invalid zip file.');
            }
        });
    })

    .then(function getEndCentDirHeader(offset) {
        return readChunk(offset, blob.size).then(function(buffer) {
            endCentDirHeader = ZipArchiveReader.prototype._getEndCentDirHeader.call({
                buffer: buffer
            }, 0);
            return offset;
        });
    })

    .then(function getCentralDirHeaders(end) {
        return readChunk(endCentDirHeader.startpos, end).then(function(buffer) {
            var offset = 0,
                context = {
                    buffer: buffer
                },
                i, n, header;

            for (i = 0, n = endCentDirHeader.direntry; i < n; ++i) {
                header = ZipArchiveReader.prototype._getCentralDirHeader.call(context, offset);
                centralDirHeaders.push(header);
                offset += header.allsize;
            }
        });
    })

    .then(function getLocalFileHeaders(index) {
        if (index === centralDirHeaders.length) return;

        var offset = centralDirHeaders[index].headerpos;

        return readChunk(offset + 26, offset + 30).then(function(buffer) {
            var view = new DataView(buffer),
                fnamelen = view.getUint16(0, true),
                extralen = view.getUint16(2, true);
            return readChunk(offset, offset + 30 + fnamelen + extralen);
        }).then(function(buffer) {
            var header = ZipArchiveReader.prototype._getLocalFileHeader.call({
                buffer: buffer
            }, 0);
            header.crc32 = centralDirHeaders[index].crc32;
            header.compsize = centralDirHeaders[index].compsize;
            header.uncompsize = centralDirHeaders[index].uncompsize;
            localFileHeaders.push(header);
            return getLocalFileHeaders(index + 1);
        });
    }.bind(null, 0))

    .then(this._completeInit.bind(this));
};

/**
 * @param  {string} filename File name
 * @return {Promise}
 */
ZipArchiveReaderBlob.prototype.readFileAsArrayBuffer = function(filename) {
    return this._readFileAs('ArrayBuffer', filename);
};

/**
 * @param  {string} filename    File name
 * @param  {string} contentType Content type
 * @return {Promise}
 */
ZipArchiveReaderBlob.prototype.readFileAsBlob = function(filename, contentType) {
    contentType = contentType || mimetypes.guess(filename);

    var info = this._getFileInfo(filename),
        blob = this.blob.slice(info.offset, info.offset + info.length, {
            type: contentType
        });

    if (!info.isCompressed) return Promise.resolve(blob);
    return utils.readFileAsArrayBuffer(blob).then(function(buffer) {
        return new Blob([algorithms.inflate(new Uint8Array(buffer))], {
            type: contentType
        });
    });
};

if (env.isWorker) {
    /**
     * @param  {string}  filename File name
     * @return {Uint8Array}
     */
    ZipArchiveReaderBlob.prototype._decompressFile = function(filename) {
        var info = this._getFileInfo(filename),
            blob = this.blob.slice(info.offset, info.offset + info.length),
            bytes = new Uint8Array(new FileReaderSync().readAsArrayBuffer(blob));
        return this._decompress(bytes, info.isCompressed);
    };

    /**
     * @param  {string} filename File name
     * @return {ArrayBuffer}
     */
    ZipArchiveReaderBlob.prototype.readFileAsArrayBufferSync = function(filename) {
        return this._decompressFile(filename, true).buffer;
    };

    /**
     * @param  {string} filename    File name
     * @param  {string} contentType Content type
     * @return {Blob}
     */
    ZipArchiveReaderBlob.prototype.readFileAsBlobSync = function(filename, contentType) {
        return new Blob([this._decompressFile(filename, false)], {
            type: contentType || mimetypes.guess(filename)
        });
    };

    exposeProperty('readFileAsArrayBufferSync', ZipArchiveReaderBlob, ZipArchiveReaderBlob.prototype.readFileAsArrayBufferSync);
    exposeProperty('readFileAsBlobSync', ZipArchiveReaderBlob, ZipArchiveReaderBlob.prototype.readFileAsBlobSync);
    exposeProperty('readFileAsTextSync', ZipArchiveReaderBlob, ZipArchiveReaderBlob.prototype.readFileAsTextSync);
    exposeProperty('readFileAsBinaryStringSync', ZipArchiveReaderBlob, ZipArchiveReaderBlob.prototype.readFileAsBinaryStringSync);
    exposeProperty('readFileAsDataURLSync', ZipArchiveReaderBlob, ZipArchiveReaderBlob.prototype.readFileAsDataURLSync);
}

exposeProperty('readFileAsArrayBuffer', ZipArchiveReaderBlob, ZipArchiveReaderBlob.prototype.readFileAsArrayBuffer);
exposeProperty('readFileAsText', ZipArchiveReaderBlob, ZipArchiveReaderBlob.prototype.readFileAsText);
exposeProperty('readFileAsBinaryString', ZipArchiveReaderBlob, ZipArchiveReaderBlob.prototype.readFileAsBinaryString);
exposeProperty('readFileAsDataURL', ZipArchiveReaderBlob, ZipArchiveReaderBlob.prototype.readFileAsDataURL);
exposeProperty('readFileAsBlob', ZipArchiveReaderBlob, ZipArchiveReaderBlob.prototype.readFileAsBlob);
exposeProperty('readFileAsTextSync', ZipArchiveReaderBlob, ZipArchiveReaderBlob.prototype.readFileAsTextSync);
exposeProperty('readFileAsBinaryStringSync', ZipArchiveReaderBlob, ZipArchiveReaderBlob.prototype.readFileAsBinaryStringSync);
exposeProperty('readFileAsDataURLSync', ZipArchiveReaderBlob, ZipArchiveReaderBlob.prototype.readFileAsDataURLSync);
