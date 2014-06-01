/**
 * Compress to a zlib format buffer.
 * 
 * @param {ArrayBuffer|Uint8Array|Array|string} buffer
 * @param {integer} level compression level.
 * @return {Uint8Array}
 */
expose('jz.zlib.compress', defun(['buffer', 'level', 'chunkSize'], function (buffer, level, chunkSize) {
  return zlibBackend.deflate(utils.toBytes(buffer), level, chunkSize);
}));