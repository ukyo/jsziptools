/* require:
jsziptools.js
*/

utils.noop = function() {};

expose('jz.utils.noop', utils.noop);


/**
 * convert from Array, ArrayBuffer or String to Uint8Array.
 * 
 * @param {ArrayBuffer|Uint8Array|Int8Array|Uint8ClampedArray|Array|string} buffer
 * @return {Uint8Array}
 */
utils.toBytes = function(buffer){
    switch(buffer.constructor){
        case String: return utils.stringToBytes(buffer);
        case Array:
        case ArrayBuffer: return new Uint8Array(buffer);
        case Uint8Array: return buffer;
        case Int8Array:
        case Uint8ClampedArray: return new Uint8Array(buffer.buffer);
    }
};

expose('jz.utils.toBytes', utils.toBytes);


/**
 * Convert from String to Uint8Array.
 *
 * @param {string} str
 * @return {Uint8Array}
 */
utils.stringToBytes = function(str){
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

expose('jz.utils.stringToBytes', utils.stringToBytes);


/**
 * Convert from Uint8Array to String.
 * @param {Uint8Array} bytes
 * @param {string} encoding
 * @param {Function} callback
 */
utils.bytesToString = function(bytes, encoding, callback) {
    var fr = new FileReader();
    if (typeof encoding === 'function') callback = encoding;
    fr.onloadend = function() {
        callback.call(fr, fr.result);
    };
    fr.readAsText(new Blob([bytes]), encoding);
};

expose('jz.utils.bytesToString', utils.bytesToString);


utils.bytesToStringSync = null;

if(env.isWorker) {
    /**
     * Convert from Uint8Array to String.
     * @param {Uint8Array} bytes
     * @param {string} encoding
     * @return {string}
     */
    utils.bytesToStringSync = function(bytes, encoding) {
        return new FileReaderSync().readAsText(new Blob([bytes]), encoding);
    };
}

expose('jz.utils.bytesToStringSync', utils.bytesToStringSync);


/**
 * @param {Uint8Array} bytes
 * @return {string} encoding
 */
utils.detectEncoding = function(bytes) {
    bytes = utils.toBytes(bytes);

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

expose('jz.utils.detectEncoding', utils.detectEncoding);


/**
 * Load buffer with Ajax(async).
 * @param {Array.<string>|string} urls
 * @param {Function} complete
 * @param {Function} error
 * @return {utils.Callbacks}
 * 
 * @example
 *
 * utils.load(['a.zip', 'b.zip'], function(a, b){ }, function(err) { });
 * 
 * // or
 * 
 * utils.load(['a.zip', 'b.zip'])
 * .done(function(a, b){ })
 * .fail(function(err){ });
 * 
 */
utils.load = function(urls, complete, error){
    urls = Array.isArray(urls) ? urls : [urls];
    complete = complete || utils.noop;
    error = error || utils.noop;

    var results = [],
        waitArr = [],
        wait = utils.wait,
        callbacks = new utils.Callbacks;
    

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
    }, 0);
    
    return callbacks;
};

expose('jz.utils.load', utils.load);


/**
 * @param {...(Uint8Array|int8Array|Uint8ClampedArray)} byteArrays
 * @return {Uint8Array}
 */
utils.concatByteArrays = function(byteArrays){
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

expose('jz.utils.concatByteArrays', utils.concatByteArrays);


utils.wait = function(arr) {
    var wait = utils.wait,
        callbacks = new utils.Callbacks;

    function _wait() {
        if(arr.indexOf(wait.REJECT) !== -1) return callbacks.failCallback();
        if(arr.indexOf(wait.PROCESSING) !== -1) return setTimeout(_wait, 5);
        callbacks.doneCallback();
    }
    setTimeout(_wait, 0);

    return callbacks;
};

utils.wait.PROCESSING = 0;
utils.wait.RESOLVE = 1;
utils.wait.REJECT = 2;

expose('jz.utils.wait', utils.wait);
expose('jz.utils.wait.PROCESSING', utils.wait.PROCESSING);
expose('jz.utils.wait.RESOLVE', utils.wait.RESOLVE);
expose('jz.utils.wait.REJECT', utils.wait.REJECT);

/**
 * @constructor
 */
utils.Callbacks = function() {
    this.doneCallback = utils.noop;
    this.failCallback = utils.noop;
};

utils.Callbacks.prototype.done = function(callback) {
    this.doneCallback = callback;
    return this;
};

utils.Callbacks.prototype.fail = function(callback) {
    this.failCallback = callback;
    return this;
};

exposeProperty('done', utils.Callbacks, utils.Callbacks.prototype.done);
exposeProperty('fail', utils.Callbacks, utils.Callbacks.prototype.fail);