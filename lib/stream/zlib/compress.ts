import {defun, BufferLike, toBytes} from '../../common';
import {zlibBackend} from '../../core';
import {StreamDeflateParams} from '../../stream/core';

export interface StreamZlibCompressParams extends StreamDeflateParams {}

/**
 * Compresses Uint8Array to a RFC 1951 ZLIB file format Uint8Array.
 * 
 * @example
 * jz.stream.zlib.compress({
 *   buffer: buffur,
 *   streamFn: chunk => {
 *     console.log(chunk.length);
 *   },
 *   level: 6,
 *   shareMemory: false,
 *   chunkSize: 0x8000
 * });
 */
function _compress(params: StreamZlibCompressParams): void
function _compress(buffer: BufferLike, streamFn: (chunk: Uint8Array) => any, level?: number, shareMemory?: boolean, chunkSize?: number): void
function _compress(buffer: BufferLike | any, streamFn?: (chunk: Uint8Array) => any, level?: number, shareMemory?: boolean, chunkSize?: number): void {
    zlibBackend.stream.deflate(
        toBytes(buffer),
        streamFn,
        level,
        shareMemory,
        chunkSize
    );
}

export const compress = defun(['buffer', 'streamFn', 'level', 'shareMemory', 'chunkSize'], _compress);
