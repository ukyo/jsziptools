/* require:
jsziptools.js
utils.js
*/


/**
 * @param {ArrayBuffer|Uint8Array|Array|string} bytes
 * @param {number} level
 * @return {ArrayBuffer}
 */
algorithms.deflate = function(bytes, level){
    return zpipe.deflate(utils.toBytes(bytes), level, false, true).buffer;
};

expose('jz.algorithms.deflate', algorithms.deflate);