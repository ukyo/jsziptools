import { BufferLike, concatBytes } from '../common';
import { deflate, DeflateParams } from '../core';
import { compress as streamCompress } from '../stream/gz';

export interface GzipCompressParams extends DeflateParams {
  fname?: string;
  fcomment?: string;
}

/**
 * Compresses Uint8Array to a RFC 1952 GZIP file format Uint8Array.
 *
 * @example
 * const bytes = jz.gz.compress({
 *   buffer: buffer,
 *   level: 6,
 *   chunkSize: 0x8000,
 *   fname: "foo",
 *   fcomment: "bar"
 * });
 */
export function compress(params: GzipCompressParams): Uint8Array {
  const chunks: Uint8Array[] = [];
  streamCompress({
    ...params,
    buffer: params.buffer,
    streamFn: chunk => chunks.push(chunk),
  });
  return concatBytes(chunks);
}
