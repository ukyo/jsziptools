import { BufferLike, toBytes } from '../common';
import { zlibBackend } from './zlib_backend_wrapper';

export interface DeflateParams {
  buffer: BufferLike;
  level?: number;
  chunkSize?: number;
}

/**
 * Compresses Uint8Array to a RFC 1950 ZLIB Compressed data format Uint8Array.
 *
 * @example
 * const bytes = jz.core.deflate({
 *   buffer: buffer,
 *   level: 6,
 *   chunkSize: 0x8000
 * });
 */
export function deflate(params: DeflateParams): Uint8Array {
  return zlibBackend.rawDeflate(toBytes(params.buffer), params.level, params.chunkSize);
}
