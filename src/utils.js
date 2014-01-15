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
 * @param  {Arguments} args
 * @param  {Array.<string>} propertyNames
 * @return {object}
 */
utils.getParams = function(args, propertyNames) {
    if (Object.prototype.toString.call(args[0]) === '[object Object]') return args[0];
    var params = {};
    propertyNames.forEach(function(name, i) {
        params[name] = args[i];
    });
    return params;
}


/**
 * convert Array, ArrayBuffer or String to Uint8Array.
 * @param {ArrayBuffer|Uint8Array|Int8Array|Array|string} buffer
 * @return {Uint8Array}
 *
 * @example
 * var bytes = jz.utils.toBytes('foo');
 * var bytes = jz.utils.toBytes([1, 2, 3]);
 */
utils.toBytes = function(buffer) {
    switch (Object.prototype.toString.call(buffer)) {
    case '[object String]':
        return utils.stringToBytes(buffer);
    case '[object Array]':
    case '[object ArrayBuffer]':
        return new Uint8Array(buffer);
    case '[object Uint8Array]':
        return buffer;
    case '[object Int8Array]':
    case '[object Uint8ClampedArray]':
    case '[object CanvasPixelArray]':
        return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    default:
        throw new Error('jz.utils.toBytes: not supported type.');
    }
};

expose('jz.utils.toBytes', utils.toBytes);


utils.readFileAs = function(type, blob, encoding) {
    var fn;
    if (env.isWorker) {
        fn = function(resolve) {
            var fr = new FileReaderSync;
            resolve(fr['readAs' + type].call(fr, blob, encoding));
        };
    } else {
        fn = function(resolve, reject) {
            var fr = new FileReader;
            fr.onload = function() {
                resolve(fr.result);
            };
            fr.onerror = reject;
            fr['readAs' + type].call(fr, blob, encoding);
        };
    }
    return new Promise(fn);
}


/**
 * @param  {Blob} blob
 * @param  {string} encoding
 * @return {Promise}
 */
utils.readFileAsText = function(blob, encoding) {
    return utils.readFileAs('Text', blob, encoding || 'UTF-8');
};

utils.readFileAsArrayBuffer = utils.readFileAs.bind(null, 'ArrayBuffer');
utils.readFileAsDataURL = utils.readFileAs.bind(null, 'DataURL');
utils.readFileAsBinaryString = utils.readFileAs.bind(null, 'BinaryString');

expose('jz.utils.readFileAsArrayBuffer', utils.readFileAsArrayBuffer);
expose('jz.utils.readFileAsText', utils.readFileAsText);
expose('jz.utils.readFileAsDataURL', utils.readFileAsDataURL);
expose('jz.utils.readFileAsBinaryString', utils.readFileAsBinaryString);


/**
 * @param {string} str
 * @return {Uint8Array}
 */
utils.stringToBytes = function(str) {
    var n = str.length,
        idx = -1,
        byteLength = 32,
        bytes = new Uint8Array(byteLength),
        i, c, _bytes;

    for (i = 0; i < n; ++i) {
        c = str.charCodeAt(i);
        if (c <= 0x7F) {
            bytes[++idx] = c;
        } else if (c <= 0x7FF) {
            bytes[++idx] = 0xC0 | (c >>> 6);
            bytes[++idx] = 0x80 | (c & 0x3F);
        } else if (c <= 0xFFFF) {
            bytes[++idx] = 0xE0 | (c >>> 12);
            bytes[++idx] = 0x80 | ((c >>> 6) & 0x3F);
            bytes[++idx] = 0x80 | (c & 0x3F);
        } else {
            bytes[++idx] = 0xF0 | (c >>> 18);
            bytes[++idx] = 0x80 | ((c >>> 12) & 0x3F);
            bytes[++idx] = 0x80 | ((c >>> 6) & 0x3F);
            bytes[++idx] = 0x80 | (c & 0x3F);
        }
        if (byteLength - idx <= 4) {
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
    return utils.readFileAsText(new Blob([utils.toBytes(bytes)]), encoding);
};

expose('jz.utils.bytesToString', utils.bytesToString);


utils.bytesToStringSync = null;

if (env.isWorker) {
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
        return new FileReaderSync().readAsText(new Blob([utils.toBytes(bytes)]), encoding || 'UTF-8');
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

    for (var i = 0, n = bytes.length; i < n; ++i) {
        if (bytes[i] < 0x80) {
            continue;
        } else if ((bytes[i] & 0xE0) === 0xC0) {
            if ((bytes[++i] & 0xC0) === 0x80) continue;
        } else if ((bytes[i] & 0xF0) === 0xE0) {
            if ((bytes[++i] & 0xC0) === 0x80 && (bytes[++i] & 0xC0) === 0x80) continue;
        } else if ((bytes[i] & 0xF8) === 0xF0) {
            if ((bytes[++i] & 0xC0) === 0x80 && (bytes[++i] & 0xC0) === 0x80 && (bytes[++i] & 0xC0) === 0x80) continue;
        } else {
            return 'Shift_JIS';
        }
    }

    return 'UTF-8';
};
expose('jz.utils.detectEncoding', utils.detectEncoding);


Promise.prototype.spread = function(onFulfillment, onRejection) {
    return Promise.prototype.then.call(this, Function.prototype.apply.bind(onFulfillment, null), onRejection);
};

/**
 * Load buffers with Ajax(async).
 * @param {Array.<string>|...string} urls
 * @return {Promise}
 *
 * @example
 * utils.load(['a.zip', 'b.zip'])
 * .spread(function(a, b){
 *   // arguments are Uint8Array
 * });
 * // or
 * utils.load('a.zip', 'b.zip')
 */
utils.load = function(urls) {
    urls = Array.isArray(urls) ? urls : utils.toArray(arguments);
    return Promise.all(urls.map(function(url, i) {
        return new Promise(function(resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url);
            xhr.responseType = 'arraybuffer';
            xhr.onloadend = function() {
                var s = xhr.status;
                (s === 200 || s === 206 || s === 0) ? resolve(new Uint8Array(xhr.response)) : reject(new Error('Load Error: ' + s + ' ' + url));
            };
            xhr.onerror = reject;
            xhr.send();
        });
    }));
};

expose('jz.utils.load', utils.load);


/**
 * @param {...(Uint8Array|ArrayBuffer)} buffers
 * @return {Uint8Array}
 *
 * @example
 * var bytes = jz.utils.concatBytes(bytes1, bytes2, bytes3);
 * var bytes = jz.utils.concatBytes([bytes1, bytes2, bytes3]);
 */
utils.concatBytes = function(buffers) {
    var buffers = Array.isArray(buffers) ? buffers : utils.toArray(arguments),
        size = 0,
        offset = 0,
        i, n, ret;

    for (i = 0, n = buffers.length; i < n; ++i) size += buffers[i].length;
    ret = new Uint8Array(size);
    for (i = 0; i < n; ++i) {
        ret.set(buffers[i], offset);
        offset += buffers[i].length;
    }
    return ret;
};

expose('jz.utils.concatBytes', utils.concatBytes);