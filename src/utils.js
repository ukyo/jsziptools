/* require:
jsziptools.js
*/


/**
 * convert from Array, ArrayBuffer or String to Uint8Array.
 * 
 * @param {ArrayBuffer|Uint8Array|Int8Array|Uint8ClampedArray|Array|string} buffer
 * @return {Uint8Array}
 */
jz.utils.toBytes = function(buffer){
    switch(buffer.constructor){
        case String: return jz.utils.stringToBytes(buffer);
        case Array:
        case ArrayBuffer: return new Uint8Array(buffer);
        case Uint8Array: return buffer;
        case Int8Array:
        case Uint8ClampedArray: return new Uint8Array(buffer.buffer);
    }
};


/**
 * Convert from String to Uint8Array.
 *
 * @param {string} str
 * @return {Uint8Array}
 */
jz.utils.stringToBytes = function(str){
    var n = str.length,
        idx = -1,
        byteLength = 512,
        bytes = new Uint8Array(byteLength),
        i, c, _bytes;
    
    //http://user1.matsumoto.ne.jp/~goma/js/utf.js
    for(i = 0; i < n; ++i){
        c = str.charCodeAt(i);
        if(c <= 0x7F){
            bytes[++idx] = c;
        } else if(c <= 0x7FF){
            bytes[++idx] = 0xC0 | (c >>> 6);
            bytes[++idx] = 0x80 | (c & 0x3F);
        } else if(c <= 0xFFFF){
            bytes[++idx] = 0xE0 | (c >>> 12);
            bytes[++idx] = 0x80 | ((c >>> 6) & 0x3F);
            bytes[++idx] = 0x80 | (c & 0x3F);
        } else {
            bytes[++idx] = 0xF0 | (c >>> 18);
            bytes[++idx] = 0x80 | ((c >>> 12) & 0x3F);
            bytes[++idx] = 0x80 | ((c >>> 6) & 0x3F);
            bytes[++idx] = 0x80 | (c & 0x3F);
        }
        if(byteLength - idx <= 4){
            _bytes = bytes;
            byteLength *= 2;
            bytes = new Uint8Array(byteLength);
            bytes.set(_bytes);
        }
    }
    return bytes.subarray(0, ++idx);
};

/**
 * Convert from Uint8Array to String.
 * @param {Uint8Array} bytes
 * @param {number} bufferSize
 * @return {string}
 */
jz.utils.bytesToString = function(bytes, bufferSize){
    bufferSize = bufferSize || 8192

    var buffer = new Uint32Array(bufferSize),
        n = bytes.length,
        i = 0,
        result = '',
        j, head;

    while(i < n) {
        for(j = 0; j < bufferSize && i < n; ++i, ++j) {
            head = bytes[i];
            if((head >>> 7) === 0) {
                buffer[j] = head;
            } else if((head >>> 5) === 0x05) {
                buffer[j] = ((head & 0x1F) << 6) | (bytes[++i] & 0x3F);
            } else if((head >>> 4) === 0x0E) {
                buffer[j] = 
                    ((head & 0x0F) << 12) |
                    ((bytes[++i] & 0x3F) << 6) |
                    (bytes[++i] & 0x3F);
            } else {
                buffer[j] =
                    ((head & 0x07) << 20) |
                    ((bytes[++i] & 0x3F) << 12) |
                    ((bytes[++i] & 0x3F) << 6) |
                    (bytes[++i] & 0x3F);
            }
        }
        result += String.fromCharCode.apply(void 0, buffer.subarray(0, j));
    }
    return result;
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
 * @param {...(Uint8Array|int8Array|Uint8ClampedArray)} byteArrays
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