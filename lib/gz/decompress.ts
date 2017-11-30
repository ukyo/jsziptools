import {BufferLike, defun, concatBytes} from '../common';
import {InflateParams} from '../core';
import {decompress as streamDecompress} from '../stream/gz';

export interface GzipDecompressParams extends InflateParams {}

/**
 * Decompresses RFC 1952 GZIP file format Uint8Array.
 * 
 * @example
 * const bytes = jz.gz.decompress({
 *   buffer: buffer,
 *   chunkSize: 0x8000
 * });
 * const bytes2 = jz.gz.decompress(buffer, 0x8000);
 */
function _decompress(params: GzipDecompressParams): Uint8Array;
function _decompress(buffer: BufferLike, chunkSize?: number): Uint8Array;
function _decompress(buffer: any, chunkSize?: number): Uint8Array {
    const chunks: Uint8Array[] = [];
    streamDecompress({
        buffer,
        streamFn: chunk => chunks.push(chunk),
        chunkSize
    });
    return concatBytes(chunks);
}

export const decompress = defun(['buffer', 'chunkSize'], _decompress);
