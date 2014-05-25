/**
 * unpack a zip file.
 * @param {Object|Uint8Array|Int8Array|Array|ArrayBuffer|string|Blob} buffer
 * @param {string}                                                    encoding
 * @param {number}                                                    chunkSize
 * @return {Promise}
 *
 * @example
 * jz.zip.unpack({
 *     buffer: buffer, // zip buffer
 *     encoding: 'UTF-8' // encoding of filenames
 * })
 * .then(function(reader) {
 *   // reader is ZipArchiveReader. See below.
 *   // get file names.
 *   reader.getFileNames();
 *   reader.readFileAsText(reader.getFileNames[0])
 *   .then(function(text) {
 *     // ...
 *   });
 * });
 */
zip.unpack = defun(['buffer', 'encoding', 'chunkSize'], function(buffer, encoding, chunkSize) {
    var Reader = buffer instanceof Blob ? ZipArchiveReaderBlob : ZipArchiveReader;
    return new Reader({
        buffer: buffer,
        encoding: encoding,
        chunkSize: chunkSize
    }).init();
});

expose('jz.zip.unpack', zip.unpack);
