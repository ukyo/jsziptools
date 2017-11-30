import { defun, toBytes } from '../../common';
import { zlibBackend } from '../../core/zlib_backend_wrapper';
function _inflate(buffer, streamFn, shareMemory, chunkSize) {
    zlibBackend.stream.rawInflate(toBytes(buffer), streamFn, shareMemory, chunkSize);
}
export const inflate = defun(['buffer', 'streamFn', 'shareMemory', 'chunkSize'], _inflate);
