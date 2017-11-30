import {concatBytes, defun} from '../common';
import {ZipItem} from './zip_item';
import {pack as streamPack} from '../stream/zip';

export interface ZipPackParams {
    files: ZipItem[]
    level?: number
    chunkSize?: number
}

/**
 * Creates zip archive.
 * 
 * @example
 * jz.zip.pack([
 *   {name: "hello.txt", buffer: "hello world"},
 *   {name: "foo.mp3", buffer: mp3buff},
 *   {name: "bar", dir: [{name: "foo.txt", buffer: "foo"}]}
 * ]).then(result => console.log(result.length));
 */
function _pack(params: ZipPackParams): Promise<Uint8Array>
function _pack(files: ZipItem[], level?: number, chunkSize?: number): Promise<Uint8Array>
function _pack(files: any, level?: number, chunkSize?: number): Promise<Uint8Array> {
    let chunks: Uint8Array[] = [];
    return streamPack({
        files,
        level,
        chunkSize,
        shareMemory: false,
        streamFn: chunk => chunks.push(chunk),
    })
    .then(() => concatBytes(chunks));
}

export const pack = defun(['files', 'level', 'chunkSize'], _pack);
