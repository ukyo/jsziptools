import {BufferLike, toBytes, defun} from '../common';
import {DeflateParams, zlibBackend} from '../core';

export interface ZlibCompressParams extends DeflateParams {}

/**
 * Compresses Uint8Array to a RFC 1951 ZLIB file format Uint8Array.
 * 
 * @example
 * const bytes = jz.zlib.compress({
 *   buffer: buffer,
 *   level: 6,
 *   chunkSize: 0x8000
 * });
 * const bytes2 = jz.zlib.compress(buffer, 6, 0x8000);
 */
function _compress(params: ZlibCompressParams): Uint8Array
function _compress(buffer: BufferLike, level?: number, chunkSize?: number): Uint8Array
function _compress(buffer: any, level?: number, chunkSize?: number): Uint8Array {
    return zlibBackend.deflate(toBytes(buffer), level, chunkSize);
}

export const compress = defun(['buffer', 'level', 'chunkSize'], _compress);
