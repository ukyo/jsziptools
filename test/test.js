test('test jz.utils.toBytes', function(){
    equal(jz.utils.toBytes(new ArrayBuffer(10)).constructor, Uint8Array, 'arraybuffer to uint8array');
    equal(jz.utils.toBytes(new Uint8Array(10)).constructor, Uint8Array, 'uint8array to uint8array');
});

asyncTest('test jz.utils.toBytes, jz.utils.bytesToString', function(){
    jz.utils.load('kokoro_utf8.txt')
    .done(function(kokoro) {
        var original = new Uint8Array(kokoro),
            fr = new FileReader();

        fr.onloadend = function(){
            var result = jz.utils.toBytes(fr.result),
                i, n, isCorrect = true;

            for(i = 0, n = result.length; i < n; ++i) {
                if(result[i] !== original[i]) {
                    isCorrect = false;
                    break;
                }
            }

            equal(result.length, original.length, 'toBytes: check byte length');
            ok(isCorrect, 'toBytes: check all bytes');

            jz.utils.bytesToString(original, 'UTF-8')
            .done(function(str) {
                equal(str, fr.result, 'bytesToString: check all chars');    
                start();
            });
        };

        fr.readAsText(new Blob([original]));
    });
});

asyncTest('test jz.utils.Deferred', function(){
    var d = new jz.utils.Deferred;
    setTimeout(function() {
        d.resolve(10);
    }, 10);
    
    d.promise()
    .then(function(ms) {
        equal(ms, 10, 'async call');
        return ms;
    })
    .then(function(ms) {
        equal(ms, 10, 'sync call');
        this.foo = 'foo';
    })
    .then(function() {
        equal(this.foo, 'foo', '"this" context is shared');
    })
    .then(function() {
        var d = new jz.utils.Deferred;
        setTimeout(function() {
            d.resolve(1, 2);
        }, 0);
        return d.promise();
    })
    .then(function(a, b) {
        equal(a, 1, 'multi arguments');
        equal(b, 2, 'multi arguments');
        return 'done';
    })
    .done(function(s) {
        equal(s, 'done', 'done');
        start();
    });
});

asyncTest('test jz.utils.Deferred (throw error)', function(){
    var d = new jz.utils.Deferred;
    setTimeout(function() {
        d.resolve(10);
    }, 10);
    
    d.promise()
    .then(function() {
        throw new Error('throw error');
    })
    .done(function() {
        ok(false, 'done callback should not be called')
    })
    .fail(function(e) {
        equal(e.message, 'throw error', 'throw error');
        start();
    });
});

asyncTest('test jz.utils.Deferred (reject)', function(){
    var d = new jz.utils.Deferred;
    setTimeout(function() {
        d.reject(new Error('rejected'));
    }, 10);
    
    d.promise()
    .done(function() {
        ok(false, 'done callback should not be called')
    })
    .fail(function(e) {
        equal(e.message, 'rejected', 'rejected');
        start();
    });
});

test('test jz.algorithms.deflate, jz.algorithms.inflate', function(){
    var arr = [1, 1, 1, 1];
    var ui8arr = new Uint8Array(arr);

    try {
        jz.algorithms.deflate([]);
    } catch (e) {
        ok(e, 'test error: empty array(deflate)');
    }

    try {
        jz.algorithms.inflate([]);
    } catch (e) {
        ok(e, 'test error: empty array(inflate)');
    }

    try {
        jz.algorithms.inflate([0]);
    } catch (e) {
        ok(e, 'test error: invalid deflate stream');
    }
    
    var compressed = jz.algorithms.deflate(ui8arr);
    ok(compressed, 'compress with deflate');
    
    var decompressed = jz.algorithms.inflate(compressed);
    ok(decompressed, 'decompress with inflate');
    
    ui8arr = new Uint8Array(decompressed);
    var arr2 = [];
    for(var i = 0; i < ui8arr.length; ++i) arr2.push(ui8arr[i]);
    same(arr, arr2, 'diff arr arr2');
    same(new Uint8Array(arr), ui8arr, 'hoge');
});

asyncTest('test jz.zlib.compress, jz.zlib.decompress', function(){
    //this file is compressed.
    //http://www.nicovideo.jp/watch/nm12945826
    jz.utils.load('nicowari.swf')
    .done(function(swf) {
        var zlibBytes = new Uint8Array(swf).subarray(8);
        var decompressed = jz.zlib.decompress(zlibBytes, true);
        ok(decompressed, 'decompress test');
        var compressed = jz.zlib.compress(decompressed);
        ok(jz.zlib.decompress(compressed, true), 'compress test');
        start();
    });
});

asyncTest('test jz.gz.compress, jz.gz.decompress', function(){
    jz.utils.load('sample.txt.gz', 'sample.txt')
    .done(function(gzFileBuffer, fileBuffer) {
        var decompressed = jz.gz.decompress(gzFileBuffer, true);
        same(new Uint8Array(decompressed), new Uint8Array(fileBuffer), 'decompress test');
        var compressed = jz.gz.compress(fileBuffer, 6, {fname: 'sample.txt'});
        ok(jz.gz.decompress(compressed, true), 'check checksum');
        start();
    });
});

asyncTest('test jz.zip.unpack(ArrayBuffer)', function(){
    var aPath = 'zipsample/a.txt';
    var bPath = 'zipsample/folder/b.txt';

    jz.utils.load('zipsample.zip', aPath, bPath)
    .then(function(zipsample, a, b) {
        this.zipsample = zipsample;
        return jz.utils.parallel(jz.utils.bytesToString(a), jz.utils.bytesToString(b));
    })
    .then(function(a, b) {
        this.a = a;
        this.b = b;
        return jz.zip.unpack(this.zipsample);
    })
    .then(function(reader) {
        return jz.utils.parallel(reader.getFileAsText(aPath), reader.getFileAsText(bPath));
    })
    .then(function(a, b) {
        equal(a, this.a, 'test unpack');
        equal(b, this.b, 'test unpack');
        start();
    });
});

asyncTest('test jz.zip.unpack(Blob)', function(){
    var aPath = 'zipsample/a.txt';
    var bPath = 'zipsample/folder/b.txt';

    jz.utils.load('zipsample.zip', aPath, bPath)
    .then(function(zipsample, a, b) {
        this.zipsample = zipsample;
        return jz.utils.parallel(jz.utils.bytesToString(a), jz.utils.bytesToString(b));
    })
    .then(function(a, b) {
        this.a = a;
        this.b = b;
        return jz.zip.unpack(new Blob([new Uint8Array(this.zipsample)]));
    })
    .then(function(reader) {
        return jz.utils.parallel(reader.getFileAsText(aPath), reader.getFileAsText(bPath));
    })
    .then(function(a, b) {
        equal(a, this.a, 'test unpack');
        equal(b, this.b, 'test unpack');
        start();
    });
});

asyncTest('test jz.zip.pack', function(){
    var aPath = 'zipsample/a.txt';
    var bPath = 'zipsample/folder/b.txt';

    jz.utils.load(aPath, bPath)
    .then(function(a, b) {
        return jz.utils.parallel(jz.utils.bytesToString(a), jz.utils.bytesToString(b));
    })
    .then(function(a, b) {
        this.a = a;
        this.b = b;
        var files = [
            {name: 'zipsample', dir: [
                {name: 'a.txt', url: aPath},
                {name: 'folder', dir: [
                    {name: 'b.txt', url: bPath}
                ]}
            ]}
        ];
        return jz.zip.pack(files);
    })
    .then(jz.zip.unpack)
    .then(function(reader) {
        return jz.utils.parallel(reader.getFileAsText(aPath), reader.getFileAsText(bPath));
    })
    .then(function(a, b) {
        equal(a, this.a, 'test unpack');
        equal(b, this.b, 'test unpack');
        start();
    });
});

asyncTest('test worker jz.utils.bytesToStringSync', function() {
    var aPath = 'zipsample/a.txt';
    var bPath = 'zipsample/folder/b.txt';

    worker.postMessage('jz.utils.bytesToStringSync');
    worker.onmessage = function(event) {
        equal(event.data, 'Hello world', 'test jz.utils.bytesToStringSync');
        start();
    };
});

asyncTest('test worker jz.zip.unpack(ArrayBuffer)', function() {
    var aPath = 'zipsample/a.txt';
    var bPath = 'zipsample/folder/b.txt';

    jz.utils.load(aPath, bPath)
    .then(function(a, b) {
        return jz.utils.parallel(jz.utils.bytesToString(a), jz.utils.bytesToString(b));
    })
    .then(function(a, b) {
        worker.postMessage('jz.zip.unpack(ArrayBuffer)');
        worker.onmessage = function(event) {
            var data = event.data;
            equal(data.a, a, 'test jz.utils.unpack(ArrayBuffer)');
            equal(data.b, b, 'test jz.utils.unpack(ArrayBuffer)');
            start();
        };
    });
});

asyncTest('test worker jz.zip.unpack(Blob)', function() {
    var aPath = 'zipsample/a.txt';
    var bPath = 'zipsample/folder/b.txt';

    jz.utils.load(aPath, bPath)
    .then(function(a, b) {
        return jz.utils.parallel(jz.utils.bytesToString(a), jz.utils.bytesToString(b));
    })
    .done(function(a, b) {
        worker.postMessage('jz.zip.unpack(Blob)');
        worker.onmessage = function(event) {
            var data = event.data;
            equal(data.a, a, 'test jz.utils.unpack(Blob)');
            equal(data.b, b, 'test jz.utils.unpack(Blob)');
            start();
        };
    });
});

asyncTest('test worker jz.zip.pack', function() {
    var aPath = 'zipsample/a.txt';
    var bPath = 'zipsample/folder/b.txt';

    jz.utils.load(aPath, bPath)
    .then(function(a, b) {
        return jz.utils.parallel(jz.utils.bytesToString(a), jz.utils.bytesToString(b));
    })
    .done(function(a, b) {
        worker.postMessage('jz.zip.pack');
        worker.onmessage = function(event) {
            var data = event.data;
            equal(data.a, a, 'test jz.utils.pack');
            equal(data.b, b, 'test jz.utils.pack');
            start();
        };
    });
});