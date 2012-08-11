/* require:
jsziptools.js
*/


/**
 * convert from Array, ArrayBuffer or String to Uint8Array.
 * 
 * @param {ArrayBuffer|Uint8Array|Array|string} buffer
 * @return {Uint8Array}
 */
jz.utils.toBytes = function(buffer){
    if(typeof buffer === 'string') buffer = jz.utils.stringToArrayBuffer(buffer);
    return (buffer.constructor === ArrayBuffer || Array.isArray(buffer)) ? new Uint8Array(buffer) : buffer; 
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
 * Load buffer with Ajax.
 * 
 * @param {string} url
 * @return {ArrayBuffer}
 */
jz.utils.loadSync = function(url){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    //304対策
    xhr.setRequestHeader('If-Modified-Since', '01 Jan 1970 00:00:00 GMT');
    xhr.responseType = 'arraybuffer';
    xhr.send();
    return xhr.response;
};

/**
 * Load buffer with Ajax(async).
 * @param {Array.<string>|string} urls
 * @param {Function} complete
 */
jz.utils.load = function(urls, complete){
    urls = Array.isArray(urls) ? urls : [urls];
    complete = complete || function(){};
    var results = [];
    
    urls.forEach(function(url, i){
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.responseType = 'arraybuffer';
        xhr.onloadend = function(){
            var s = xhr.status;
            if(s === 200 || s === 206 || s === 0) {
                results[i] = xhr.response;
            } else {
                throw "Load Error: " + s;
            }
        };
        results[i] = 0;
        xhr.send();
    });
    
    (function wait(){
        results.indexOf(0) === -1 ? complete.apply(null, results) : setTimeout(wait, 5);
    })();
};

/**
 * @param {...(Uint8Array|int8Array)} byteArrays
 * @return {Uint8Array}
 */
jz.utils.concatByteArrays = function(byteArrays){
    var byteArrays = Array.isArray(byteArrays) ? byteArrays : Array.prototype.slice.call(arguments, 0),
        size = 0,
        offset = 0,
        i, n, ret;
    
    for(i = 0, n = byteArrays.length; i < n; ++i) size += byteArrays[i].length;
    ret = new Uint8Array(size);
    for(i = 0; i < n; ++i) {
        ret.set(byteArrays[i], offset);
        offset += byteArrays[i].length;
    }
    return ret;
};