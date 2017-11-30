import {defun, BufferLike, toBytes} from '../common';
import {zlibBackend} from './zlib_backend_wrapper';

export interface DeflateParams {
    buffer: BufferLike
    level?: number
    chunkSize?: number
}

/**
 * Compresses Uint8Array to a RFC 1950 ZLIB Compressed data format Uint8Array.
 * 
 * @example
 * const bytes = jz.core.deflate({
 *   buffer: buffer,
 *   level: 6,
 *   chunkSize: 0x8000
 * });
 * const bytes2 = jz.core.deflate(buffer, 6, 0x8000);
 */
function _deflate(params: DeflateParams): Uint8Array
function _deflate(buffer: BufferLike, level?: number, chunkSize?: number): Uint8Array
function _deflate(buffer: any, level?: number, chunkSize?: number): Uint8Array {
    return zlibBackend.rawDeflate(toBytes(buffer), level, chunkSize);
}

export const deflate = defun(['buffer', 'level', 'chunkSize'], _deflate);
