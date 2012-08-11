/* require:
jsziptools.js
utils.js
*/


/**
 * Calc adler32 checksum.
 */

jz.algorithms.adler32 = function(bytes){
    var bytes = jz.utils.toBytes(bytes),
        a = 1,
        b = 0,
        i = 0,
        MOD_ADLER = 65521,
        len = bytes.length,
        tlen;
    
    while(len > 0){
        tlen = len > 5550 ? 5550 : len;
        len -= tlen;
        do {
            a += bytes[i++];
            b += a;
        } while(--tlen);
        
        a %= MOD_ADLER;
        b %= MOD_ADLER;
    }
    
    return new Uint32Array([(b << 16) | a])[0];
};
