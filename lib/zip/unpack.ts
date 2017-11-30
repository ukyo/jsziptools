import {BufferLike, defun} from '../common';
import {ZipArchiveReader} from './zip_archive_reader';
import {ZipBufferArchiveReader} from './zip_buffer_archive_reader';
import {ZipBlobArchiveReader} from './zip_blob_archive_reader';

export interface ZipUnpackParams {
    buffer: BufferLike | Blob
    encoding?: string
    chunkSize?: number
}

/**
 * Creates zip archive reader.
 * 
 * @example
 * jz.zip.unpack(buffer).then(reader => {
 *   console.log(reader.getFileNames());
 * });
 */
function _unpack(params: ZipUnpackParams): Promise<ZipArchiveReader>
function _unpack(buffer: BufferLike | Blob, encoding?: string, chunkSize?: number): Promise<ZipArchiveReader>
function _unpack(buffer: any, encoding?: string, chunkSize?: number): Promise<ZipArchiveReader> {
    let reader: ZipArchiveReader;
    if (buffer instanceof Blob) {
        reader = new ZipBlobArchiveReader(buffer, encoding, chunkSize);
    } else {
        reader = new ZipBufferArchiveReader(buffer, encoding, chunkSize);
    }
    return reader.init();
}

export const unpack = defun(['buffer', 'encoding', 'chunkSize'], _unpack);
