/* require:
jsziptools.js
adler32.js
deflate.js
utils.js
*/


/**
 * Compress to a zlib format buffer.
 * 
 * @param {ArrayBuffer|Uint8Array|Array|string} bytes
 * @param {integer} level compress level.
 * @return {ArrayBuffer} zlib format buffer.
 */
zlib.compress = function(bytes, level){
    return zpipe.deflate(utils.toBytes(bytes), level, true, true).buffer;
};

expose('jz.zlib.compress', zlib.compress);