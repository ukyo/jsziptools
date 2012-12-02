/**
 * jsziptools 2.2.1
 *
 * The MIT Lisence
 * 
 * Copyright (c) 2012 - Syu Kato <ukyo.web@gmail.com>
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var utils = {},
    algorithms = {},
    zlib = {},
    gz = {},
    zip = {},
    env = {},
    exports = exports || (function(){return this})();

zip.LOCAL_FILE_SIGNATURE = 0x04034B50;
zip.CENTRAL_DIR_SIGNATURE = 0x02014B50;
zip.END_SIGNATURE = 0x06054B50;
env.isWorker = typeof importScripts === 'function';

function expose(s, prop) {
    var paths = s.split('.');
    var last = paths.pop();
    var object = exports;
    paths.forEach(function(path) {
        object[path] = object[path] || {};
        object = object[path];
    });
    object[last] = prop;
}

function exposeClass(s, cls) {
  expose(s, cls);
  Object.keys(cls.prototype).forEach(function(key) {
    expose(s + key, cls.prototype[key]);
  });
}