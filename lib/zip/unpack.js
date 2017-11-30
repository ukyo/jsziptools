import { defun } from '../common';
import { ZipBufferArchiveReader } from './zip_buffer_archive_reader';
import { ZipBlobArchiveReader } from './zip_blob_archive_reader';
function _unpack(buffer, encoding, chunkSize) {
    let reader;
    if (buffer instanceof Blob) {
        reader = new ZipBlobArchiveReader(buffer, encoding, chunkSize);
    }
    else {
        reader = new ZipBufferArchiveReader(buffer, encoding, chunkSize);
    }
    return reader.init();
}
export const unpack = defun(['buffer', 'encoding', 'chunkSize'], _unpack);
