//author: @ukyo
//license: GPLv3

jz.zip = jz.zip || {};

(function(window, jz){

var BlobBuilder = window.MozBlobBuilder || window.WebKitBlobBuilder || window.MSBlobBuilder || window.BlobBuilder;

function getLocalFileHeader(buffer, offset){
	var view = new Uint8Array(buffer, offset);
	return {
		signature: jz.utils.readUintLE(view, 0),
		needver: jz.utils.readUshortLE(view, 4),
		option: jz.utils.readUshortLE(view, 6),
		comptype: jz.utils.readUshortLE(view, 8),
		filetime: jz.utils.readUshortLE(view, 10),
		filedate: jz.utils.readUshortLE(view, 12),
		crc32: jz.utils.readUintLE(view, 14),
		compsize: jz.utils.readUintLE(view, 18),
		uncompsize: jz.utils.readUintLE(view, 22),
		fnamelen: jz.utils.readUshortLE(view, 26),
		extralen: jz.utils.readUshortLE(view, 28),
		filename: jz.utils.readString(view, 30, jz.utils.readUshortLE(view, 26)),
		headersize: 30 + jz.utils.readUshortLE(view, 26) + jz.utils.readUshortLE(view, 28),
		allsize: 30 + jz.utils.readUintLE(view, 18) + jz.utils.readUshortLE(view, 26) + jz.utils.readUshortLE(view, 28)
	}
}

function getCentralDirHeader(buffer, offset){
	var view = new Uint8Array(buffer, offset);
	return {
		signature: jz.utils.readUintLE(view, 0),
		madever: jz.utils.readUshortLE(view, 4),
		needver: jz.utils.readUshortLE(view, 6),
		option: jz.utils.readUshortLE(view, 8),
		comptype: jz.utils.readUshortLE(view, 10),
		filetime: jz.utils.readUshortLE(view, 12),
		filedate: jz.utils.readUshortLE(view, 14),
		crc32: jz.utils.readUintLE(view, 16),
		compsize: jz.utils.readUintLE(view, 20),
		uncompsize: jz.utils.readUintLE(view, 24),
		fnamelen: jz.utils.readUshortLE(view, 28),
		extralen: jz.utils.readUshortLE(view, 30),
		commentlen: jz.utils.readUshortLE(view, 32),
		disknum: jz.utils.readUshortLE(view, 34),
		inattr: jz.utils.readUshortLE(view, 36),
		outattr: jz.utils.readUintLE(view, 38),
		headerpos: jz.utils.readUintLE(view, 42),
		allsize: 46 + jz.utils.readUshortLE(view, 28) + jz.utils.readUshortLE(view, 30) + jz.utils.readUshortLE(view, 32)
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
		signature = jz.utils.readUintLE(view, offset);
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