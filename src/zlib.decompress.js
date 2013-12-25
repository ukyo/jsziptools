/* require:
jsziptools.js
adler32.js
inflate.js
utils.js
*/


/**
 * Decompress a zlib format buffer.
 * 
 * @param {ArrayBuffer|Uint8Array|Array|string} bytes zlib format buffer.
 * @return {ArrayBuffer} buffer.
 */
expose('jz.zlib.decompress', function (bytes, chunkSize) {
  return zlib['inflate'](utils.toBytes(bytes), chunkSize).buffer;
});