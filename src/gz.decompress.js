/* require:
jsziptools.js
utils.js
crc32.js
inflate.js
*/


/**
 * Decompress from a gzip format buffer.
 * 
 * @param {ArrayBuffer|Uint8Array|Array|string} bytes
 * @param {boolean} check If check crc32 checksum, set true.
 * @return {ArrayBuffer}
 */
gz.decompress = function(bytes, check){
    var ret = {}, flg, offset = 10, checksum, view;
    bytes = utils.toBytes(bytes);
    view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    
    if(bytes[0] !== 0x1F || bytes[1] !== 0x8B) throw 'Error: invalid gzip file.';
    if(bytes[2] !== 0x8) throw 'Error: not deflate.';
    
    flg = bytes[3];
    
    ret.mtime = view.getUint32(4, true);
    
    //fextra
    if(flg & 0x4) {
        offset += view.getUint16(offset, true) + 2;
    }
    
    //fname
    if(flg & 0x8) {
        ret.fname = '';
        while(bytes[offset] !== 0) ret.fname += String.fromCharCode(bytes[offset++]);
        ++offset;
    }
    
    //fcomment
    if(flg & 0x10) {
        ret.fcomment = '';
        while(bytes[offset] !== 0) ret.fcomment += String.fromCharCode(bytes[offset++]);
        ++offset;
    }
    
    //fhcrc
    if(flg & 0x2) {
        offset += 2;
    }
    
    ret = algorithms.inflate(bytes.subarray(offset, bytes.length - 8));
    
    if(check) {
        checksum = view.getUint32(bytes.length - 8, true);
        if(checksum !== algorithms.crc32(ret)) {
            throw 'Error: deffer from checksum.';
        }
    }
    
    return ret;
};

expose('jz.gz.decompress', gz.decompress);