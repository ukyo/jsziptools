import { concatBytes, detectEncoding, bytesToString, readFileAsText, readFileAsDataURL, ENV_IS_WORKER } from '../common';
import { inflate } from '../core';
/**
 * ZipArchiveReader
 *
 * @example
 * jz.zip.unpack(buffer).then(reader => {
 *   const fileNames = reader.getFileNames();
 *   reader.readFileAsText(fileNames[0]).then(text => {
 *     console.log(text);
 *   });
 *   // You can use sync methods in web worker.
 *   console.log(reader.readFileAsTextSync(fileNames[0]));
 * });
 */
export class ZipArchiveReader {
    getFileNames() {
        return this.files.map(f => f.fileName);
    }
    readFileAsArrayBuffer(fileName) {
        return this._decompressFile(fileName).then(bytes => bytes.buffer);
    }
    readFileAsBlob(fileName, contentType) {
        return this._decompressFile(fileName).then(bytes => new Blob([bytes], { type: contentType }));
    }
    readFileAsText(fileName, encoding = 'UTF-8') {
        return this.readFileAsBlob(fileName).then(blob => readFileAsText(blob, encoding));
    }
    readFileAsDataURL(fileName) {
        return this.readFileAsBlob(fileName).then(readFileAsDataURL);
    }
    readFileAsArrayBufferSync(fileName) {
        if (!ENV_IS_WORKER)
            throw new Error('ZipArchiveReader#readFileAsArrayBufferSync is available on only a worker process.');
        return this._decompressFileSync(fileName).buffer;
    }
    readFileAsBlobSync(fileName, contentType) {
        if (!ENV_IS_WORKER)
            throw new Error('ZipArchiveReader#readFileAsBlobSync is available on only a worker process.');
        return new Blob([this._decompressFileSync(fileName)], { type: contentType });
    }
    readFileAsTextSync(fileName, encoding = 'UTF-8') {
        if (!ENV_IS_WORKER)
            throw new Error('ZipArchiveReader#readFileAsTextSync is available on only a worker process.');
        return new FileReaderSync().readAsText(this.readFileAsBlobSync(fileName), encoding);
    }
    readFileAsDataURLSync(fileName) {
        if (!ENV_IS_WORKER)
            throw new Error('ZipArchiveReader#readFileAsDataURLSync is available on only a worker process.');
        return new FileReaderSync().readAsDataURL(this.readFileAsBlobSync(fileName));
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
    _getFileIndex(fileName) {
        for (let i = 0, n = this.localFileHeaders.length; i < n; ++i)
            if (fileName === this.localFileHeaders[i].fileName)
                return i;
        throw new Error('File is not found.');
    }
    _getFileInfo(fileName) {
        let i = this._getFileIndex(fileName);
        let centralDirHeader = this.centralDirHeaders[i];
        let localFileHeader = this.localFileHeaders[i];
        return {
            offset: centralDirHeader.headerpos + localFileHeader.headersize,
            length: localFileHeader.compsize,
            isCompressed: !!localFileHeader.comptype
        };
    }
    _decompress(bytes, isCompressed) {
        return isCompressed ? inflate({ buffer: bytes, chunkSize: this.chunkSize }) : new Uint8Array(bytes);
    }
}
export function readEndCentDirHeader(buffer, offset) {
    let view = new DataView(buffer, offset);
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
}
export function readCentralDirHeader(buffer, offset) {
    let view = new DataView(buffer, offset);
    let centralDirHeader = {};
    centralDirHeader.signature = view.getUint32(0, true);
    centralDirHeader.madever = view.getUint16(4, true);
    centralDirHeader.needver = view.getUint16(6, true);
    centralDirHeader.option = view.getUint16(8, true);
    centralDirHeader.comptype = view.getUint16(10, true);
    centralDirHeader.filetime = view.getUint16(12, true);
    centralDirHeader.filedate = view.getUint16(14, true);
    centralDirHeader.crc32 = view.getUint32(16, true);
    centralDirHeader.compsize = view.getUint32(20, true);
    centralDirHeader.uncompsize = view.getUint32(24, true);
    centralDirHeader.fnamelen = view.getUint16(28, true);
    centralDirHeader.extralen = view.getUint16(30, true);
    centralDirHeader.commentlen = view.getUint16(32, true);
    centralDirHeader.disknum = view.getUint16(34, true);
    centralDirHeader.inattr = view.getUint16(36, true);
    centralDirHeader.outattr = view.getUint32(38, true);
    centralDirHeader.headerpos = view.getUint32(42, true);
    centralDirHeader.allsize = 46 + centralDirHeader.fnamelen + centralDirHeader.extralen + centralDirHeader.commentlen;
    return centralDirHeader;
}
export function readLocalFileHeader(buffer, offset) {
    let view = new DataView(buffer, offset);
    let bytes = new Uint8Array(buffer, offset);
    let localFileHeader = {};
    localFileHeader.signature = view.getUint32(0, true);
    localFileHeader.needver = view.getUint16(4, true);
    localFileHeader.option = view.getUint16(6, true);
    localFileHeader.comptype = view.getUint16(8, true);
    localFileHeader.filetime = view.getUint16(10, true);
    localFileHeader.filedate = view.getUint16(12, true);
    localFileHeader.crc32 = view.getUint32(14, true);
    localFileHeader.compsize = view.getUint32(18, true);
    localFileHeader.uncompsize = view.getUint32(22, true);
    localFileHeader.fnamelen = view.getUint16(26, true);
    localFileHeader.extralen = view.getUint16(28, true);
    localFileHeader.headersize = 30 + localFileHeader.fnamelen + localFileHeader.extralen;
    localFileHeader.allsize = localFileHeader.headersize + localFileHeader.compsize;
    localFileHeader.fileNameAsBytes = bytes.subarray(30, 30 + localFileHeader.fnamelen);
    return localFileHeader;
}
