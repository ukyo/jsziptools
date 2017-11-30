import { defun, toBytes } from '../common';
import { zlibBackend } from './zlib_backend_wrapper';
function _inflate(buffer, chunkSize) {
    return zlibBackend.rawInflate(toBytes(buffer), chunkSize);
}
export const inflate = defun(['buffer', 'chunkSize'], _inflate);
