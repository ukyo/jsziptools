/* require:
jsziptools.js
utils.js
crc32.js
deflate.js
*/


/**
 * Compress to a gzip format buffer.
 * 
 * @param {ArrayBuffer|Uint8Array|Array|string} bytes
 * @param {number} level compress level.
 * @param {Object} metadata This function supports
 * fname(file name) and fcomment (file comment).
 * @return {ArrayBuffer}
 */
jz.gz.compress = function(bytes, level, metadata){
    var deflatedBytes, ret, i, end, view, checksum, isize,
        flg = 0,
        headerLength = 10,
        offset = 0,
        fname,
        fcomment,
        now = Date.now();

    metadata = metadata || {};
    if(matadata.fname) fname = jz.utils.toBytes(metadata.fname);
    if(metadata.fcomment) fcomment = jz.utils.toBytes(metadata.fcomment);

    bytes = jz.utils.toBytes(bytes);
    
    deflatedBytes = new Uint8Array(jz.algorithms.deflate(bytes, level));
    
    //calc metadata length
    if(fname){
        headerLength += fname.length + 1;
        flg |= 0x8;
    }
    
    if(fcomment){
        headerLength += fcomment.length + 1;
        flg |= 0x10;
    }
    
    ret = new Uint8Array(deflatedBytes.length + headerLength + 8);
    view = new DataView(ret.buffer);
    
    //write gzip header
    ret[offset++] = 0x1F;
    ret[offset++] = 0x8B;
    ret[offset++] = 0x8;
    ret[offset++] = flg;
    
    view.setUint32(offset, now, true);
    offset += 4;
    
    ret[offset++] = 4;
    ret[offset++] = 0xFF;
    
    if(fname){
        ret.set(fname, offset);
        offset += fname.length;
        ret[offset++] = 0;
    }
    
    if(fcomment){
        ret.set(fcomment, offset);
        offset += fcomment.length;
        ret[offset++] = 0;
    }
    
    //write crc32 checksum
    view.setUint32(ret.length - 8, jz.algorithms.crc32(bytes), true);
    
    //write isize
    view.setUint32(ret.length - 4, bytes.length, true);
    
    //copy data
    ret.set(deflatedBytes, headerLength);
    
    return ret.buffer;
};