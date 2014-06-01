/**
 * Decompress a zlib format buffer.
 * 
 * @param {ArrayBuffer|Uint8Array|Array|string} buffer zlib format buffer.
 * @return {Uint8Array}
 */
expose('jz.zlib.decompress', defun(['buffer', 'chunkSize'], function (buffer, chunkSize) {
  return zlibBackend.inflate(utils.toBytes(buffer), chunkSize);
}));