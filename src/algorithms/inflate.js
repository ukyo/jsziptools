/* require:
jsziptools.js
utils.js
*/


/**
 * @param {ArrayBuffer|Uint8Array|Array|string} bytes
 * @return {ArrayBuffer}
 */
algorithms.inflate = function(bytes, chunkSize){
    return zlib['rawInflate'](utils.toBytes(bytes), chunkSize).buffer;
};

expose('jz.algorithms.inflate', algorithms.inflate);