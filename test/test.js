test('test jz.utils.toBytes', function(){
    equal(jz.utils.toBytes(new ArrayBuffer(10)).constructor, Uint8Array, 'arraybuffer to uint8array');
    equal(jz.utils.toBytes(new Uint8Array(10)).constructor, Uint8Array, 'uint8array to uint8array');
});

asyncTest('test jz.utils.bytesToString', function(){
    var original;
    jz.utils.load('kokoro_utf8.txt')
    .spread(function(kokoro) {
        original = new Uint8Array(kokoro);
        return new Promise(function (resolve, reject) {
            var fr = new FileReader();
            fr.onloadend = function(){ resolve(fr.result); };
            fr.readAsText(new Blob([original]));
        });
    })
    .then(function (a) {
        jz.utils.bytesToString(original, 'UTF-8')
        .then(function(str) {
            equal(str, a, 'bytesToString: check all chars');
            start();
        });
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
    .spread(function(swf) {
        var zlibBytes = new Uint8Array(swf).subarray(8);
        var decompressed = jz.zlib.decompress(zlibBytes);
        ok(decompressed, 'decompress test');
        var compressed = jz.zlib.compress(decompressed);
        ok(jz.zlib.decompress(compressed), 'compress test');
        start();
    });
});

asyncTest('test jz.gz.compress, jz.gz.decompress', function(){
    jz.utils.load('sample.txt.gz', 'sample.txt')
    .spread(function(gzFileBuffer, fileBuffer) {
        var decompressed = jz.gz.decompress(gzFileBuffer);
        same(new Uint8Array(decompressed), new Uint8Array(fileBuffer), 'decompress test');
        var compressed = jz.gz.compress(fileBuffer, 6);
        ok(jz.gz.decompress(compressed), 'check checksum');
        start();
    });
});

asyncTest('test jz.zip.unpack(ArrayBuffer)', function(){
    var aPath = 'zipsample/a.txt';
    var bPath = 'zipsample/folder/b.txt';
    var _zipsample;
    var _a;
    var _b;

    jz.utils.load('zipsample.zip', aPath, bPath)
    .spread(function(zipsample, a, b) {
        _zipsample = zipsample;
        return Promise.all([
            jz.zip.unpack(zipsample),
            jz.utils.bytesToString(a), 
            jz.utils.bytesToString(b)
        ]);
    })
    .spread(function(reader, a, b) {
        _a = a;
        _b = b;
        return Promise.all([reader.readFileAsText(aPath), reader.readFileAsText(bPath)]);
    })
    .spread(function(a, b) {
        equal(a, _a, 'test unpack');
        equal(b, _b, 'test unpack');
        start();
    });
});

asyncTest('test jz.zip.unpack(Blob)', function(){
    var aPath = 'zipsample/a.txt';
    var bPath = 'zipsample/folder/b.txt';
    var _zipsample;
    var _a;
    var _b;

    jz.utils.load('zipsample.zip', aPath, bPath)
    .spread(function(zipsample, a, b) {
        return Promise.all([
            jz.zip.unpack(new Blob([new Uint8Array(zipsample)])),
            jz.utils.bytesToString(a), 
            jz.utils.bytesToString(b)
        ]);
    })
    .spread(function(reader, a, b) {
        return Promise.all([reader.readFileAsText(aPath), reader.readFileAsText(bPath), a, b]);
    })
    .spread(function(a, b, _a, _b) {
        equal(a, _a, 'test unpack');
        equal(b, _b, 'test unpack');
        start();
    })
    .catch(function (e) {
        console.log(e);
    });
});

asyncTest('test jz.zip.pack', function(){
    var aPath = 'zipsample/a.txt';
    var bPath = 'zipsample/folder/b.txt';
    var _a, _b;

    jz.utils.load(aPath, bPath)
    .spread(function(a, b) {
        return Promise.all([jz.utils.bytesToString(a), jz.utils.bytesToString(b)]);
    })
    .spread(function(a, b) {
        _a = a;
        _b = b;
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
        return Promise.all([reader.readFileAsText(aPath), reader.readFileAsText(bPath)]);
    })
    .spread(function(a, b) {
        console.log(arguments);
        equal(a, _a, 'test unpack');
        equal(b, _b, 'test unpack');
        start();
    })
    .catch(function (e) {
        console.log(e.message);
    });
});

asyncTest('test worker jz.utils.bytesToString', function() {
    var aPath = 'zipsample/a.txt';
    var bPath = 'zipsample/folder/b.txt';

    worker.postMessage('jz.utils.bytesToString');
    worker.onmessage = function(event) {
        equal(event.data, 'Hello world', 'test jz.utils.bytesToString');
        start();
    };
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

asyncTest('test promises in worker', function () {
    worker.postMessage('promise');
    worker.onmessage = function(event) {
        equal(event.data, 'promise', 'test promise');
        start();
    };
})

asyncTest('test worker jz.zip.unpack(ArrayBuffer)', function() {
    var aPath = 'zipsample/a.txt';
    var bPath = 'zipsample/folder/b.txt';

    jz.utils.load(aPath, bPath)
    .spread(function(a, b) {
        return Promise.all([jz.utils.bytesToString(a), jz.utils.bytesToString(b)]);
    })
    .spread(function(a, b) {
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
    .spread(function(a, b) {
        return Promise.all([jz.utils.bytesToString(a), jz.utils.bytesToString(b)]);
    })
    .spread(function(a, b) {
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
    .spread(function(a, b) {
        return Promise.all([jz.utils.bytesToString(a), jz.utils.bytesToString(b)]);
    })
    .spread(function(a, b) {
        worker.postMessage('jz.zip.pack');
        worker.onmessage = function(event) {
            var data = event.data;
            equal(data.a, a, 'test jz.utils.pack');
            equal(data.b, b, 'test jz.utils.pack');
            start();
        };
    });
});