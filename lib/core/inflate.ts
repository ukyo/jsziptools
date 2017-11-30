import {defun, BufferLike, toBytes} from '../common';
import {zlibBackend} from './zlib_backend_wrapper';

export interface InflateParams {
    buffer: BufferLike
    chunkSize?: number
}

/**
 * Decompresses RFC 1950 ZLIB Compressed data format Uint8Array.
 * 
 * @example
 * const bytes = jz.core.inflate({
 *   buffer: buffer,
 *   chunkSize: 0x8000
 * });
 * const bytes2 = jz.core.inflate(buffer, 0x8000);
 */
function _inflate(params: InflateParams): Uint8Array
function _inflate(buffer: BufferLike, chunkSize?: number): Uint8Array
function _inflate(buffer: any, chunkSize?: number): Uint8Array {
    return zlibBackend.rawInflate(toBytes(buffer), chunkSize);
}

export const inflate = defun(['buffer', 'chunkSize'], _inflate);
