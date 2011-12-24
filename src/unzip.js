//author: @ukyo
//license: GPLv3

(function(window, jsziptools){

var BlobBuilder = window.MozBlobBuilder || window.WebKitBlobBuilder || window.MSBlobBuilder || window.BlobBuilder;

function readInt(view, offset){
	return view[offset] | view[offset + 1] << 8 | view[offset + 2] << 16 | view[offset + 3] << 24;
}

function readShort(view, offset){
	return view[offset] | view[offset + 1] << 8;
}

function readStr(view, offset, len){
	var ret = '';
	for(var i = offset, l = offset + len; i < l; ++i){
		ret += String.fromCharCode(view[i]);
	}
	return ret;
}

function getLocalFileHeader(buffer, offset){
	var view = new Uint8Array(buffer, offset);
	return {
		signature: readInt(view, 0),
		needver: readShort(view, 4),
		option: readShort(view, 6),
		comptype: readShort(view, 8),
		filetime: readShort(view, 10),
		filedate: readShort(view, 12),
		crc32: readInt(view, 14),
		compsize: readInt(view, 18),
		uncompsize: readInt(view, 22),
		fnamelen: readShort(view, 26),
		extralen: readShort(view, 28),
		filename: readStr(view, 30, readShort(view, 26)),
		headersize: 30 + readShort(view, 26) + readShort(view, 28),
		allsize: 30 + readInt(view, 18) + readShort(view, 26) + readShort(view, 28)
	}
}

function getCentralDirHeader(buffer, offset){
	var view = new Uint8Array(buffer, offset);
	return {
		signature: readInt(view, 0),
		madever: readShort(view, 4),
		needver: readShort(view, 6),
		option: readShort(view, 8),
		comptype: readShort(view, 10),
		filetime: readShort(view, 12),
		filedate: readShort(view, 14),
		crc32: readInt(view, 16),
		compsize: readInt(view, 20),
		uncompsize: readInt(view, 24),
		fnamelen: readShort(view, 28),
		extralen: readShort(view, 30),
		commentlen: readShort(view, 32),
		disknum: readShort(view, 34),
		inattr: readShort(view, 36),
		outattr: readInt(view, 38),
		headerpos: readInt(view, 42),
		allsize: 46 + readShort(view, 28) + readShort(view, 30) + readShort(view, 32)
	}
}

function getEndCentDirHeader(buffer, offset){
	
}

jsziptools.LazyLoader = function(buffer, files, folders, localFileHeaders, centralDirHeaders){
	this.buffer = buffer;
	this.files = files;
	this.folders = folders;
	this.localFileHeaders = localFileHeaders;
	this.centralDirHeaders = centralDirHeaders;
};

jsziptools.LazyLoader.prototype = {
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
				return jsziptools._inflate(new Uint8Array(this.buffer, offset, len));
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
	}).call(jsziptools.LazyLoader.prototype);
}


jsziptools.unzip = function(data){
	var buffer, view, signature, header, i, n,
		localFileHeaders = [],
		centralDirHeaders = [],
		files = [],
		folders = [],
		offset = 0;
	
	if(data.constructor === ArrayBuffer) {
		buffer = data;
	} else {
		buffer = jsziptools.loadFileBuffer(data);
	}
	
	view = new Uint8Array(buffer);
	
	while(offset < view.length){
		signature = readInt(view, offset);
		if(signature === jsziptools.LOCAL_FILE_SIGNATURE){
			header = getLocalFileHeader(buffer, offset);
			localFileHeaders.push(header);
			offset += header.allsize;
		} else if(signature === jsziptools.CENTRAL_DIR_SIGNATURE){
			header = getCentralDirHeader(buffer, offset);
			centralDirHeaders.push(header);
			offset += header.allsize;
		} else if(signature === jsziptools.END_SIGNATURE){
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
	
	return new jsziptools.LazyLoader(buffer, files, folders, localFileHeaders, centralDirHeaders);
};

})(this, jsziptools);