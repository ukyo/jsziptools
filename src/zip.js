//author: @ukyo
//license: GPLv3

(function(window, jsziptools){

var BlobBuilder = window.MozBlobBuilder || window.WebKitBlobBuilder || window.MSBlobBuilder || window.BlobBuilder;

function strToBuffer(str){
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
}

function getEndCentDirHeader(n, centralDirHeaderSize, offset){
	var bb = new BlobBuilder();
	bb.append(getUint(jsziptools.END_SIGNATURE)); //signature
	bb.append(getUshort(0)); //disknum
	bb.append(getUshort(0)); //startdisknum
	bb.append(getUshort(n)); //diskdirentry
	bb.append(getUshort(n)); //direntry
	bb.append(getUint(centralDirHeaderSize)); //dirsize
	bb.append(getUint(offset)); //startpos
	bb.append(getUshort(0)); //commentlen
	return bb.getBlob();
}

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
	_getCommonHeader: function(){
		var bb = new BlobBuilder();
		bb.append(getUshort(10)); //needvar
		bb.append(getUshort(0)); //option
		bb.append(getUshort(this.defl)); //comptype
		bb.append(getUshort(getFileTime(this.date))); //filetime
		bb.append(getUshort(getFileDate(this.date))); //filedate
		bb.append(getUint(getCrc32(this.buffer))); //crc32
		bb.append(getUint(this.buffer.byteLength)); //compsize
		bb.append(getUint(this.buffer.byteLength)); //uncompsize
		bb.append(getUshort(this.filename.length)); //fnamelen
		bb.append(getUshort(0)); //extralen
		return bb.getBlob();
	},
	
	getLocalFileHeader: function(){
		if(this._cache.lf) return this._cache.lf;
		
		var bb = new BlobBuilder();
		bb.append(getUint(jsziptools.LOCAL_FILE_SIGNATURE)); //signature
		bb.append(this._commonHeader);
		bb.append(this.filename);
		return this._cache.lf = bb.getBlob();
	},
	
	getCentralDirHeader: function(){
		if(this._cache.cd) return this._cache.cd;
		
		var bb = new BlobBuilder();
		bb.append(getUint(jsziptools.CENTRAL_DIR_SIGNATURE)); //signature
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
	
	getAchiveLength: function(){
		return this.getLocalFileHeader().size + this.buffer.byteLength;
	}
};

function getUshort(i){
	return new Uint16Array([i]).buffer;
}

function getUint(i){
	return new Uint32Array([i]).buffer;
}

var getCrc32 = (function(){
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
	
	return function(buffer){
		var result = 0xFFFFFFFF, bytes = new Uint8Array(buffer), i, n, t = table;
		for(i = 0, n = bytes.length; i < n; ++i)
			result = (result >>> 8) ^ t[bytes[i] ^ (result & 0xFF)];
		return ~result;
	};
})();

function getFileDate(date){
	return ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | (date.getDay());
}

function getFileTime(date){
	return (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1);
}

jsziptools.zip = function(files, level){
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
			buffer = jsziptools.loadFileBuffer(obj.url);
			name = dir + (obj.name || obj.url.split('/').pop());
		} else if(obj.str){
			buffer = strToBuffer(obj.str);
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
			buffer = jsziptools._deflate(buffer, _level);
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

})(this, jsziptools);