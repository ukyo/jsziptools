/**
 * Compress and decompress RFC 1950 zlib file format binary data.
 * http://tools.ietf.org/rfc/rfc1950.txt
 */

jz.zlib = jz.zlib || {};

(function(window, jz){

/**
 * Compress to a zlib format buffer.
 * 
 * @param {ArrayBuffer|Uint8Array} bytes ArrayBuffer or Uint8Array.
 * @param {integer} level compress level.
 * @return {ArrayBuffer} zlib format buffer.
 */
jz.zlib.compress = function(bytes, level){
	var ret, buffer, i, end, checksum, data;
	
	//compress to deflate stream
	data = jz.utils.arrayBufferToBytes(jz.algorithms.deflate(bytes, level));
	
	ret = new Uint8Array(data.length + 6);
	
	//write zlib header
	ret[0] = 0x78;
	ret[1] = 0x01;
	
	//write zlib deflate stream
	for(i = 2, end = ret.length - 4; i < end; ++i) ret[i] = data[i - 2];
	
	//write adler32 checksum
	checksum = jz.algorithms.adler32(ret);
	ret[ret.length - 4] = checksum >> 24;
	ret[ret.length - 3] = (checksum & 0xFF0000) >> 16;
	ret[ret.length - 2] = (checksum & 0xFF00) >> 8;
	ret[ret.length - 1] = checksum & 0xFF;
	
	return ret.buffer;
};


/**
 * Decompress from a zlib format buffer.
 * 
 * @param {ArrayBuffer|Uint8Array} bytes zlib format buffer.
 * @param {boolean} check if check adler32 checksum, set true.
 * @return {ArrayBuffer} buffer.
 */
jz.zlib.decompress = function(bytes, check){
	var b, cm, cinfo, fcheck, fdict,
		flevel, dictid, checksum, ret,
		offset = 0;
	bytes = jz.utils.arrayBufferToBytes(bytes);
	
	//read zlib header
	b = bytes[offset++];
	cm = b & 0xF;
	cinfo = b >> 4;
	
	b = bytes[offset++];
	fcheck = b & 0x1F;
	fdict = b & 0x20;
	flevel = b >> 6;
	
	if(fdict){
		dictid = jz.utils.readUintBE(bytes, offset);
		offset += 4;
	}
	
	//read adler32 checksum
	checksum = jz.utils.readUintBE(bytes, bytes.length - 4);
	
	//decompress from deflate stream
	ret = jz.algorithms.inflate(bytes.subarray(offset, bytes.length - 4));
	
	//check adler32
	if(check && checksum !== jz.algorithms.adler32(ret)){
		throw 'Error: differ from checksum';
	}
	
	return ret;
};

//shortcut
jz.zlib.c = jz.zlib.compress;
jz.zlib.d = jz.zlib.decompress;

})(this, jz);
