/* require:
jsziptools.js
utils.js
*/


/**
 * @param {ArrayBuffer|Uint8Array|Array|string} buffer
 * @param {number} level
 * @return {Uint8Array}
 */
algorithms.deflate = function (buffer, level, chunkSize) {
    var params = utils.getParams(arguments, ['buffer', 'level', 'chunkSize']);
    return zlib['rawDeflate'](utils.toBytes(params.buffer), params.level, params.chunkSize);
};

expose('jz.algorithms.deflate', algorithms.deflate);