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
zlib.decompress = function(bytes, check){
    return zpipe.inflate(utils.toBytes(bytes), true, true).buffer;
};

expose('jz.zlib.decompress', zlib.decompress);