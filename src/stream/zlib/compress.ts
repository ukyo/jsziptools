import { BufferLike, toBytes } from '../../common';
import { zlibBackend } from '../../core';
import { StreamDeflateParams } from '../../stream/core';

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
export function compress(params: StreamZlibCompressParams): void {
  zlibBackend.stream.deflate(
    toBytes(params.buffer),
    params.streamFn,
    params.level,
    params.shareMemory,
    params.chunkSize,
  );
}
