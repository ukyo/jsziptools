import { ZipArchiveReader, readLocalFileHeader, readCentralDirHeader, readEndCentDirHeader } from './zip_archive_reader';
import { readFileAsArrayBuffer, LOCAL_FILE_SIGNATURE, END_SIGNATURE, defun } from '../common';
/**
 * ZipBlobArchiveReader
 */
class _ZipBlobArchiveReader extends ZipArchiveReader {
    constructor(blob, encoding, chunkSize) {
        super();
        this.blob = blob;
        this.encoding = encoding;
        this.chunkSize = chunkSize;
    }
    init() {
        let blob = this.blob;
        let endCentDirHeader;
        let centralDirHeaders = [];
        let localFileHeaders = [];
        let files = [];
        let folders = [];
        let readChunk = (start, end) => readFileAsArrayBuffer(blob.slice(start, end));
        this.files = files;
        this.folders = folders;
        this.localFileHeaders = localFileHeaders;
        this.centralDirHeaders = centralDirHeaders;
        return (function validateFirstLocalFileSignature() {
            return readChunk(0, 4).then(chunk => {
                if (new DataView(chunk).getUint32(0, true) === LOCAL_FILE_SIGNATURE) {
                    return Math.max(0, blob.size - 0x8000);
                }
                else {
                    throw new Error('zip.unpack: invalid zip file.');
                }
            });
        })()
            .then(function validateEndSignature(offset) {
            return readChunk(offset, Math.min(blob.size, offset + 0x8000)).then(chunk => {
                let view = new DataView(chunk);
                for (let i = chunk.byteLength - 4; i--;) {
                    if (view.getUint32(i, true) === END_SIGNATURE)
                        return offset + i;
                }
                if (offset) {
                    return validateEndSignature(Math.max(offset - 0x8000 + 3, 0));
                }
                else {
                    throw new Error('zip.unpack: invalid zip file.');
                }
            });
        })
            .then((offset) => {
            return readChunk(offset, blob.size).then(buffer => {
                endCentDirHeader = readEndCentDirHeader(buffer, 0);
                return offset;
            });
        })
            .then(function getCentralDirHeaders(end) {
            return readChunk(endCentDirHeader.startpos, end).then(buffer => {
                let offset = 0;
                let header;
                for (let i = 0, n = endCentDirHeader.direntry; i < n; ++i) {
                    header = readCentralDirHeader(buffer, offset);
                    centralDirHeaders.push(header);
                    offset += header.allsize;
                }
            });
        })
            .then(function getLocalFileHeaders(index) {
            if (index === centralDirHeaders.length)
                return;
            let offset = centralDirHeaders[index].headerpos;
            return readChunk(offset + 26, offset + 30).then(buffer => {
                let view = new DataView(buffer);
                let fnamelen = view.getUint16(0, true);
                let extralen = view.getUint16(2, true);
                return readChunk(offset, offset + 30 + fnamelen + extralen);
            }).then(buffer => {
                let header = readLocalFileHeader(buffer, 0);
                header.crc32 = centralDirHeaders[index].crc32;
                header.compsize = centralDirHeaders[index].compsize;
                header.uncompsize = centralDirHeaders[index].uncompsize;
                localFileHeaders.push(header);
                return getLocalFileHeaders(index + 1);
            });
        }.bind(null, 0))
            .then(this._completeInit.bind(this));
    }
    _decompressFile(fileName) {
        let info = this._getFileInfo(fileName);
        let blob = this.blob.slice(info.offset, info.offset + info.length);
        return readFileAsArrayBuffer(blob).then(ab => this._decompress(new Uint8Array(ab), info.isCompressed));
    }
    _decompressFileSync(fileName) {
        let info = this._getFileInfo(fileName);
        let blob = this.blob.slice(info.offset, info.offset + info.length);
        let bytes = new Uint8Array(new FileReaderSync().readAsArrayBuffer(blob));
        return this._decompress(bytes, info.isCompressed);
    }
}
export const ZipBlobArchiveReader = defun(['blob', 'encoding', 'chunkSize'], _ZipBlobArchiveReader);
ZipBlobArchiveReader.prototype = _ZipBlobArchiveReader.prototype;
