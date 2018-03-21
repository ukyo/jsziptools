import { BufferLike, toBytes } from '../common';
import { InflateParams, zlibBackend } from '../core';

export interface ZlibDecompressParams extends InflateParams {}

/**
 * Decompresses RFC 1951 ZLIB file format Uint8Array.
 *
 * @example
 * const bytes = jz.zlib.decompress({
 *   buffer: buffer,
 *   chunkSize: 0x8000
 * });
 */
export function decompress(params: ZlibDecompressParams): Uint8Array {
  return zlibBackend.inflate(toBytes(params.buffer), params.chunkSize);
}
