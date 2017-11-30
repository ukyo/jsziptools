import { defun, toBytes } from '../../common';
import { crc32 } from '../../core';
import { inflate } from '../core';
function _decompress(buffer, streamFn, shareMemory, chunkSize) {
    const bytes = toBytes(buffer);
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    let flg;
    let ret;
    let crc;
    let offset = 10;
    if (view.getUint16(0) !== 0x1F8B)
        throw new Error('jz.gz.decompress: invalid gzip file.');
    if (bytes[2] !== 0x8)
        throw new Error('jz.gz.decompress: not deflate.');
    flg = bytes[3];
    // fextra
    if (flg & 0x4)
        offset += view.getUint16(offset, true) + 2;
    // fname
    if (flg & 0x8)
        while (bytes[offset++])
            ;
    // fcomment
    if (flg & 0x10)
        while (bytes[offset++])
            ;
    // fhcrc
    if (flg & 0x2)
        offset += 2;
    inflate({
        buffer: bytes.subarray(offset, bytes.length - 8),
        streamFn(chunk) {
            crc = crc32(chunk, crc);
            streamFn(chunk);
        },
        shareMemory,
        chunkSize
    });
    if (crc !== view.getUint32(bytes.length - 8, true)) {
        throw new Error('js.stream.gz.decompress: file is broken.');
    }
}
export const decompress = defun(['buffer', 'streamFn', 'shareMemory', 'chunkSize'], _decompress);
