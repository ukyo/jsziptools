/**
 * Compress to a zlib format buffer.
 * 
 * @param {ArrayBuffer|Uint8Array|Array|string} bytes
 * @param {integer} level compress level.
 * @return {ArrayBuffer} zlib format buffer.
 */
jz.zlib.compress = function(bytes, level){
    var ret, buffer, i, end, checksum, data, view;
    
    //compress to deflate stream
    data = jz.utils.toBytes(jz.algorithms.deflate(bytes, level));
    
    ret = new Uint8Array(data.length + 6);
    view = new DataView(ret.buffer);
    
    //write zlib header
    ret[0] = 0x78;
    ret[1] = 0x01;
    
    //write zlib deflate stream
    ret.set(data, 2);
    
    //write adler32 checksum
    checksum = jz.algorithms.adler32(bytes);
    view.setUint32(ret.length - 4, checksum);
    
    return ret.buffer;
};