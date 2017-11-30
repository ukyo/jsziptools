import { defun, toBytes } from '../../common';
import { crc32 } from '../../core';
import { deflate } from '../core';
function _compress(buffer, streamFn, level, shareMemory, chunkSize, fname, fcomment) {
    const bytes = toBytes(buffer);
    let flg = 0;
    let headerLength = 10;
    let offset = 0;
    let now = Date.now();
    let header;
    let footer;
    let headerView;
    let _fname = fname && toBytes(fname);
    let _fcomment = fcomment && toBytes(fcomment);
    // add length of metadatas
    if (_fname) {
        headerLength += _fname.length + 1;
        flg |= 0x8;
    }
    if (_fcomment) {
        headerLength += _fcomment.length + 1;
        flg |= 0x10;
    }
    // write header
    header = new Uint8Array(headerLength);
    headerView = new DataView(header.buffer);
    headerView.setUint32(offset, 0x1F8B0800 | flg); // gzip header and flags
    offset += 4;
    headerView.setUint32(offset, now, true); // modificated
    offset += 4;
    headerView.setUint16(offset, 0x04FF);
    offset += 2;
    // add metadatas to header
    if (_fname) {
        header.set(_fname, offset);
        offset += _fname.length;
        header[offset++] = 0;
    }
    if (_fcomment) {
        header.set(_fcomment, offset);
        offset += _fcomment.length;
        header[offset++] = 0;
    }
    streamFn(header);
    // write body
    deflate({
        buffer: bytes,
        streamFn: streamFn,
        shareMemory: shareMemory,
        chunkSize: chunkSize
    });
    // write footer
    footer = new Uint8Array(8);
    headerView = new DataView(footer.buffer);
    headerView.setUint32(0, crc32(bytes), true); // crc checksum
    headerView.setUint32(4, bytes.length, true); // isize
    streamFn(footer);
}
export const compress = defun(['buffer', 'streamFn', 'level', 'shareMemory', 'chunkSize', 'fname', 'fcomment'], _compress);
