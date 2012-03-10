/**
 * Copyright (c) 2012 - Syu Kato <ukyo.web@gmail.com>
 * 
 * License: MIT
 * 
 * unpack datas from zip format data.
 */

jz.zip = jz.zip || {};

(function(window, jz){

var BlobBuilder = jz.BlobBuilder;

function getLocalFileHeader(buffer, offset){
	var view = new DataView(buffer, offset);
	return {
		signature: view.getUint32(0, true),
		needver: view.getUint16(4, true),
		option: view.getUint16(6, true),
		comptype: view.getUint16(8, true),
		filetime: view.getUint16(10, true),
		filedate: view.getUint16(12, true),
		crc32: view.getUint32(14, true),
		compsize: view.getUint32(18, true),
		uncompsize: view.getUint32(22, true),
		fnamelen: view.getUint16(26, true),
		extralen: view.getUint16(28, true),
		filename: view.getString(30, view.getUint16(26, true)),
		headersize: 30 + view.getUint16(26, true) + view.getUint16(28, true),
		allsize: 30 + view.getUint32(18, true) + view.getUint16(26, true) + view.getUint16(28, true)
	}
}

function getCentralDirHeader(buffer, offset){
	var view = new DataView(buffer, offset);
	return {
		signature: view.getUint32(0, true),
		madever: view.getUint16(4, true),
		needver: view.getUint16(6, true),
		option: view.getUint16(8, true),
		comptype: view.getUint16(10, true),
		filetime: view.getUint16(12, true),
		filedate: view.getUint16(14, true),
		crc32: view.getUint32(16, true),
		compsize: view.getUint32(20, true),
		uncompsize: view.getUint32(24, true),
		fnamelen: view.getUint16(28, true),
		extralen: view.getUint16(30, true),
		commentlen: view.getUint16(32, true),
		disknum: view.getUint16(34, true),
		inattr: view.getUint16(36, true),
		outattr: view.getUint32(38, true),
		headerpos: view.getUint32(42, true),
		allsize: 46 + view.getUint16(28, true) + view.getUint16(30, true) + view.getUint16(32, true)
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
	
	view = new DataView(buffer);
	
	while(offset < buffer.byteLength){
		signature = view.getUint32(offset, true);
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

//alias
jz.zip.d = jz.zip.unpack = jz.zip.decompress;

})(this, jz);