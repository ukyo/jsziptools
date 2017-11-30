import { defun, toBytes } from '../../common';
import { zlibBackend } from '../../core';
function _deflate(buffer, streamFn, level, shareMemory, chunkSize) {
    zlibBackend.stream.rawDeflate(toBytes(buffer), streamFn, level, shareMemory, chunkSize);
}
export const deflate = defun(['buffer', 'streamFn', 'level', 'shareMemory', 'chunkSize'], _deflate);
