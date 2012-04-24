/**
 * Calc crc32 checksum.
 */

jz.algorithms = jz.algorithms || {};

jz.algorithms.crc32 = (function(){
	var table = (function(){
		var poly = 0xEDB88320,
			table = new Uint32Array(new ArrayBuffer(1024)),
			u, i, j;
		
		for(i = 0; i < 256; ++i){
			u = i;
			for(j = 0; j < 8; ++j){
				u = u & 1 ? (u >>> 1) ^ poly : u >>> 1;
			}
			table[i] = u;
		}
		return table;
	})();
	
	return function(bytes){
		var result = 0xFFFFFFFF, bytes = jz.utils.toBytes(bytes), i, n, t = table;
		for(i = 0, n = bytes.length; i < n; ++i)
			result = (result >>> 8) ^ t[bytes[i] ^ (result & 0xFF)];
		return new Uint32Array([~result])[0];
	};
})();
