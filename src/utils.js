/* require:
jsziptools.js
*/

utils.noop = function() {};

utils.toArray = function(obj) {
    return Array.prototype.slice.call(obj);
};


/**
 * convert Array, ArrayBuffer or String to Uint8Array.
 * @param {ArrayBuffer|Uint8Array|Int8Array|Array|string} buffer
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
        case Int8Array: return new Uint8Array(buffer.buffer);
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
 * @return {jz.utils.Deferred}
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
        deferred = new utils.Deferred;
    
    fr.onload = function() {
        deferred.resolve(fr.result);
    };

    fr.onerror = function(e) {
        deferred.reject(e);
    };

    fr.readAsText(new Blob([bytes]), encoding || 'UTF-8');

    return deferred.promise();
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
            return 'Shift_JIS';
        }
    }

    return 'UTF-8';
};

expose('jz.utils.detectEncoding', utils.detectEncoding);


/**
 * Load buffer with Ajax(async).
 * @param {Array.<string>|...string} urls
 * @return {jz.utils.Deferred}
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

    var deferred = new utils.Deferred;

    // setTimeout(function() {
    //     utils.parallel(urls.map(function(url, i) {
    //         var deferred = new utils.Deferred,
    //             xhr = new XMLHttpRequest;

    //         xhr.open('GET', url);
    //         xhr.responseType = 'arraybuffer';
    //         xhr.onloadend = function(){
    //             var s = xhr.status;
    //             if(s === 200 || s === 206 || s === 0) {
    //                 deferred.resolve(xhr.response);
    //             } else {
    //                 deferred.reject(new Error('Load Error: ' + s + ' ' + url));
    //             }
    //         };
    //         xhr.onerror = function(e) {
    //             deferred.reject(e);
    //         };
    //         xhr.send();

    //         return deferred.promise();
    //     }))
    //     .then(
    //         deferred.resolve.bind(deferred),
    //         deferred.reject.bind(deferred)
    //     );
    // }, 0);

    // return deferred.promise();
    
    return utils.parallel(urls.map(function(url, i) {
        var deferred = new utils.Deferred,
            xhr = new XMLHttpRequest;

        xhr.open('GET', url);
        xhr.responseType = 'arraybuffer';
        xhr.onloadend = function(){
            var s = xhr.status;
            if(s === 200 || s === 206 || s === 0) {
                deferred.resolve(xhr.response);
            } else {
                deferred.reject(new Error('Load Error: ' + s + ' ' + url));
            }
        };
        xhr.onerror = function(e) {
            deferred.reject(e);
        };
        xhr.send();

        return deferred.promise();
    }));
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
 * @param  {Array.<Promise>|...Promise} promises
 * @return {Promise}
 */
utils.parallel = function(promises) {
    promises = Array.isArray(promises) ? promises : utils.toArray(arguments);

    var deferred = new utils.Deferred,
        results = [],
        count = promises.length,
        isError = false;

    function onResolved(i, result) {
        if (isError) return;
        count--;
        results[i] = result;
        if (!count) deferred.resolve.apply(deferred, results);
    }

    function onRejected(e) {
        isError = true;
        deferred.reject(e);
    }

    // setTimeout(function() {
        promises.forEach(function(promise, i) {
            promise.then(onResolved.bind(null, i), onRejected);
        });
    // }, 0);

    return deferred.promise();
};

expose('jz.utils.parallel', utils.parallel);


/**
 * Asynchronous function always returns jz.utils.Deferred
 * @constructor
 */
utils.Deferred = function() {
    this.queue = [];
    this.context = {};
    this.current = {};
};

utils.Deferred.prototype.resolve = function() {
    if (!this.queue.length) return;

    this.current = this.queue.shift();

    try {
        var result = this.current.onResolved.apply(this.context, arguments);
        Promise.isPromise(result) ?
            result.then(this.resolve.bind(this), this.reject.bind(this)) :
            this.resolve(result);
    } catch (e) {
        this.reject(e);
    }
};

utils.Deferred.prototype.reject = function(e) {
    while (!this.current.onRejected && this.queue.length)
        this.current = this.queue.shift();
    this.current.onRejected && this.current.onRejected.call(this.context, e);
};


utils.Deferred.prototype.promise = function() {
    return new Promise(this);
};

expose('jz.utils.Deferred', utils.Deferred);
exposeProperty('resolve', utils.Deferred, utils.Deferred.prototype.resolve);
exposeProperty('reject', utils.Deferred, utils.Deferred.prototype.reject);
exposeProperty('promise', utils.Deferred, utils.Deferred.prototype.promise);


/**
 * @constructor
 * @param {jz.utils.Deferred} deferred
 */
function Promise(deferred) {
    this.deferred = deferred;
}

/**
 * @param  {*}  x
 * @return {Boolean}
 */
Promise.isPromise = function(x) {
    return x && typeof x.then === 'function';
}

/**
 * @param  {function} onResolved
 * @param  {function} onRejected
 * @return {Promise}
 */
Promise.prototype.then = function(onResolved, onRejected) {
    this.deferred.queue.push({
        onResolved: onResolved || utils.noop,
        onRejected: onRejected
    });
    return this;
};

/**
 * @param  {function} onResolved
 * @return {Promise}
 */
Promise.prototype.done = function(onResolved) {
    return this.then(onResolved);
};

/**
 * @param  {function} onRejected
 * @return {Promise}
 */
Promise.prototype.fail = function(onRejected) {
    return this.then(utils.noop, onRejected);
};

exposeProperty('then', Promise, Promise.prototype.then);
exposeProperty('done', Promise, Promise.prototype.done);
exposeProperty('fail', Promise, Promise.prototype.fail);