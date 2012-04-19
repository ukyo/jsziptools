jz.zip = jz.zip || {};
jz.zip.LOCAL_FILE_SIGNATURE = 0x04034B50;
jz.zip.CENTRAL_DIR_SIGNATURE = 0x02014B50;
jz.zip.END_SIGNATURE = 0x06054B50;

(function(window, jz){

/**
 * @param {number} i index of a File.
 * @param {number} centralDirHeaderSize
 * @param {number} offset A start position of a File.
 * @return {Uint8Array}
 */
function getEndCentDirHeader(i, centralDirHeaderSize, offset){
	var view = new DataView(new ArrayBuffer(22));
	view.setUint32(0, jz.zip.END_SIGNATURE, true);
	view.setUint16(4, 0, true);
	view.setUint16(6, 0, true);
	view.setUint16(8, i, true);
	view.setUint16(10, i, true);
	view.setUint32(12, centralDirHeaderSize, true);
	view.setUint32(16, offset, true);
	view.setUint16(20, 0, true);
	return new Uint8Array(view.buffer);
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
	this.dirFlag = isDir ? 0x10 : 0;
	this.deflateFlag = isDeflate ? 0x8 : 0;
	this._commonHeader = this._getCommonHeader();
	this._cache = {lf: null, cd: null};
}



HeaderBuilder.prototype = {
	/**
	 * @return {Uint8Array}
	 */
	_getCommonHeader: function(){
		var view = new DataView(new ArrayBuffer(26)),
			compsize = this.buffer.byteLength;
		view.setUint16(0, 10, true);
		view.setUint16(2, 0, true);
		view.setUint16(4, this.deflateFlag, true);
		view.setUint16(6, getFileTime(this.date), true);
		view.setUint16(8, getFileDate(this.date), true);
		view.setUint32(10, jz.algorithms.crc32(this.buffer), true);
		view.setUint32(14, compsize, true);
		view.setUint32(18, compsize, true);
		view.setUint16(22, this.filename.length, true);
		view.setUint16(24, 0, true);
		return new Uint8Array(view.buffer);
	},
	
	/**
	 * @return {Uint8Array}
	 */
	getLocalFileHeader: function(){
		if(this._cache.lf) return this._cache.lf;
		
		var view = new DataView(new ArrayBuffer(4 + this._commonHeader.length + this.filename.length)),
			arr = new Uint8Array(view.buffer),
			offset = 0;
		
		view.setUint32(offset, jz.zip.LOCAL_FILE_SIGNATURE, true); offset += 4;
		arr.set(this._commonHeader, offset); offset += this._commonHeader.length;
		view.setString(offset, this.filename);
		return this._cache.lf = new Uint8Array(view.buffer);
	},
	
	/**
	 * @return {Uint8Array}
	 */
	getCentralDirHeader: function(){
		if(this._cache.cd) return this._cache.cd;
		
		var view = new DataView(new ArrayBuffer(20 + this._commonHeader.length + this.filename.length)),
			arr = new Uint8Array(view.buffer),
			offset = 0;
		
		view.setUint32(0, jz.zip.CENTRAL_DIR_SIGNATURE, true); offset += 4;
		view.setUint16(offset, 0x14, true); offset += 2;
		arr.set(this._commonHeader, offset); offset += this._commonHeader.length;
		view.setUint16(offset, 0, true); offset += 2;
		view.setUint16(offset, 0, true); offset += 2;
		view.setUint16(offset, 0, true); offset += 2;
		view.setUint32(offset, this.dirFlag, true); offset += 4;
		view.setUint32(offset, this.offset, true); offset += 4;
		view.setString(offset, this.filename);
		return this._cache.cd = new Uint8Array(view.buffer);
	},
	
	/**
	 * @return {number}
	 */
	getAchiveLength: function(){
		return this.getLocalFileHeader().length + this.buffer.byteLength;
	}
};


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
 * Pack to a zip format file.
 * 
 * @param {Object} params
 * @return {ArrayBuffer}
 * 
 * @example
 * 
 * //async(recommend!):
 * jz.zip.pack({
 * 	files: [{name: 'a.txt', buffer: bytes.buffer}, {name: 'b.txt', url: 'b.txt'}, {name: 'c.txt', str: 'hello!'}],
 * 	complete: function(data){console.log(data)}
 * });
 * 
 * //sync:
 * var data = jz.zip.pack({
 * 	files: files,
 * 	level: 7
 * });
 */
jz.zip.pack = function(params){
	var n = 0,
		offset = 0,
		achiveArr = [],
		centralDirArr = [],
		date = new Date(),
		stack = [],
		stackIndex = 0,
		files, level, complete, error, async;
	
	files = params.files;
	level = params.level != null ? params.level : 6;
	async = typeof params.complete === 'function';
	complete = typeof params.complete === 'function' ? params.complete : function(){};
	
	//load files with ajax(async).
	function loadFiles(obj){
		if(typeof obj === 'undefined') return;
		if(obj.children) {
			obj.children.forEach(loadFiles);
		} else if(obj.url) {
			jz.utils.load(obj.url, (function(i){
				return function(response){
					obj.buffer = response;
					delete obj.url;
					stack[i] = "load!";
				};
			})(stackIndex));
			stack[stackIndex] = 0;
			stackIndex++;
		}
	}
	
	function wait(){
		if(stack.indexOf(0) === -1 || stack.length === 0) {
			complete(pack());
		} else {
			setTimeout(wait, 5);
		}
	}
	
	function _pack(obj, dir){
		var name, buffer, hb, isDir, isDeflate, _level;
		
		if(typeof obj === 'undefined') return;
		if(obj.children){
			name = dir + obj.name + (obj.name.substr(-1) === '/' ? '' : '/');
			buffer = new ArrayBuffer(0);
			isDir = true;
		} else if(obj.url){
			buffer = jz.utils.loadSync(obj.url);
			name = dir + (obj.name || obj.url.split('/').pop());
		} else if(obj.str){
			buffer = jz.utils.stringToArrayBuffer(obj.str);
			name = dir + obj.name;
		} else if(obj.buffer){
			buffer = obj.buffer;
			name = dir + obj.name;
		} else {
			error('This type is not supported.');
		}
		
		//if you don't set compression level to this file, set level of the whole file.
		_level = obj.level || level;
		
		if(_level > 0 && typeof obj.children === 'undefined') {
			buffer = jz.algorithms.deflate(buffer, _level);
			isDeflate = true;
		}
		
		hb = new HeaderBuilder(buffer, name, date, offset, isDir, isDeflate);
		achiveArr.push(hb.getLocalFileHeader());
		achiveArr.push(new Uint8Array(buffer));
		centralDirArr.push(hb.getCentralDirHeader());
		
		offset += hb.getAchiveLength();
		n++;
		
		if(obj.children){
			obj.children.forEach(function(item){
				_pack(item, name);
			});
		}
	}

	function pack(){
		files.forEach(function(item){
			_pack(item, '');
		});
		achiveArr = achiveArr.concat(centralDirArr);
		achiveArr.push(getEndCentDirHeader(n, jz.utils.concatByteArrays(centralDirArr).length, offset));
		return jz.utils.concatByteArrays(achiveArr).buffer;
	}
	
	if(async){
		files.forEach(loadFiles);
		setTimeout(wait, 5);
	} else {
		return pack();
	}
};

//alias
jz.zip.compress = jz.zip.pack;

})(this, jz);