/* require:
jsziptools.js
*/

utils.noop = function() {};

utils.toArray = function(obj) {
    return Array.prototype.slice.call(obj);
};


/**
 * convert Array, ArrayBuffer or String to Uint8Array.
 * @param {ArrayBuffer|Uint8Array|Int8Array|Uint8ClampedArray|Array|string} buffer
 * @return {Uint8Array}
 *
 * @example
 * var bytes = jz.utils.toBytes('foo');
 * var bytes = jz.utils.toBytes([1, 2, 3]);
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


/**
 * Convert Uint8Array to String.
 * @param {Uint8Array|ArrayBuffer} bytes
 * @param {string}     encoding Character encoding
 * @return {jz.utils.Callbacks}
 *
 * @example
 * jz.utils.bytesToString(bytes).done(function(str) {
 *     console.log(str);
 * });
 *
 * jz.utils.bytesToString(bytes, 'UTF-8').done(function(str) {
 *     console.log(str);
 * });
 */
utils.bytesToString = function(bytes, encoding) {
    bytes = utils.toBytes(bytes);

    var fr = new FileReader(),
        callbacks = new utils.Callbacks;
    
    fr.onload = function() {
        callbacks.doneCallback(fr.result);
    };

    fr.onerror = function(e) {
        callbacks.failCallback(e);
    };

    fr.readAsText(new Blob([bytes]), encoding || 'UTF-8');

    return callbacks;
};

expose('jz.utils.bytesToString', utils.bytesToString);


utils.bytesToStringSync = null;

if(env.isWorker) {
    /**
     * @param {Uint8Array|Array|ArrayBuffer} bytes
     * @param {string} encoding
     * @return {string}
     *
     * @example
     * var str = jz.utils.bytesToStringSync(bytes);
     * var str = jz.utils.bytesToStringSync(bytes, 'UTF-8');
     */
    utils.bytesToStringSync = function(bytes, encoding) {
        bytes = utils.toBytes(bytes);
        return new FileReaderSync().readAsText(new Blob([bytes]), encoding || 'UTF-8');
    };

    expose('jz.utils.bytesToStringSync', utils.bytesToStringSync);
}



/**
 * @param {Uint8Array} bytes
 * @return {string} encoding
 *
 * @example
 * var encoding = jz.utils.detectEncoding(bytes);
 * jz.utils.bytesToString(bytes, encoding).done(function(str) {
 *     console.log(str);
 * });
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
 * @param {Array.<string>|...string} urls
 * @return {jz.utils.Callbacks}
 *
 * @example
 * utils.load(['a.zip', 'b.zip'])
 * .done(function(a, b){ })
 * .fail(function(err){ });
 *
 * utils.load('a.zip', 'b.zip')
 * .done(function(a, b){ })
 * .fail(function(err){ });
 */
utils.load = function(urls){
    urls = Array.isArray(urls) ? urls : utils.toArray(arguments);

    var callbacks = new utils.Callbacks;

    utils.parallel(urls.map(function(url, i) {
        var callbacks = new utils.Callbacks,
            xhr = new XMLHttpRequest;

        xhr.open('GET', url);
        xhr.responseType = 'arraybuffer';
        xhr.onloadend = function(){
            var s = xhr.status;
            if(s === 200 || s === 206 || s === 0) {
                callbacks.doneCallback(xhr.response);
            } else {
                callbacks.failCallback(new Error('Load Error: ' + s));
            }
        };
        xhr.onerror = function(e) {
            callbacks.failCallback(e);
        };
        xhr.send();

        return callbacks;
    }))
    .done(function(results) {
        callbacks.doneCallback.apply(null, results);
    })
    .fail(function(e) {
        callbacks.failCallback(e);
    });

    return callbacks;
};

expose('jz.utils.load', utils.load);


/**
 * @param {...(Uint8Array|int8Array|Uint8ClampedArray)} byteArrays
 * @return {Uint8Array}
 *
 * @example
 * var bytes = jz.utils.concatByteArrays(bytes1, bytes2, bytes3);
 * var bytes = jz.utils.concatByteArrays([bytes1, bytes2, bytes3]);
 */
utils.concatByteArrays = function(byteArrays){
    var byteArrays = Array.isArray(byteArrays) ? byteArrays : utils.toArray(arguments),
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


/**
 * @param  {Array.<jz.utils.Callbacks>|...jz.utils.Callbacks} callbacksArr
 * @return {jz.utils.Callbacks}
 */
utils.parallel = function(callbacksArr) {
    callbacksArr = Array.isArray(callbacksArr) ? callbacksArr : utils.toArray(arguments);

    var callbacks = new utils.Callbacks,
        results = [],
        count = callbacksArr.length,
        isError = false;

    function doneCallback(i, result) {
        if (isError) return;
        count--;
        results[i] = result;
        if (!count) callbacks.doneCallback(results);
    }

    function failCallback(e) {
        isError = true;
        callbacks.failCallback(e);
    }

    callbacksArr.forEach(function(callbacks, i) {
        callbacks
        .done(doneCallback.bind(null, i))
        .fail(failCallback);
    });

    return callbacks;
};

expose('jz.utils.parallel', utils.parallel);


/**
 * @param  {Array.<function>|...function} funcs each function must return jz.utils.Callbacks.
 * @return {jz.utils.Callbacks}
 *
 * @example
 * jz.utils.waterfall(function(){
 *     return jz.utils.load('foo.zip', 'bar.txt', 'baz.js');
 * }, function(foo, bar, baz) {
 *     this.bar = bar;
 *     this.baz = baz;
 *     return jz.zip.unpack(foo);
 * }, function(reader) {
 *     var filenames = reader.getFileNames();
 *     var callbacksArr = filenames.map(function(filename) {
 *         return reader.getFileAsText(filename);
 *     }).push(
 *         jz.utils.bytesToString(this.bar),
 *         jz.utils.bytesToString(this.baz)
 *     );
 *     return jz.utils.parallel(callbacksArr);
 * })
 * .done(function(texts) {
 *     texts.forEach(console.log.bind(console));
 * })
 * .fail(function(e) {
 *     console.log(e);
 * });
 */
utils.waterfall = function(funcs) {
    var callbacks = new utils.Callbacks, context = {};
    
    funcs = Array.isArray(funcs) ? funcs : utils.toArray(arguments);

    function doneCallback() {
        callbacks.doneCallback.apply(context, arguments);
    }

    function failCallback(e) {
        callbacks.failCallback(e);
    }

    (function next() {
        funcs
        .shift()
        .apply(context, arguments)
        .done(funcs.length > 0 ? next : doneCallback)
        .fail(failCallback);
    })();

    return callbacks;
}

expose('jz.utils.waterfall', utils.waterfall);


/**
 * Asynchronous function always returns jz.utils.Callbacks
 * @constructor
 */
utils.Callbacks = function() {
    this.doneCallback = utils.noop;
    this.failCallback = utils.noop;
};

/**
 * @param  {function} callback Done callback
 * @return {jz.utils.Callbacks} 
 */
utils.Callbacks.prototype.done = function(callback) {
    this.doneCallback = callback;
    return this;
};

/**
 * @param  {function} callback Fail callback
 * @return {jz.utils.Callbacks} 
 */
utils.Callbacks.prototype.fail = function(callback) {
    this.failCallback = callback;
    return this;
};

expose('jz.utils.Callbacks', utils.Callbacks);
exposeProperty('done', utils.Callbacks, utils.Callbacks.prototype.done);
exposeProperty('fail', utils.Callbacks, utils.Callbacks.prototype.fail);