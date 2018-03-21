import { BufferLike, toBytes } from '../common';
import { DeflateParams, zlibBackend } from '../core';

export interface ZlibCompressParams extends DeflateParams {}

/**
 * Compresses Uint8Array to a RFC 1951 ZLIB file format Uint8Array.
 *
 * @example
 * const bytes = jz.zlib.compress({
 *   buffer: buffer,
 *   level: 6,
 *   chunkSize: 0x8000
 * });
 */
export function compress(params: ZlibCompressParams): Uint8Array {
  return zlibBackend.deflate(toBytes(params.buffer), params.level, params.chunkSize);
}
