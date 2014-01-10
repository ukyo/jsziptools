/* require:
jsziptools.js
utils.js
*/


/**
 * Calc crc32 checksum.
 */

algorithms.crc32 = (function(){
    var table = (function(){
        var poly = 0xEDB88320,
            table = new Uint32Array(256),
            u, i, j;
        
        for(i = 0; i < 256; ++i){
            u = i;
            for(j = 0; j < 8; ++j){
                u = u & 1 ? (u >>> 1) ^ poly : u >>> 1;
            }
            table[i] = u >>> 0;
        }
        return table;
    })();
    
    return function(buffer, crc){
        var params = utils.getParams(arguments, ['buffer', 'crc']),
            bytes = utils.toBytes(params.buffer),
            crc = params.crc == null ? 0xFFFFFFFF : ~params.crc >>> 0,
            i = 0,
            n = bytes.length,
            t = table;
        for(; i < n; ++i) crc = (crc >>> 8) ^ t[bytes[i] ^ (crc & 0xFF)];
        return ~crc >>> 0;
    };
})();

expose('jz.algorithms.crc32', algorithms.crc32);