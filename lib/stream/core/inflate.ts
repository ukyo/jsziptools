import {BufferLike, defun, toBytes} from '../../common';
import {zlibBackend} from '../../core/zlib_backend_wrapper';

export interface StreamInflateParams {
    buffer: BufferLike
    streamFn(chunk: Uint8Array): any
    shareMemory?: boolean
    chunkSize?: number
}

/**
 * Decompresses RFC 1950 ZLIB Compressed data format Uint8Array.
 * 
 * @example
 * jz.stream.core.inflate({
 *   buffer: buffur,
 *   streamFn: chunk => {
 *     console.log(chunk.length);
 *   },
 *   shareMemory: false,
 *   chunkSize: 0x8000
 * });
 */
function _inflate(params: StreamInflateParams): void
function _inflate(buffer: BufferLike, streamFn: (chunk: Uint8Array) => any, shareMemory?: boolean, chunkSize?: number): void
function _inflate(buffer: any, streamFn?: (chunk: Uint8Array) => any, shareMemory?: boolean, chunkSize?: number): void {
    zlibBackend.stream.rawInflate(
        toBytes(buffer),
        streamFn,
        shareMemory,
        chunkSize
    );
}

export const inflate = defun(['buffer', 'streamFn', 'shareMemory', 'chunkSize'], _inflate);
