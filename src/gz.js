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
	var deflatedBytes, ret, i, end, view, checksum, isize,
		flg = 0,
		headerLength = 10,
		offset = 0,
		now = Date.now();
	metadata = metadata || {};
	bytes = jz.utils.toBytes(bytes);
	
	deflatedBytes = new Uint8Array(jz.algorithms.deflate(bytes, level));
	
	//calc metadata length
	if(metadata.fname){
		headerLength += metadata.fname.length + 1;
		flg |= 0x8;
	}
	
	if(metadata.fcomment){
		headerLength += metadata.fcomment.length + 1;
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
	
	if(metadata.fname){
		view.setString(offset, metadata.fname);
		offset += metadata.fname.length;
		ret[offset++] = 0;
	}
	
	if(metadata.fcomment){
		view.setString(offset, metadata.fcomment);
		offset += metadata.fcomment.length;
		ret[offset++] = 0;
	}
	
	//write crc32 checksum
	view.setUint32(ret.length - 8, jz.algorithms.crc32(bytes), true);
	
	//write isize
	view.setUint32(ret.length - 4, bytes.length % 0xFFFFFFFF, true);
	
	//copy data
	ret.set(deflatedBytes, headerLength);
	
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
	var ret = {}, flg, offset = 10, checksum, view;
	bytes = jz.utils.toBytes(bytes);
	view = new DataView(bytes.buffer, bytes.byteOffset);
	
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
	
	ret = jz.algorithms.inflate(bytes.subarray(offset, bytes.length - 8));
	
	if(check) {
		checksum = view.getUint32(bytes.length - 8, true);
		if(checksum !== jz.algorithms.crc32(ret)) {
			throw 'Error: deffer from checksum.';
		}
	}
	
	return ret;
};

//alias
jz.gz.c = jz.gz.compress;
jz.gz.d = jz.gz.decompress;

})(this, jz);
