jz.algorithms = jz.algorithms || {};

jz.algorithms.adler32 = function(buffer){
	var bytes = jz.utils.arrayBufferToBytes(buffer),
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
	
	return (b << 16) | a;
};
