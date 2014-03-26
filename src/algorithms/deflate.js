/* require:
jsziptools.js
utils.js
*/


/**
 * @param {ArrayBuffer|Uint8Array|Array|string} buffer
 * @param {number} level
 * @return {Uint8Array}
 */
algorithms.deflate = defun(['buffer', 'level', 'chunkSize'], function(buffer, level, chunkSize) {
    return zlib['rawDeflate'](utils.toBytes(buffer), level, chunkSize);
});

expose('jz.algorithms.deflate', algorithms.deflate);