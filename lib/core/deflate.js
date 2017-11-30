import { defun, toBytes } from '../common';
import { zlibBackend } from './zlib_backend_wrapper';
function _deflate(buffer, level, chunkSize) {
    return zlibBackend.rawDeflate(toBytes(buffer), level, chunkSize);
}
export const deflate = defun(['buffer', 'level', 'chunkSize'], _deflate);
