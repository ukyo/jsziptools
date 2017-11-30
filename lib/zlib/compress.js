import { toBytes, defun } from '../common';
import { zlibBackend } from '../core';
function _compress(buffer, level, chunkSize) {
    return zlibBackend.deflate(toBytes(buffer), level, chunkSize);
}
export const compress = defun(['buffer', 'level', 'chunkSize'], _compress);
