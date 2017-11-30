import {BufferLike, toBytes, defun} from '../common';
import {InflateParams, zlibBackend} from '../core';

export interface ZlibDecompressParams extends InflateParams {}

/**
 * Decompresses RFC 1951 ZLIB file format Uint8Array.
 * 
 * @example
 * const bytes = jz.zlib.decompress({
 *   buffer: buffer,
 *   chunkSize: 0x8000
 * });
 * const bytes2 = jz.zlib.decompress(buffer, 0x8000);
 */
function _decompress(params: ZlibDecompressParams): Uint8Array
function _decompress(buffer: BufferLike, chunkSize?: number): Uint8Array
function _decompress(buffer: BufferLike | any, chunkSize?: number): Uint8Array {
    return zlibBackend.inflate(toBytes(buffer), chunkSize);
}

export const decompress = defun(['buffer', 'chunkSize'], _decompress);
