/**
 * Copyright (c) 2012 - Syu Kato <ukyo.web@gmail.com>
 * 
 * License: MIT
 * 
 * Compress and decompress RFC 1952 gzip file format binary data.
 * http://tools.ietf.org/rfc/rfc1952.txt
 */

jz.gz = jz.gz || {};

(function(window, jz){

/**
 * Compress to a gzip format buffer.
 * 
 * @param {ArrayBuffer|Uint8Array} bytes
 * @param {number} level compress level.
 * @param {Object} metadata This function supports
 * fname(file name) and fcomment (file comment).
 * @return {ArrayBuffer}
 */
jz.gz.compress = function(bytes, level, metadata){
	var data, ret, i, end, ui32view, checksum, isize,
		flg = 0,
		headerLength = 10,
		offset = 0,
		now = Date.now();
	metadata = metadata || {};
	bytes = jz.utils.arrayBufferToBytes(bytes);
	
	data = new Uint8Array(jz.algorithms.deflate(bytes, level));
	
	//calc metadata length
	if(metadata.fname){
		headerLength += metadata.fname.length + 1;
		flg |= 0x8;
	}
	
	if(metadata.fcomment){
		headerLength += metadata.fcomment.length + 1;
		flg |= 0x10;
	}
	
	ret = new Uint8Array(data.length + headerLength + 8);
	
	function writeUint(val, offset){
		ret[offset++] = val & 0xFF;
		ret[offset++] = (val & 0xFF00) >> 8;
		ret[offset++] = (val & 0xFF0000) >> 16;
		ret[offset++] = val >> 24;
	}
	
	//write gzip header
	ret[offset++] = 0x1F;
	ret[offset++] = 0x8B;
	
	ret[offset++] = 0x8;
	
	ret[offset++] = flg;
	
	writeUint(now, offset);
	offset += 4;
	
	ret[offset++] = 4;
	ret[offset++] = 0xFF;
	
	if(metadata.fname){
		for(i = 0; i < metadata.fname.length; ++i) ret[offset++] = metadata.fname.charCodeAt(i);
		ret[offset++] = 0;
	}
	
	if(metadata.fcomment){
		for(i = 0; i < metadata.fcomment.length; ++i) ret[offset++] = metadata.fcomment.charCodeAt(i);
		ret[offset++] = 0;
	}
	
	//write crc32 checksum
	writeUint(jz.algorithms.crc32(bytes), ret.length - 8);
	
	//write isize
	writeUint(bytes.length % 0xFFFFFFFF, ret.length - 4);
	
	//copy data
	for(i = headerLength, end = ret.length - 8; i < end; ++i) ret[i] = data[i - headerLength];
	
	return ret.buffer;
};


/**
 * Decompress from a gzip format buffer.
 * 
 * @param {ArrayBuffer|Uint8Array} bytes
 * @param {boolean} check If check crc32 checksum, set true.
 * @return {ArrayBuffer}
 */
jz.gz.decompress = function(bytes, check){
	var ret = {}, flg, offset = 10, checksum;
	bytes = jz.utils.arrayBufferToBytes(bytes);
	
	if(bytes[0] !== 0x1F || bytes[1] !== 0x8B) throw 'Error: invalid gzip file.';
	if(bytes[2] !== 0x8) throw 'Error: not deflate.';
	
	flg = bytes[3];
	
	ret.mtime = jz.utils.readUintLE(bytes, 4);
	
	//fextra
	if(flg & 0x4) {
		offset += jz.utils.readUshortLE(bytes, offset) + 2;
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
	
	console.log(offset);
	ret.buffer = jz.algorithms.inflate(bytes.subarray(offset, bytes.length - 8));
	
	if(check) {
		checksum = jz.utils.readUintLE(bytes, bytes.length - 8);
		if(checksum !== jz.algorithms.crc32(ret.buffer)) {
			throw 'Error: deffer from checksum.';
		}
	}
	
	return ret;
};

//shortcut
jz.gz.c = jz.gz.compress;
jz.gz.d = jz.gz.decompress;

})(this, jz);
