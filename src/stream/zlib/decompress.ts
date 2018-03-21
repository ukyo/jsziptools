import { BufferLike, toBytes } from '../../common';
import { zlibBackend } from '../../core';
import { StreamInflateParams } from '../../stream/core';

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
export function decompress(params: StreamZlibDecompressParams): void {
  zlibBackend.stream.inflate(toBytes(params.buffer), params.streamFn, params.shareMemory, params.chunkSize);
}
