import { BufferLike, toBytes } from '../../common';
import { zlibBackend } from '../../core/zlib_backend_wrapper';

export interface StreamInflateParams {
  buffer: BufferLike;
  streamFn(chunk: Uint8Array): any;
  shareMemory?: boolean;
  chunkSize?: number;
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
export function inflate(params: StreamInflateParams): void {
  zlibBackend.stream.rawInflate(toBytes(params.buffer), params.streamFn, params.shareMemory, params.chunkSize);
}
