/**
 * Compress to a zlib format buffer.
 * 
 * @param {ArrayBuffer|Uint8Array|Array|string} buffer
 * @param {integer} level compression level.
 * @return {Uint8Array}
 */
expose('jz.zlib.compress', function (buffer, level, chunkSize) {
  var params = utils.getParams(arguments, ['buffer', 'level', 'chunkSize']);
  return zlib['deflate'](utils.toBytes(params.buffer), params.level, params.chunkSize);
});