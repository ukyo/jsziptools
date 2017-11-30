import { toBytes, LOCAL_FILE_SIGNATURE, DATA_DESCRIPTOR_SIGNATURE, CENTRAL_DIR_SIGNATURE, END_SIGNATURE, defun } from '../common';
import { crc32 } from '../core';
import { deflate } from '../stream/core';
/**
 * ZipArchiveWriter
 *
 * @example
 * const writer = new ZipArchiveWriter();
 * writer.on("data", chunk => console.log(chunk));
 * writer.on("end", () => console.log(chunk));
 * writer.writeFile("foo.mp3", mp3Buffer);
 * writer.writeFile("bar.txt", "hello world!");
 * wirter.writeEnd();
 */
class _ZipArchiveWriter {
    constructor(shareMemory, chunkSize) {
        this.shareMemory = shareMemory;
        this.chunkSize = chunkSize;
        this.dirs = {};
        this.centralDirHeaders = [];
        this.offset = 0;
        this.date = new Date();
        this.listeners = {};
    }
    write(path, buffer, level) {
        path.split('/').reduce((parent, child) => {
            this.writeDir(parent + '/');
            return `${parent}/${child}`;
        });
        this.writeFile(path, buffer, level);
    }
    writeDir(path) {
        let localFileHeader;
        path += (/.+\/$/.test(path) ? '' : '/');
        if (!this.dirs[path]) {
            this.dirs[path] = true;
            let pathAsBytes = toBytes(path);
            localFileHeader = createLocalFileHeader(pathAsBytes, this.date, false);
            this.centralDirHeaders.push(createCentralDirHeader(pathAsBytes, this.date, false, this.offset, 0, 0, 0));
            this.trigger('data', localFileHeader);
            this.offset += localFileHeader.length;
        }
        return this;
    }
    writeFile(path, buffer, level) {
        let pathAsBytes = toBytes(path);
        let offset = this.offset;
        let localFileHeader = createLocalFileHeader(pathAsBytes, this.date, !!level);
        let compressedSize = 0;
        let dataDescriptor;
        let _crc32;
        let bytes = toBytes(buffer);
        this.trigger('data', localFileHeader);
        if (level) {
            deflate({
                buffer: bytes,
                level,
                streamFn: chunk => {
                    compressedSize += chunk.length;
                    this.trigger('data', chunk);
                },
                shareMemory: this.shareMemory,
                chunkSize: this.chunkSize
            });
        }
        else {
            compressedSize = bytes.length;
            this.trigger('data', bytes);
        }
        _crc32 = crc32(bytes);
        dataDescriptor = createDataDescriptor(_crc32, compressedSize, bytes.length);
        this.trigger('data', dataDescriptor);
        this.centralDirHeaders.push(createCentralDirHeader(pathAsBytes, this.date, !!level, offset, bytes.length, compressedSize, _crc32));
        this.offset += localFileHeader.length + compressedSize + dataDescriptor.length;
        return this;
    }
    writeEnd() {
        let centralDirHeaderSize = 0;
        this.centralDirHeaders.forEach(header => {
            centralDirHeaderSize += header.length;
            this.trigger('data', header);
        });
        this.trigger('data', createEndCentDirHeader(this.centralDirHeaders.length, centralDirHeaderSize, this.offset));
        this.trigger('end', null);
    }
    on(name, callback) {
        if (!this.listeners[name])
            this.listeners[name] = [];
        this.listeners[name].push(callback);
        return this;
    }
    trigger(name, data) {
        if (!this.listeners[name])
            return;
        this.listeners[name].forEach(listner => listner(data));
    }
}
export const ZipArchiveWriter = defun(['shareMemory', 'chunkSize'], _ZipArchiveWriter);
ZipArchiveWriter.prototype = _ZipArchiveWriter.prototype;
function createLocalFileHeader(fileName, date, isDeflated) {
    let view = new DataView(new ArrayBuffer(30 + fileName.length));
    let bytes = new Uint8Array(view.buffer);
    let offset = 0;
    view.setUint32(offset, LOCAL_FILE_SIGNATURE, true);
    offset += 4; // local file header signature
    view.setUint16(offset, 20, true);
    offset += 2; // version needed to extract
    view.setUint16(offset, 0x0808);
    offset += 2; // general purpose bit flag
    view.setUint16(offset, isDeflated ? 8 : 0, true);
    offset += 2; // compression method
    view.setUint16(offset, createDosFileTime(date), true);
    offset += 2; // last mod file time
    view.setUint16(offset, createDosFileDate(date), true);
    offset += 2; // last mod file date
    // skip below
    // crc-32 4bytes
    // compressed size 4bytes
    // uncompressed size 4bytes
    offset += 12;
    view.setUint16(offset, fileName.length, true);
    offset += 2; // file name length
    offset += 2; // skip extra field length
    bytes.set(fileName, offset);
    return bytes;
}
function createDataDescriptor(crc32, compressedSize, uncompressedSize) {
    let view = new DataView(new ArrayBuffer(16));
    view.setUint32(0, DATA_DESCRIPTOR_SIGNATURE, true);
    view.setUint32(4, crc32, true);
    view.setUint32(8, compressedSize, true);
    view.setUint32(12, uncompressedSize, true);
    return new Uint8Array(view.buffer);
}
function createCentralDirHeader(fileName, date, isDeflated, fileOffset, uncompressedSize, compressedSize, crc) {
    let view = new DataView(new ArrayBuffer(46 + fileName.length));
    let bytes = new Uint8Array(view.buffer);
    let offset = 0;
    view.setUint32(offset, CENTRAL_DIR_SIGNATURE, true);
    offset += 4; // central file header signature
    view.setUint16(offset, 20, true);
    offset += 2; // version made by (2.0)
    view.setUint16(offset, 20, true);
    offset += 2; // version needed to extract
    view.setUint16(offset, 0x0808);
    offset += 2; // general purpose bit flag (use utf8, data discriptor)
    view.setUint16(offset, isDeflated ? 8 : 0, true);
    offset += 2; // compression method
    view.setUint16(offset, createDosFileTime(date), true);
    offset += 2; // last mod file time
    view.setUint16(offset, createDosFileDate(date), true);
    offset += 2; // last mod file date
    view.setUint32(offset, crc, true);
    offset += 4; // crc-32
    view.setUint32(offset, compressedSize, true);
    offset += 4; // compressed size
    view.setUint32(offset, uncompressedSize, true);
    offset += 4; // uncompressed size
    view.setUint16(offset, fileName.length, true);
    offset += 2; // file name length
    // skip below
    // extra field length 2bytes
    // file comment length 2bytes
    // disk number start 2bytes
    // internal file attributes 2bytes
    // external file attributes 4bytes
    offset += 12;
    view.setUint32(offset, fileOffset, true);
    offset += 4; // relative offset of local header
    bytes.set(fileName, offset); // file name
    return bytes;
}
function createEndCentDirHeader(numberOfCentralDirs, centralDirHeaderSize, centralDirStartOffset) {
    let view = new DataView(new ArrayBuffer(22));
    view.setUint32(0, END_SIGNATURE, true); // end of central dir signature
    view.setUint16(4, 0, true); // number of this disk
    view.setUint16(6, 0, true); // number of the disk with the start of the central directory
    view.setUint16(8, numberOfCentralDirs, true); // total number of entries in the central directory on this disk
    view.setUint16(10, numberOfCentralDirs, true); // total number of entries in the central directory
    view.setUint32(12, centralDirHeaderSize, true); // size of the central directory
    view.setUint32(16, centralDirStartOffset, true); // offset of start of central directory with respect to the starting disk number
    view.setUint16(20, 0, true); // .ZIP file comment length
    return new Uint8Array(view.buffer);
}
function createDosFileDate(date) {
    return ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | (date.getDay());
}
function createDosFileTime(date) {
    return (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1);
}
