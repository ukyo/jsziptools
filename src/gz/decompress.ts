import { BufferLike, concatBytes } from '../common';
import { InflateParams } from '../core';
import { decompress as streamDecompress } from '../stream/gz';

export interface GzipDecompressParams extends InflateParams {}

/**
 * Decompresses RFC 1952 GZIP file format Uint8Array.
 *
 * @example
 * const bytes = jz.gz.decompress({
 *   buffer: buffer,
 *   chunkSize: 0x8000
 * });
 */
export function decompress(params: GzipDecompressParams): Uint8Array {
  const chunks: Uint8Array[] = [];
  streamDecompress({
    ...params,
    buffer: params.buffer,
    streamFn: chunk => chunks.push(chunk),
  });
  return concatBytes(chunks);
}
