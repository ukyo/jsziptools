/* require:
jsziptools.js
utils.js
deflate.js
crc32.js
*/


/**
 * @param {number} n number of Files and folders.
 * @param {number} centralDirHeaderSize
 * @param {number} offset A start position of a File.
 * @return {Uint8Array}
 */
function getEndCentDirHeader(n, centralDirHeaderSize, offset){
    var view = new DataView(new ArrayBuffer(22));
    view.setUint32(0, zip.END_SIGNATURE, true); 
    view.setUint16(4, 0, true);
    view.setUint16(6, 0, true);
    view.setUint16(8, n, true);
    view.setUint16(10, n, true);
    view.setUint32(12, centralDirHeaderSize, true);
    view.setUint32(16, offset, true);
    view.setUint16(20, 0, true);
    return new Uint8Array(view.buffer);
}

/**
 * @constructor
 * 
 * @param {ArrayBuffer} buffer
 * @param {ArrayBuffer} compressedBuffer
 * @param {string} filename
 * @param {Date} date
 * @param {boolean|number} isDir
 * @param {boolean|number} isDeflate
 */
function HeaderBuilder(buffer, compressedBuffer, filename, date, offset, isDir, isDeflate){
    this.buffer = buffer;
    this.compressedBuffer = compressedBuffer;
    this.filename = utils.toBytes(filename);
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
            compsize = this.compressedBuffer.byteLength,
            uncompsize = this.buffer.byteLength,
            utf8Flag = 0x0800;
        view.setUint16(0, 10, true); // version needed to extract
        view.setUint16(2, utf8Flag, true); // general purpose bit flag
        view.setUint16(4, this.deflateFlag, true); // compression method
        view.setUint16(6, getFileTime(this.date), true); // last mod file time
        view.setUint16(8, getFileDate(this.date), true); // last mod file date
        view.setUint32(10, algorithms.crc32(this.buffer), true); // crc-32
        view.setUint32(14, compsize, true); // compressed size
        view.setUint32(18, uncompsize, true); // uncompressed size
        view.setUint16(22, this.filename.length, true); // file name length
        view.setUint16(24, 0, true); // extra field length
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
        
        view.setUint32(offset, zip.LOCAL_FILE_SIGNATURE, true); offset += 4;
        arr.set(this._commonHeader, offset); offset += this._commonHeader.length;
        arr.set(this.filename, offset);
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
        
        view.setUint32(0, zip.CENTRAL_DIR_SIGNATURE, true); offset += 4; // central file header signature
        view.setUint16(offset, 0x14, true); offset += 2; // version made by
        arr.set(this._commonHeader, offset); offset += this._commonHeader.length;
        view.setUint16(offset, 0, true); offset += 2; // file comment length
        view.setUint16(offset, 0, true); offset += 2; // disk number start
        view.setUint16(offset, 0, true); offset += 2; // internal file attributes
        view.setUint32(offset, this.dirFlag, true); offset += 4; // external file attributes
        view.setUint32(offset, this.offset, true); offset += 4; // relative offset of local header
        arr.set(this.filename, offset); // file name
        return this._cache.cd = new Uint8Array(view.buffer);
    },
    
    /**
     * @return {number}
     */
    getAchiveLength: function(){
        return this.getLocalFileHeader().length + this.compressedBuffer.byteLength;
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
 * Generate a zip file buffer from a js object.
 * 
 * @param {Object} params
 * @return {jz.utils.Callbacks}
 * 
 * @example
 * 
 * jz.zip.pack({
 *     files: [{name: 'a.txt', buffer: bytes.buffer}, {name: 'b.txt', url: 'b.txt'}, {name: 'c.txt', buffer: 'hello!'}],
 *     complete: function(data){console.log(data)},
 *     error: function(err) { }
 * });
 * 
 * // or
 * 
 * jz.zip.pack({
 *     files: files,
 *     level: 6,
 * })
 * .done(function(zipbuff) { })
 * .fail(function(err) { });
 * 
 */
zip.pack = function(params){
    var n = 0,
        offset = 0,
        archives = [],
        centralDirs = [],
        date = new Date(),
        arr = [],
        index = 0,
        wait = utils.wait,
        files, level, complete, async;
    
    files = params.files;
    level = params.level !== void(0) ? params.level : 6;
    complete = typeof params.complete === 'function' ? params.complete : utils.noop;
    error = typeof params.error === 'function' ? params.error : utils.noop;
    
    //load files with ajax(async).
    function loadFiles(obj){
        var dir = obj.children || obj.dir || obj.folder;
        if(typeof obj === 'undefined') return;
        if(dir) {
            dir.forEach(loadFiles);
        } else if(obj.url) {
            utils.load(obj.url)
            .done(function(i) {
                return function(response){
                    obj.buffer = response;
                    obj.url = null;
                    arr[i] = wait.RESOLVE;
                };
            }(index))
            .fail(function(i) {
                return function(err) {
                    arr[i] = wait.REJECT;
                    throw err;
                }
            }(index));
            arr[index] = wait.PROCESSING;
            index++;
        }
    }

    
    function _pack(obj, path, level){
        var name, buffer, compressedBuffer, hb, isDir, isDeflate,
            dir = obj.children || obj.dir || obj.folder;
        
        if(typeof obj === 'undefined') return;
        if(dir){
            name = path + obj.name + (obj.name.substr(-1) === '/' ? '' : '/');
            buffer = new ArrayBuffer(0);
            isDir = true;
        } else if(obj.buffer || obj.str){
            buffer = utils.toBytes(obj.buffer || obj.str);
            name = path + obj.name;
        } else if(obj.url) {
            throw new Error('Sync call does not support to read buffer with XMLHttpRequest.');
        } else {
            throw new Error('This type is not supported.');
        }
        compressedBuffer = buffer;

        //if you don't set compression level to this file, set level of the whole file.
        level = obj.level !== void(0) ? obj.level : level;
        
        if(level > 0 && dir === void 0) {
            compressedBuffer = algorithms.deflate(buffer, level);
            isDeflate = true;
        }
        
        hb = new HeaderBuilder(buffer, compressedBuffer, name, date, offset, isDir, isDeflate);
        archives.push(hb.getLocalFileHeader());
        archives.push(new Uint8Array(compressedBuffer));
        centralDirs.push(hb.getCentralDirHeader());
        
        offset += hb.getAchiveLength();
        n++;
        
        if(dir){
            dir.forEach(function(item){
                _pack(item, name, level);
            });
        }
    }

    function pack(){
        files.forEach(function(item){
            _pack(item, '', level);
        });
        archives = archives.concat(centralDirs);
        archives.push(getEndCentDirHeader(n, utils.concatByteArrays(centralDirs).length, offset));
        return utils.concatByteArrays(archives).buffer;
    }
    
    var callbacks = new utils.Callbacks;
    
    setTimeout(function() {
        try {
            files.forEach(loadFiles);
            wait(arr).done(function() {
                var result = pack();
                callbacks.doneCallback(result);
                complete(result);
            });
        } catch(err) {
            callbacks.failCallback(err);
            error(err);
        }
    }, 1);
    
    return callbacks;
};

expose('jz.zip.pack', zip.pack);
