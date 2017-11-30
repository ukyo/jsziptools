import {BufferLike, concatBytes, defun} from '../common';
import {deflate, DeflateParams} from '../core';
import {compress as streamCompress} from '../stream/gz';

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
 * const bytes2 = jz.gz.compress(buffer, 6, 0x8000, "foo", "bar");
 */
function _compress(params: GzipCompressParams): Uint8Array;
function _compress(buffer: BufferLike, level?: number, chunkSize?: number, fname?: string, fcomment?: string): Uint8Array;
function _compress(buffer: any, level?: number, chunkSize?: number, fname?: string, fcomment?: string): Uint8Array {
    const chunks: Uint8Array[] = [];
    streamCompress({
        buffer,
        level,
        chunkSize,
        fname,
        fcomment,
        streamFn: chunk => chunks.push(chunk)
    });
    return concatBytes(chunks);
}

export const compress = defun(['buffer', 'level', 'chunkSize', 'fname', 'fcomment'], _compress);
