/* require:
jsziptools.js
utils.js
deflate.js
crc32.js
*/


/**
 * @param {number} n Number of Files and folders.
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
 * @param {ArrayBuffer}     buffer
 * @param {ArrayBuffer}     compressedBuffer
 * @param {string}          filename
 * @param {Date}            date
 * @param {boolean|number}  isDir
 * @param {boolean|number}  isDeflate
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
 * @return {jz.utils.Deferred}
 * 
 * @example
 * var files = [
 *     {name: 'foo.txt', str: 'foo'}, // String
 *     {name: 'bar.mp3', buffer: mp3Bytes}, // ArrayBuffer, Uint8Array, Array
 *     {name: 'baz.json', url: 'path/to/baz.json'}, // xhr
 *     {name: 'dir', dir: [ // dir
 *         {name: 'children', children: [ // dir
 *             {name: 'folder', folder: [ // dir
 *                 {name: 'aaa.txt', str: 'aaa.txt'}
 *             ]}
 *         ]}
 *     ], level: 8}
 * ];
 * 
 * jz.zip.pack({
 *     files: files,
 *     level: 6, // default is 6
 * })
 * .done(function(buffer) { }) // buffer is ArrayBuffer
 * .fail(function(err) { });
 *
 * jz.zip.pack(files)
 * .done(function(buffer) { })
 * .fail(function(err) { });
 */
zip.pack = function(params){
    var n = 0,
        offset = 0,
        archives = [],
        centralDirs = [],
        date = new Date(),
        index = 0,
        files, level;
    
    params = Array.isArray(params) ? {files: params} : params;
    files = params.files;
    level = typeof params.level === 'number' ? level : 6;
    
    function _pack(level, path, item){
        var name, buffer, compressedBuffer, hb, isDir, isDeflate,
            dir = item.children || item.dir || item.folder;
        
        if(dir){
            name = path + item.name + (item.name.substr(-1) === '/' ? '' : '/');
            buffer = new ArrayBuffer(0);
            isDir = true;
        } else if(item.buffer || item.str){
            buffer = utils.toBytes(item.buffer || item.str);
            name = path + item.name;
        } else {
            throw new Error('jz.zip.pack: This type is not supported.');
        }

        compressedBuffer = buffer;
        level = typeof item.level === 'number' ? item.level : level;
        
        if(level > 0 && !dir) {
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
            dir.forEach(_pack.bind(null, level, name));
        }
    }

    function pack(){
        files.forEach(_pack.bind(null, level, ''));
        archives = archives.concat(centralDirs);
        archives.push(getEndCentDirHeader(n, utils.concatByteArrays(centralDirs).length, offset));
        return utils.concatByteArrays(archives).buffer;
    }
    
    var deferred = new utils.Deferred,
        deferreds = [];
    
    // load files with ajax(async).
    function loadFile(item) {
        var dir = item.children || item.dir || item.folder;
        if(dir) {
            dir.forEach(loadFile);
        } else if(item.url) {
            var deferred = new utils.Deferred;
            utils.load(item.url)
            .done(function(response) {
                item.buffer = response;
                item.url = null;
                deferred.resolve();
            })
            .fail(function(e) {
                deferred.reject(e);
            });
            deferreds.push(deferred);
        }
    }

    setTimeout(function() {
        files.forEach(loadFile);
        utils.parallel(deferreds)
        .done(function() {
            try {
                deferred.resolve(pack());
            } catch (e) {
                deferred.reject(e);
            }
        })
        .fail(function(e) {
            deferred.reject(e);
        });
    }, 0);
    
    return deferred;
};

expose('jz.zip.pack', zip.pack);
