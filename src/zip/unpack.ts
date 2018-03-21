import { BufferLike } from '../common';
import { ZipArchiveReader } from './zip_archive_reader';
import { ZipBufferArchiveReader } from './zip_buffer_archive_reader';
import { ZipBlobArchiveReader } from './zip_blob_archive_reader';

export interface ZipUnpackParams {
  buffer: BufferLike | Blob;
  encoding?: string;
  chunkSize?: number;
}

/**
 * Creates zip archive reader.
 *
 * @example
 * const reader = await jz.zip.unpack(buffer)
 * console.log(reader.getFileNames());
 */
export async function unpack({ buffer, encoding, chunkSize }: ZipUnpackParams): Promise<ZipArchiveReader> {
  let reader: ZipArchiveReader;
  if (buffer instanceof Blob) {
    reader = new ZipBlobArchiveReader(buffer, encoding, chunkSize);
  } else {
    reader = new ZipBufferArchiveReader(buffer, encoding, chunkSize);
  }
  return await reader.init();
}
