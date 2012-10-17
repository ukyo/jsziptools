/* require:
jsziptools.js
*/

jz.utils.noop = function() {};

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
        byteLength = 32,
        bytes = new Uint8Array(byteLength),
        i, c, _bytes;
    
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
 * @param {string} encoding
 * @param {Function} callback
 */
jz.utils.bytesToString = function(bytes, encoding, callback) {
    var fr = new FileReader();
    fr.onloadend = function() {
        callback.call(fr, fr.result);
    };
    fr.readAsText(new Blob([bytes]), encoding);
};

if(jz.env.isWorker) {
    /**
     * Convert from Uint8Array to String.
     * @param {Uint8Array} bytes
     * @param {string} encoding
     * @return {string}
     */
    jz.utils.bytesToStringSync = function(bytes, encoding) {
        return new FileReaderSync().readAsText(new Blob([bytes]), encoding);
    };
}

/**
 * @param {Uint8Array} bytes
 * @return {string} encoding
 */
jz.utils.detectEncoding = function(bytes) {
    bytes = jz.utils.toBytes(bytes);

    for(var i = 0, n = bytes.length; i < n; ++i) {
        if(bytes[i] < 0x80) {
            continue;
        } else if((bytes[i] & 0xE0) === 0xC0) {
            if((bytes[++i] & 0xC0) === 0x80) continue;
        } else if((bytes[i] & 0xF0) === 0xE0) {
            if((bytes[++i] & 0xC0) === 0x80 && (bytes[++i] & 0xC0) === 0x80) continue;
        } else if((bytes[i] & 0xF8) === 0xF0) {
            if((bytes[++i] & 0xC0) === 0x80 && (bytes[++i] & 0xC0) === 0x80 && (bytes[++i] & 0xC0) === 0x80) continue;
        } else {
            return 'cp932';
        }
    }

    return 'UTF-8';
};

/**
 * Load buffer with Ajax(async).
 * @param {Array.<string>|string} urls
 * @param {Function} complete
 * @param {Function} error
 * @return {jz.utils.Callbacks}
 * 
 * @example
 *
 * jz.utils.load(['a.zip', 'b.zip'], function(a, b){ }, function(err) { });
 * 
 * // or
 * 
 * jz.utils.load(['a.zip', 'b.zip'])
 * .done(function(a, b){ })
 * .fail(function(err){ });
 * 
 */
jz.utils.load = function(urls, complete, error){
    urls = Array.isArray(urls) ? urls : [urls];
    complete = complete || jz.utils.noop;
    error = error || jz.utils.noop;

    var results = [],
        waitArr = [],
        wait = jz.utils.wait,
        callbacks = new jz.utils.Callbacks;
    

    setTimeout(function() {
        try {
            urls.forEach(function(url, i){
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url);
                xhr.responseType = 'arraybuffer';
                xhr.onloadend = function(){
                    var s = xhr.status;
                    if(s === 200 || s === 206 || s === 0) {
                        results[i] = xhr.response;
                        waitArr[i] = wait.RESOLVE;
                    } else {
                        waitArr[i] = wait.REJECT;
                        throw new Error("Load Error: " + s);
                    }
                };
                waitArr[i] = wait.PROCESSING;
                xhr.send();
            });

            wait(waitArr).done(function() {
                callbacks.doneCallback.apply(null, results);
                complete.apply(null, results);
            });

        } catch(err) {
            callbacks.failCallback(err);
            error(err);
        }
    }, 1);
    
    return callbacks;
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

jz.utils.wait = function(arr) {
    var wait = jz.utils.wait,
        callbacks = new jz.utils.Callbacks;

    function _wait() {
        if(arr.indexOf(wait.REJECT) !== -1) return callbacks.failCallback();
        if(arr.indexOf(wait.PROCESSING) !== -1) return setTimeout(_wait, 5);
        callbacks.doneCallback();
    }
    setTimeout(_wait, 1);

    return callbacks;
};

jz.utils.wait.PROCESSING = 0;
jz.utils.wait.RESOLVE = 1;
jz.utils.wait.REJECT = 2;

jz.utils.Callbacks = function() {
    this.doneCallback = jz.utils.noop;
    this.failCallback = jz.utils.noop;
};

jz.utils.Callbacks.prototype.done = function(callback) {
    this.doneCallback = callback;
    return this;
};

jz.utils.Callbacks.prototype.fail = function(callback) {
    this.failCallback = callback;
    return this;
};

