/* require:
jsziptools.js
*/

utils.noop = function() {};

/**
 * @param {*} arg
 * @return {Array}
 */
utils.toArray = function(arg) {
    return Array.prototype.slice.call(arg);
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
        case Int8Array: return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    }
};

expose('jz.utils.toBytes', utils.toBytes);


/**
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


/**
 * Convert Uint8Array to String.
 * @param {Uint8Array|ArrayBuffer} bytes
 * @param {string}     encoding Character encoding
 * @return {Promise}
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

    fr.onerror = deferred.reject;

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
 * @return {Promise}
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

    return utils.parallel(urls.map(function(url, i) {
        var deferred = new utils.Deferred,
            xhr = new XMLHttpRequest;

        xhr.open('GET', url);
        xhr.responseType = 'arraybuffer';
        xhr.onloadend = function(){
            var s = xhr.status;
            (s === 200 || s === 206 || s === 0) ?
                deferred.resolve(xhr.response) :
                deferred.reject(new Error('Load Error: ' + s + ' ' + url));
        };
        xhr.onerror = deferred.reject;
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

    if (promises.some(utils.Deferred.isPromise)) {
        var onResolved = function(i, result) {
            if (isError) return;
            count--;
            results[i] = result.length === 1 ? result[0] : result;
            if (!count) deferred.resolve.apply(deferred, results);
        };

        var onRejected = function(e) {
            if (isError) return;
            isError = true;
            deferred.reject(e);
        };

        promises.forEach(function(promise, i) {
            if (!utils.Deferred.isPromise(promise)) return onResolved(i, promise);
            promise.then(
                function() { onResolved(i, utils.toArray(arguments)) },
                onRejected
            );
        });
    } else {
        setTimeout(function() {
            deferred.resolve.apply(deferred, promises);
        }, 0);
    }

    return deferred.promise();
};

expose('jz.utils.parallel', utils.parallel);
expose('jz.utils.when', utils.parallel);


/**
 * Asynchronous function always returns Promise
 * @constructor
 */
utils.Deferred = function() {
    this.queue = [];
    this.index = 0;
    this.context = {};
    this.resolve = this.resolve.bind(this);
    this.reject = this.reject.bind(this);
};

utils.Deferred.STATE_PENDING = 'pending';
utils.Deferred.STATE_RESOLVED = 'resolved';
utils.Deferred.STATE_REJECTED = 'rejected';

utils.Deferred.isPromise = function(x) {
    return x instanceof Promise || x != null && typeof x.then === 'function';
};

utils.Deferred.prototype.transition = function(isResolve, args) {
    if (this.queue.length <= this.index) return;

    var current = this.queue[this.index++],
        handler = isResolve ? current.onResolved : current.onRejected,
        result;

    current.onResolved = current.onResolved = null; // gc

    if (current.state !== utils.Deferred.STATE_PENDING)
        throw new Error('jz.utils.Deferred.transition: State has already been ' + current.state);
    current.state = isResolve ? utils.Deferred.STATE_RESOLVED : utils.Deferred.STATE_REJECTED;

    if (typeof handler !== 'function')
        return this.transition(isResolve, args);

    try {
        var result = handler.apply(this.context, args);
        utils.Deferred.isPromise(result) ?
            result.then(this.resolve, this.reject) :
            this.resolve(result);
    } catch (e) {
        this.reject(e);
    }
};

utils.Deferred.prototype.resolve = function() {
    this.transition(true, utils.toArray(arguments));
};

utils.Deferred.prototype.reject = function(e) {
    this.transition(false, utils.toArray(arguments));
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
 * @param {Promise} Promise
 */
function Promise(deferred) {
    this.deferred = deferred;
}

/**
 * @param  {function} onResolved
 * @param  {function} onRejected
 * @return {Promise}
 */
Promise.prototype.then = function(onResolved, onRejected) {
    this.deferred.queue.push({
        onResolved: onResolved,
        onRejected: onRejected,
        state: utils.Deferred.STATE_PENDING
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
    return this.then(null, onRejected);
};

exposeProperty('then', Promise, Promise.prototype.then);
exposeProperty('done', Promise, Promise.prototype.done);
exposeProperty('fail', Promise, Promise.prototype.fail);
