/* require:
jsziptools.js
utils.js
*/


/**
 * @param {ArrayBuffer|Uint8Array|Array|string} bytes
 * @return {ArrayBuffer}
 */
algorithms.inflate = function(bytes){
    return zpipe.inflate(utils.toBytes(bytes), false, true).buffer;
};

expose('jz.algorithms.inflate', algorithms.inflate);