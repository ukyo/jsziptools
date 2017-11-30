import { defun, toBytes } from '../../common';
import { zlibBackend } from '../../core';
function _decompress(buffer, streamFn, shareMemory, chunkSize) {
    zlibBackend.stream.inflate(toBytes(buffer), streamFn, shareMemory, chunkSize);
}
export const decompress = defun(['buffer', 'streamFn', 'shareMemory', 'chunkSize'], _decompress);
