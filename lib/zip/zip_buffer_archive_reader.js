import { toBytes, LOCAL_FILE_SIGNATURE, END_SIGNATURE, concatBytes, detectEncoding, bytesToString, defun } from '../common';
import { ZipArchiveReader, readLocalFileHeader, readCentralDirHeader, readEndCentDirHeader } from './zip_archive_reader';
class _ZipBufferArchiveReader extends ZipArchiveReader {
    constructor(buffer, encoding, chunkSize) {
        super();
        this.buffer = buffer;
        this.encoding = encoding;
        this.chunkSize = chunkSize;
        this.bytes = toBytes(this.buffer);
        this.init = this.init.bind(this);
    }
    init() {
        let signature;
        let localFileHeader;
        let centralDirHeader;
        let endCentDirHeader;
        let i;
        let n;
        let bytes = this.bytes;
        let localFileHeaders = [];
        let centralDirHeaders = [];
        let files = [];
        let folders = [];
        let offset = bytes.byteLength - 4;
        let view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        this.files = files;
        this.folders = folders;
        this.localFileHeaders = localFileHeaders;
        this.centralDirHeaders = centralDirHeaders;
        // check the first local file signature
        if (view.getUint32(0, true) !== LOCAL_FILE_SIGNATURE) {
            throw new Error('zip.unpack: invalid zip file');
        }
        // read the end central dir header.
        while (true) {
            if (view.getUint32(offset, true) === END_SIGNATURE) {
                endCentDirHeader = readEndCentDirHeader(this.bytes.buffer, offset);
                break;
            }
            offset--;
            if (offset === 0)
                throw new Error('zip.unpack: invalid zip file');
        }
        // read central dir headers.
        offset = endCentDirHeader.startpos;
        for (i = 0, n = endCentDirHeader.direntry; i < n; ++i) {
            centralDirHeader = readCentralDirHeader(this.bytes.buffer, this.bytes.byteOffset + offset);
            centralDirHeaders.push(centralDirHeader);
            offset += centralDirHeader.allsize;
        }
        // read local file headers.
        for (i = 0; i < n; ++i) {
            offset = centralDirHeaders[i].headerpos;
            localFileHeader = readLocalFileHeader(this.bytes.buffer, this.bytes.byteOffset + offset);
            localFileHeader.crc32 = centralDirHeaders[i].crc32;
            localFileHeader.compsize = centralDirHeaders[i].compsize;
            localFileHeader.uncompsize = centralDirHeaders[i].uncompsize;
            localFileHeaders.push(localFileHeader);
        }
        return this._completeInit();
    }
    _completeInit() {
        let files = this.files;
        let folders = this.folders;
        let localFileHeaders = this.localFileHeaders;
        let promise;
        localFileHeaders.forEach(header => {
            // Is the last char '/'.
            (header.fileNameAsBytes[header.fileNameAsBytes.length - 1] !== 47 ? files : folders).push(header);
        });
        // detect encoding. cp932 or utf-8.
        if (this.encoding == null) {
            promise = Promise.resolve(localFileHeaders.slice(0, 100).map(header => header.fileNameAsBytes))
                .then(concatBytes)
                .then(detectEncoding)
                .then(e => this.encoding = e);
        }
        else {
            promise = Promise.resolve();
        }
        return promise.then(() => Promise.all(localFileHeaders.map(h => {
            return bytesToString(h.fileNameAsBytes, this.encoding).then(s => h.fileName = s);
        })))
            .then(() => this);
    }
    _decompressFile(fileName) {
        let info = this._getFileInfo(fileName);
        return new Promise(resolve => {
            resolve(this._decompress(this.bytes.subarray(info.offset, info.offset + info.length), info.isCompressed));
        });
    }
    _decompressFileSync(fileName) {
        let info = this._getFileInfo(fileName);
        return this._decompress(this.bytes.subarray(info.offset, info.offset + info.length), info.isCompressed);
    }
}
export const ZipBufferArchiveReader = defun(['buffer', 'encoding', 'chunkSize'], _ZipBufferArchiveReader);
ZipBufferArchiveReader.prototype = _ZipBufferArchiveReader.prototype;
