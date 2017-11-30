import {BufferLike, defun, toBytes} from '../../common';
import {zlibBackend} from '../../core';

export interface StreamDeflateParams {
    buffer: BufferLike
    streamFn(chunk: Uint8Array): any
    level?: number
    shareMemory?: boolean
    chunkSize?: number
}

/**
 * Compresses Uint8Array to a RFC 1950 ZLIB Compressed data format Uint8Array.
 * 
 * @example
 * jz.stream.core.deflate({
 *   buffer: buffur,
 *   streamFn: chunk => {
 *     console.log(chunk.length);
 *   },
 *   level: 6,
 *   shareMemory: false,
 *   chunkSize: 0x8000
 * });
 */
function _deflate(params: StreamDeflateParams): void
function _deflate(buffer: BufferLike, streamFn: (chunk: Uint8Array) => any, level?: number, shareMemory?: boolean, chunkSize?: number): void
function _deflate(buffer: any, streamFn?: (chunk: Uint8Array) => any, level?: number, shareMemory?: boolean, chunkSize?: number): void {
    zlibBackend.stream.rawDeflate(
        toBytes(buffer),
        streamFn,
        level,
        shareMemory,
        chunkSize
    );
}

export const deflate = defun(['buffer', 'streamFn', 'level', 'shareMemory', 'chunkSize'], _deflate);
