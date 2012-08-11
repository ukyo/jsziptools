/* require:
jsziptools.js
adler32.js
inflate.js
utils.js
*/


/**
 * Decompress from a zlib format buffer.
 * 
 * @param {ArrayBuffer|Uint8Array|Array|string} bytes zlib format buffer.
 * @param {boolean} check if check adler32 checksum, set true.
 * @return {ArrayBuffer} buffer.
 */
jz.zlib.decompress = function(bytes, check){
    var b, cm, cinfo, fcheck, fdict, view,
        flevel, dictid, checksum, ret,
        offset = 0;
    bytes = jz.utils.toBytes(bytes);
    view = DataView.create(bytes);
    
    //read zlib header
    b = bytes[offset++];
    cm = b & 0xF;
    cinfo = b >> 4;
    
    b = bytes[offset++];
    fcheck = b & 0x1F;
    fdict = b & 0x20;
    flevel = b >> 6;
    
    if(fdict){
        dictid = view.getUint32(offset);
        offset += 4;
    }
    
    //decompress from deflate stream
    ret = jz.algorithms.inflate(bytes.subarray(offset, bytes.length - 4));
    
    //check adler32
    if(check){
        //read adler32 checksum
        checksum = view.getUint32(bytes.length - 4, false);
        checksum2 = jz.algorithms.adler32(ret);
        if(checksum !== checksum2) throw 'Error: differ from checksum';
    }
    
    return ret;
};
