import { defun, toBytes } from '../../common';
import { zlibBackend } from '../../core';
function _compress(buffer, streamFn, level, shareMemory, chunkSize) {
    zlibBackend.stream.deflate(toBytes(buffer), streamFn, level, shareMemory, chunkSize);
}
export const compress = defun(['buffer', 'streamFn', 'level', 'shareMemory', 'chunkSize'], _compress);
