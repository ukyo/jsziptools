/* require:
jsziptools.js
utils.js
*/


/**
 * @param {ArrayBuffer|Uint8Array|Array|string} bytes
 * @param {number} level
 * @return {ArrayBuffer}
 */
algorithms.deflate = function (bytes, level, chunkSize) {
  return zlib['rawDeflate'](utils.toBytes(bytes), level, chunkSize).buffer;
};

expose('jz.algorithms.deflate', algorithms.deflate);