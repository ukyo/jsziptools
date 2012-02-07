/**
 * Copyright (c) 2012 - Syu Kato <ukyo.web@gmail.com>
 * 
 * License: MIT
 * 
 * unpack datas from zip format data.
 */

jz.zip = jz.zip || {};

(function(window, jz){

var BlobBuilder = jz.BlobBuilder,
	uint = jz.utils.readUintLE,
	ushort = jz.utils.readUshortLE;

function getLocalFileHeader(buffer, offset){
	var view = new Uint8Array(buffer, offset);
	return {
		signature: uint(view, 0),
		needver: ushort(view, 4),
		option: ushort(view, 6),
		comptype: ushort(view, 8),
		filetime: ushort(view, 10),
		filedate: ushort(view, 12),
		crc32: uint(view, 14),
		compsize: uint(view, 18),
		uncompsize: uint(view, 22),
		fnamelen: ushort(view, 26),
		extralen: ushort(view, 28),
		filename: jz.utils.readString(view, 30, ushort(view, 26)),
		headersize: 30 + ushort(view, 26) + ushort(view, 28),
		allsize: 30 + uint(view, 18) + ushort(view, 26) + ushort(view, 28)
	}
}

function getCentralDirHeader(buffer, offset){
	var view = new Uint8Array(buffer, offset);
	return {
		signature: uint(view, 0),
		madever: ushort(view, 4),
		needver: ushort(view, 6),
		option: ushort(view, 8),
		comptype: ushort(view, 10),
		filetime: ushort(view, 12),
		filedate: ushort(view, 14),
		crc32: uint(view, 16),
		compsize: uint(view, 20),
		uncompsize: uint(view, 24),
		fnamelen: ushort(view, 28),
		extralen: ushort(view, 30),
		commentlen: ushort(view, 32),
		disknum: ushort(view, 34),
		inattr: ushort(view, 36),
		outattr: uint(view, 38),
		headerpos: uint(view, 42),
		allsize: 46 + ushort(view, 28) + ushort(view, 30) + ushort(view, 32)
	}
}

function getEndCentDirHeader(buffer, offset){
	
}

jz.zip.LazyLoader = function(buffer, files, folders, localFileHeaders, centralDirHeaders){
	this.buffer = buffer;
	this.files = files;
	this.folders = folders;
	this.localFileHeaders = localFileHeaders;
	this.centralDirHeaders = centralDirHeaders;
};

jz.zip.LazyLoader.prototype = {
	getFileNames: function(){
		var ret = [], i, n;
		for(i = 0, n = this.files.length; i < n; ++i){
			ret.push(this.localFileHeaders[this.files[i]].filename);
		}
		return ret;
	},
	getFileAsArrayBuffer: function(filename){
		var i, n;
		for(i = 0, n = this.localFileHeaders.length; i < n; ++i){
			if(filename === this.localFileHeaders[i].filename) {
				offset = this.centralDirHeaders[i].headerpos + this.localFileHeaders[i].headersize;
				len = this.localFileHeaders[i].compsize;
				if(this.centralDirHeaders[i].comptype === 0) {
					return new Uint8Array(new Uint8Array(this.buffer, offset, len)).buffer;
				}
				return jz.algorithms.inflate(new Uint8Array(this.buffer, offset, len));
			}
		}
		return null;
	},
	getFileAsText: function(filename, encoding, callback){
		var fr = new FileReader();
		if(encoding.constructor === Function) {
			callback = encoding;
			encoding = 'UTF-8';
		}
		fr.onload = function(e){
			callback.call(fr, e.target.result, e);
		}
		fr.readAsText(this.getFileAsBlob(filename), encoding);
	},
	getFileAsBinaryString: function(filename, callback){
		var fr = new FileReader();
		fr.onload = function(e){
			callback.call(fr, e.target.result, e);
		}
		fr.readAsBinaryString(this.getFileAsBlob(filename));
	},
	getFileAsDataURL: function(filename, callback){
		var fr = new FileReader();
		fr.onload = function(e){
			callback.call(fr, e.target.result, e);
		}
		fr.readAsDataURL(this.getFileAsBlob(filename));
	},
	getFileAsBlob: function(filename, contentType){
		var bb = new BlobBuilder();
		contentType = contentType || 'application/octet-stream';
		bb.append(this.getFileAsArrayBuffer(filename));
		return bb.getBlob(contentType);
	}
};

//for worker
if(window.FileReaderSync){
	(function(){
		return {
			getFileAsTextSync: function(filename, encoding){
				encoding = encodign || 'UTF-8';
				return new FileReaderSync().readAsText(this.getFileAsBlob(filename), encoidng);
			},
			getFileAsBinaryStringSync: function(filename){
				return new FileReaderSync().readAsBinarySting(this.getFileAsBlob(filename));
			},
			getFileAsDataURLSync: function(filename){
				return new FileReaderSync().readAsDataURL(this.getFileAsBlob(filename));
			}
		}
	}).call(jz.zip.LazyLoader.prototype);
}


jz.zip.decompress = function(data){
	var buffer, view, signature, header, i, n,
		localFileHeaders = [],
		centralDirHeaders = [],
		files = [],
		folders = [],
		offset = 0;
	
	if(data.constructor === ArrayBuffer) {
		buffer = data;
	} else {
		buffer = jz.utils.loadFileBuffer(data);
	}
	
	view = new Uint8Array(buffer);
	
	while(offset < view.length){
		signature = uint(view, offset);
		if(signature === jz.zip.LOCAL_FILE_SIGNATURE){
			header = getLocalFileHeader(buffer, offset);
			localFileHeaders.push(header);
			offset += header.allsize;
		} else if(signature === jz.zip.CENTRAL_DIR_SIGNATURE){
			header = getCentralDirHeader(buffer, offset);
			centralDirHeaders.push(header);
			offset += header.allsize;
		} else if(signature === jz.zip.END_SIGNATURE){
			header = getEndCentDirHeader(buffer, offset);
			break;
		} else {
			throw 'invalid zip file.';
		}
	}
	
	for(i = 0, n = localFileHeaders.length; i < n; ++i){
		if(localFileHeaders[i].crc32 !== centralDirHeaders[i].crc32) {
			throw 'invalid zip file,';
		}
		
		if(localFileHeaders[i].filename.split('/').pop()) {
			files.push(i);
		} else {
			folders.push(i);
		}
	}
	
	return new jz.zip.LazyLoader(buffer, files, folders, localFileHeaders, centralDirHeaders);
};

//shortcut
jz.zip.d = jz.zip.unpack = jz.zip.decompress;

})(this, jz);