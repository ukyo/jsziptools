import { toBytes, defun } from '../common';
import { zlibBackend } from '../core';
function _decompress(buffer, chunkSize) {
    return zlibBackend.inflate(toBytes(buffer), chunkSize);
}
export const decompress = defun(['buffer', 'chunkSize'], _decompress);
