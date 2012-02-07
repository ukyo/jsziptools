/**
 * Copyright (c) 2012 - Syu Kato <ukyo.web@gmail.com>
 * 
 * License: MIT
 * 
 * Pack datas to a zip format data.
 */

jz.zip = jz.zip || {};

(function(window, jz){

var BlobBuilder = jz.BlobBuilder;


/**
 * @param {number} i index of a File.
 * @param {number} centralDirHeaderSize
 * @param {number} offset A start position of a File.
 * @return {Blob}
 */
function getEndCentDirHeader(i, centralDirHeaderSize, offset){
	var bb = new BlobBuilder();
	bb.append(getUint(jz.zip.END_SIGNATURE)); //signature
	bb.append(getUshort(0)); //disknum
	bb.append(getUshort(0)); //startdisknum
	bb.append(getUshort(i)); //diskdirentry
	bb.append(getUshort(i)); //direntry
	bb.append(getUint(centralDirHeaderSize)); //dirsize
	bb.append(getUint(offset)); //startpos
	bb.append(getUshort(0)); //commentlen
	return bb.getBlob();
}


/**
 * @constructor
 * 
 * @param {ArrayBuffer} buffer
 * @param {string} filename
 * @param {Date} date
 * @param {boolean|number} isDir
 * @param {boolean|number} isDeflate
 */
function HeaderBuilder(buffer, filename, date, offset, isDir, isDeflate){
	this.buffer = buffer;
	this.filename = filename;
	this.date = date;
	this.offset = offset;
	this.dir = isDir ? 0x10 : 0;
	this.defl = isDeflate ? 0x8 : 0;
	this._commonHeader = this._getCommonHeader();
	this._cache = {lf: null, cd: null};
}



HeaderBuilder.prototype = {
	/**
	 * @return {Blob}
	 */
	_getCommonHeader: function(){
		var bb = new BlobBuilder();
		bb.append(getUshort(10)); //needvar
		bb.append(getUshort(0)); //option
		bb.append(getUshort(this.defl)); //comptype
		bb.append(getUshort(getFileTime(this.date))); //filetime
		bb.append(getUshort(getFileDate(this.date))); //filedate
		bb.append(getUint(jz.algorithms.crc32(this.buffer))); //crc32
		bb.append(getUint(this.buffer.byteLength)); //compsize
		bb.append(getUint(this.buffer.byteLength)); //uncompsize
		bb.append(getUshort(this.filename.length)); //fnamelen
		bb.append(getUshort(0)); //extralen
		return bb.getBlob();
	},
	
	/**
	 * @return {Blob}
	 */
	getLocalFileHeader: function(){
		if(this._cache.lf) return this._cache.lf;
		
		var bb = new BlobBuilder();
		bb.append(getUint(jz.zip.LOCAL_FILE_SIGNATURE)); //signature
		bb.append(this._commonHeader);
		bb.append(this.filename);
		return this._cache.lf = bb.getBlob();
	},
	
	/**
	 * @return {Blob}
	 */
	getCentralDirHeader: function(){
		if(this._cache.cd) return this._cache.cd;
		
		var bb = new BlobBuilder();
		bb.append(getUint(jz.zip.CENTRAL_DIR_SIGNATURE)); //signature
		bb.append(getUshort(0x14)); //madevar
		bb.append(this._commonHeader);
		bb.append(getUshort(0)); //commentlen
		bb.append(getUshort(0)); //disknum
		bb.append(getUshort(0)); //inattr
		bb.append(getUint(this.dir)); //outattr
		bb.append(getUint(this.offset)); //offset
		bb.append(this.filename);
		return this._cache.cd = bb.getBlob();
	},
	
	/**
	 * @return {number}
	 */
	getAchiveLength: function(){
		return this.getLocalFileHeader().size + this.buffer.byteLength;
	}
};


/**
 * Get a buffer of 16bit unsigned integer.
 * 
 * @param {number} i
 * @return {ArrayBuffer}
 */
function getUshort(i){
	return new Uint16Array([i]).buffer;
}


/**
 * Get a buffer of 32bit unsigned integer.
 * 
 * @param {number} i
 * @return {ArrayBuffer}
 */
function getUint(i){
	return new Uint32Array([i]).buffer;
}


/**
 * Get DOS style Date(year, month, day).
 * 
 * @param {Date} date
 * @return {number}
 */
function getFileDate(date){
	return ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | (date.getDay());
}


/**
 * Get DOS style Time(hour, minute, second).
 * 
 * @param {Date} date
 * @return {number}
 */
function getFileTime(date){
	return (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1);
}


/**
 * Compress to a zip format file.
 * 
 * @param {Array} files
 * @param {number} level
 * @return {Blob}
 */
jz.zip.compress = function(files, level){
	var n = 0,
		offset = 0,
		achiveBb = new BlobBuilder(),
		centralDirBb = new BlobBuilder(),
		date = new Date();
	
	level = level || 1;
	
	function compress(obj, dir){
		var name, buffer, hb, isDir, isDeflate, _level;
		
		if(typeof obj === 'undefined') return;
		if(obj.children){
			name = dir + obj.name + (obj.name.substr(-1) === '/' ? '' : '/');
			buffer = new ArrayBuffer(0);
			isDir = true;
			obj.children.forEach(function(item){
				compress(item, dir + name);
			});
		} else if(obj.url){
			buffer = jz.utils.loadFileBuffer(obj.url);
			name = dir + (obj.name || obj.url.split('/').pop());
		} else if(obj.str){
			buffer = jz.utils.stringToArrayBuffer(obj.str);
			name = dir + obj.name;
		} else if(obj.buffer){
			buffer = obj.buffer;
			name = dir + obj.name;
		} else {
			throw 'This type is not supported.';
		}
		
		//if you don't set compression level to this file, set level of the whole file.
		_level = obj.level || level;
		
		if(_level > 1 && typeof obj.children === 'undefined') {
			buffer = jz.algorithms.deflate(buffer, _level);
			isDeflate = true;
		}
		hb = new HeaderBuilder(buffer, name, date, offset, isDir, isDeflate);
		achiveBb.append(hb.getLocalFileHeader());
		achiveBb.append(buffer);
		centralDirBb.append(hb.getCentralDirHeader());
		offset += hb.getAchiveLength();
		n++;
	}

	files.forEach(function(item){
		compress(item, '');
	});
	
	achiveBb.append(centralDirBb.getBlob());
	achiveBb.append(getEndCentDirHeader(n, centralDirBb.getBlob().size, offset));
	return achiveBb.getBlob('application/zip');
};

//shortcut
jz.zip.c = jz.zip.pack = jz.zip.compress;

})(this, jz);