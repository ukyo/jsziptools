/* require:
jsziptools.js
adler32.js
inflate.js
utils.js
*/


/**
 * Decompress a zlib format buffer.
 * 
 * @param {ArrayBuffer|Uint8Array|Array|string} buffer zlib format buffer.
 * @return {Uint8Array}
 */
expose('jz.zlib.decompress', function (buffer, chunkSize) {
  var params = utils.getParams(arguments, ['buffer', 'chunkSize']);
  return zlib['inflate'](utils.toBytes(params.buffer), params.chunkSize);
});