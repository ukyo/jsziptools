import {defun, BufferLike, toBytes} from '../../common';
import {zlibBackend} from '../../core';
import {StreamInflateParams} from '../../stream/core';

export interface StreamZlibDecompressParams extends StreamInflateParams {}

/**
 * Decompresses RFC 1951 ZLIB file format Uint8Array.
 * 
 * @example
 * jz.stream.zlib.decompress({
 *   buffer: buffur,
 *   streamFn: chunk => {
 *     console.log(chunk.length);
 *   },
 *   shareMemory: false,
 *   chunkSize: 0x8000
 * });
 */
function _decompress(params: StreamZlibDecompressParams): void
function _decompress(buffer: BufferLike, streamFn: (chunk: Uint8Array) => any, shareMemory?: boolean, chunkSize?: number): void
function _decompress(buffer: BufferLike | any, streamFn?: (chunk: Uint8Array) => any, shareMemory?: boolean, chunkSize?: number): void {
    zlibBackend.stream.inflate(
        toBytes(buffer),
        streamFn,
        shareMemory,
        chunkSize
    );
}

export const decompress = defun(['buffer', 'streamFn', 'shareMemory', 'chunkSize'], _decompress);
