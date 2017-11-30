import {ZipArchiveReader, ZipLocalFileHeader, ZipCentralDirHeader, ZipEndCentDirHeader, readLocalFileHeader, readCentralDirHeader, readEndCentDirHeader} from './zip_archive_reader';
import {readFileAsArrayBuffer, LOCAL_FILE_SIGNATURE, END_SIGNATURE, defun} from '../common';

export interface ZipBlobArchiveReaderConstructorParams {
    blob: Blob
    encoding?: string
    chunkSize?: number
}

/**
 * ZipBlobArchiveReader
 */
class _ZipBlobArchiveReader extends ZipArchiveReader {
    private blob: Blob;

    constructor(params: ZipBlobArchiveReaderConstructorParams)
    constructor(blob: Blob, encoding?: string, chunkSize?: number)
    constructor(blob: any, encoding?: string, chunkSize?: number) {
        super();
        this.blob = blob;
        this.encoding = encoding;
        this.chunkSize = chunkSize;
    }

    init() {
        let blob = this.blob;
        let endCentDirHeader: ZipEndCentDirHeader;
        let centralDirHeaders: ZipCentralDirHeader[] = [];
        let localFileHeaders: ZipLocalFileHeader[] = [];
        let files: ZipLocalFileHeader[] = [];
        let folders: ZipLocalFileHeader[] = [];
        let readChunk = (start: number, end: number) => readFileAsArrayBuffer(blob.slice(start, end));

        this.files = files;
        this.folders = folders;
        this.localFileHeaders = localFileHeaders;
        this.centralDirHeaders = centralDirHeaders;

        return (function validateFirstLocalFileSignature() {
            return readChunk(0, 4).then(chunk => {
                if (new DataView(chunk).getUint32(0, true) === LOCAL_FILE_SIGNATURE) {
                    return Math.max(0, blob.size - 0x8000);
                } else {
                    throw new Error('zip.unpack: invalid zip file.');
                }
            });
        })()
        .then(function validateEndSignature(offset: number): Promise<number> {
            return readChunk(offset, Math.min(blob.size, offset + 0x8000)).then(chunk => {
                let view = new DataView(chunk);

                for (let i = chunk.byteLength - 4; i--;) {
                    if (view.getUint32(i, true) === END_SIGNATURE) return offset + i;
                }

                if (offset) {
                    return validateEndSignature(Math.max(offset - 0x8000 + 3, 0));
                } else {
                    throw new Error('zip.unpack: invalid zip file.');
                }
            });
        })
        .then((offset: number) => {
            return readChunk(offset, blob.size).then(buffer => {
                endCentDirHeader = readEndCentDirHeader(buffer, 0);
                return offset;
            });
        })
        .then(function getCentralDirHeaders(end: number) {
            return readChunk(endCentDirHeader.startpos, end).then(buffer => {
                let offset = 0;
                let header: ZipCentralDirHeader;

                for (let i = 0, n = endCentDirHeader.direntry; i < n; ++i) {
                    header = readCentralDirHeader(buffer, offset);
                    centralDirHeaders.push(header);
                    offset += header.allsize;
                }
            });
        })
        .then(function getLocalFileHeaders(index: number): Promise<any> {
            if (index === centralDirHeaders.length) return;

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

    protected _decompressFile(fileName: string): Promise<Uint8Array> {
        let info = this._getFileInfo(fileName);
        let blob = this.blob.slice(info.offset, info.offset + info.length);
        return readFileAsArrayBuffer(blob).then(ab => this._decompress(new Uint8Array(ab), info.isCompressed));
    }

    protected _decompressFileSync(fileName: string) {
        let info = this._getFileInfo(fileName);
        let blob = this.blob.slice(info.offset, info.offset + info.length);
        let bytes = new Uint8Array(new FileReaderSync().readAsArrayBuffer(blob));
        return this._decompress(bytes, info.isCompressed);
    }
}

export const ZipBlobArchiveReader = defun(['blob', 'encoding', 'chunkSize'], _ZipBlobArchiveReader);
ZipBlobArchiveReader.prototype = _ZipBlobArchiveReader.prototype;
