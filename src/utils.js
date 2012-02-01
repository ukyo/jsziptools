jz.utils = jz.utils || {};

(function(window, jz){

/**
 * If a argument is ArrayBuffer, return a Uint8Array view.
 * 
 * @param {ArrayBuffer|Uint8Array} buffer
 * @return {Uint8Array}
 */
jz.utils.arrayBufferToBytes = function(buffer){
	return buffer.constructor === Uint8Array ? buffer : new Uint8Array(buffer); 
};


/**
 * Convert a UTF-8 string to a ArrayBuffer.
 * 
 * @param {string} str
 * @return {ArrayBuffer}
 */
jz.utils.stringToArrayBuffer = function(str){
	var n = str.length,
		idx = -1,
		utf8 = [],
		i, j, c;
	
	//http://user1.matsumoto.ne.jp/~goma/js/utf.js
	for(i = 0; i < n; ++i){
		c = str.charCodeAt(i);
		if(c <= 0x7F){
			utf8[++idx] = c;
		} else if(c <= 0x7FF){
			utf8[++idx] = 0xC0 | (c >>> 6);
			utf8[++idx] = 0x80 | (c & 0x3F);
		} else if(c <= 0xFFFF){
			utf8[++idx] = 0xE0 | (c >>> 12);
			utf8[++idx] = 0x80 | ((c >>> 6) & 0x3F);
			utf8[++idx] = 0x80 | (c & 0x3F);
		} else {
			j = 4;
			while(c >> (6 * j)) ++j;
			utf8[++idx] = ((0xFF00 >>> j) & 0xFF) | (c >>> (6 * --j));
			while(j--)
				utf8[++idx] = 0x80 | ((c >>> (6 * j)) & 0x3F);
		}
	}
	return new Uint8Array(utf8).buffer;
};


/**
 * Read a 32bit unsigned number(little endian).
 * 
 * @param {ArrayBuffer|Uint8Array} bytes
 * @param {number} offset
 * @return {number}
 */
jz.utils.readUintLE = function(bytes, offset){
	bytes = jz.utils.arrayBufferToBytes(bytes);
	return bytes[offset] | bytes[offset + 1] << 8 | bytes[offset + 2] << 16 | bytes[offset + 3] << 24;
};


/**
 * Read a 16bit unsigned number(little endian).
 * 
 * @param {ArrayBuffer|Uint8Array} bytes
 * @param {number} offset
 * @return {number}
 */
jz.utils.readUshortLE = function(bytes, offset){
	bytes = jz.utils.arrayBufferToBytes(bytes);
	return bytes[offset] | bytes[offset + 1] << 8;
};


/**
 * Read a 32bit unsigned number(big endian).
 * 
 * @param {ArrayBuffer|Uint8Array} bytes
 * @param {number} offset
 * @return {number}
 */
jz.utils.readUintBE = function(bytes, offset){
	bytes = jz.utils.arrayBufferToBytes(bytes);
	return bytes[offset + 3] | bytes[offset + 2] << 8 | bytes[offset + 1] << 16 | bytes[offset] << 24;
};


/**
 * Read a 16bit unsigned number(big endian).
 * 
 * @param {ArrayBuffer|Uint8Array} bytes
 * @param {number} offset
 * @return {number}
 */
jz.utils.readUshortBE = function(bytes, offset){
	bytes = jz.utils.arrayBufferToBytes(bytes);
	return bytes[offset + 1] | bytes[offset] << 8;
};


/**
 * Read a string(ascii only).
 * 
 * @param {ArrayBuffer|Uint8Array} bytes
 * @param {number} offset
 * @param {number} length
 * @return {number}
 */
jz.utils.readString = function(bytes, offset, len){
	var ret = '';
	bytes = jz.utils.arrayBufferToBytes(bytes);
	
	for(var i = offset, l = offset + len; i < l; ++i) ret += String.fromCharCode(bytes[i]);
	return ret;
};


/**
 * Load a Buffer with Ajax.
 * 
 * @param {string} url
 * @return {ArrayBuffer}
 */
jz.utils.loadFileBuffer = function(url){
	var xhr = new XMLHttpRequest();
	xhr.open('GET', url, false);
	//304対策
	xhr.setRequestHeader('If-Modified-Since', '01 Jan 1970 00:00:00 GMT');
	xhr.responseType = 'arraybuffer';
	xhr.send();
	return xhr.response;
};

})(this, jz);
