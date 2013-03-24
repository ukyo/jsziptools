# jsziptools

It's a utility of zlib, gzip and zip format binary data.

## suported browser

chrome, firefox, IE10.

## tests

* [test](http://ukyo.github.com/jsziptools/test/)
* [test(minified)](http://ukyo.github.com/jsziptools/test/minified.html)

## examples

### web examples

* [Deflate text](http://ukyo.github.com/jsziptools/examples/deflate_text.html)
* [Zip viewer](http://ukyo.github.com/jsziptools/examples/zip_viewer.html)

### zlib

decompress compressed swf file:

```javascript
jz.utils.load('compressed.swf')
.done(function(swf){
  var header = new Uint8Array(swf, 0, 8);
  var decompressedData = jz.zlib.decompress(new Uint8Array(swf, 8));
});
```


### gzip

compress and download:

```javascript
var text = 'aaaaaabbbbbbbbbbbccccccccc';
var gzbuff = jz.gz.compress(jz.utils.toBytes(text));
var URL = window.URL || window.webkitURL;
location.href = URL.createObjectURL(new Blob([new Uint8Array(gzbuff)]));
```

### zip

zip:

```javascript
var files = [
  {name: "foo", dir: [ // folder
    {name: "hello.txt", buffer: "Hello World!"}, // string
    {name: "bar.js", buffer: buffer}, // ArrayBuffer
    {name: "hoge.mp3", url: "audiodata/hoge.mp3"} // xhr
  ]}
];

jz.zip.pack({
  files: files,
  level: 5
})
.done(function(buffer){}) // ArrayBuffer
.fail(function(err){});


// set compression level to each files.
var files = [
  {name: "mimetype", buffer: "application/epub+zip", level: 0}, //string
  {name: "META-INF", dir: [ //folder
    {name: "container.xml", buffer: buffer, level: 0}, //ArrayBuffer
  ]},
  {name: "package.opf", url: "package.opf", level: 6},
  {name: "foo.xhtml", url: "foo.xhtml", level: 9} //xhr
];

jz.zip.pack(files)
.done(function(buffer){})
.fail(function(err){});;
```

unzip:

```javascript
jz.zip.unpack({
  buffer: buffer,
  encoding: 'Sfift_JIS'
})
.done(function(reader){
  // get file pathes.
  reader.getFileNames();
  // file is read lazily.
  reader.getFileAsText(reader.getFileNames[0])
  .done(function(result){
    alert(result);
  });
  // reader has another methods.
  // 'getFileAsArrayBuffer'
  // 'getFileAsBlob'
  // 'getFileAsDataURL'
  // 'getFileAsBinaryString'
})
.fail(function(err){});

// you can skip to set the encoding.

jz.zip.unpack(buffer)
.done(function(reader){})
.fail(function(err){});

// read file

jz.zip.unpack(ev.target.files[0])
.done(function(reader){})
.fail(function(err){});
```

## utilties

### jz.utils.load

Load files as ArrayBuffer with XHR.

```javascript
jz.utils.load('a.txt', 'b.txt')
.done(function(a, b) {
  //...
})
.fail(function(e) {});
```

### jz.utils.bytesToString

Convert bytes(Array, ArrayBuffer or Uint8Array) to String

```javascript
jz.utils.bytesToString(bytes, 'UTF-8')
.done(function(str) {
  //...
});

// default is 'UTF-8'
jz.utils.bytesToString(bytes)
.done(function(str) {
  //...
});
```

### jz.utils.parallel

Run in parallel.

```javascript
jz.utils.parallel(
  jz.utils.load('a.txt'),
  jz.utils.bytesToString(bytes),
  jz.zip.pack(files),
  jz.zip.unpack(zip)
)
.done(function(a, foo, packed, reader) {
  // ...
})
.fail(function(e) {});
```

### jz.utils.Deferred

```javascript
// wait "ms" milliseconds.
function wait(ms) {
  var deferred = new jz.utils.Deferred;
  setTimeout(function() {
    console.log(Date.now());
    deferred.resolve(ms);
  }, ms);
  return deferred.promise();
}

wait(1000)
.then(wait)
.then(wait)
.then(wait)
.then(wait);

// all async functions return "Promise"
jz.utils.load('foo.zip')
.then(jz.zip.unzip)
.then(function(reader) {
  return reader.getFileAsText('bar.txt');
})
.done(function(bar) {
  console.log(bar);
})
.fail(function(e) {
  console.log(e);
});
```

## custom build

You can use the `build.py` to build jsziptools.

```sh
$ #see help
$ ./build.py -h
usage: build.py [-h] [-C COMPILER_PATH] [-m MODULES] [-o OUTPUT_PATH]
                [-c CONF_FILE_PATH]

optional arguments:
  -h, --help         show this help message and exit
  -C COMPILER_PATH   Set a Closure Compiler path.
  -m MODULES         Set module names you want to use.
  -o OUTPUT_PATH     Set a output file path.
  -c CONF_FILE_PATH  Set a configuration file path.
  -j JQUERY_WRAP     Add to the jQuery namespace.
$ #select modules
$ ./build.py -m gz.decompress zlib.decompress -o build/gz_zlib_decomp.min.js
$ #add to jquery
$ ./build.py -m gz.decompress zlib.decompress -o build/gz_zlib_decomp.min.js -j jz
```

modules:

* `gz.compress`
* `gz.decompress`
* `gz` (`gz.compress`and`gz.decompess`)
* `zlib.compress`
* `zlib.decompress`
* `zlib` (`zlib.compress`and`zlib.decompress`)
* `zip.pack`
* `zip.unpack`
* `zip` (`zip.pack`and`zip.unpack`)

You also can write a configuration file that is written in json.

Example of a configuration file:

```json
{
    "compiler": "./compiler.jar",
    "output": "./build/jQuery.jsziptools.unzip.min.js",
    "files": [
        "src/algorithms/crc32.js",
        "src/algorithms/inflate.js",
        "src/zip.unpack.js"
    ],
    "jquery": "jz"
}
```

Usage:

```sh
$ ./build.py -c buildconf.json
$ #add to jquery
$ ./build.py -c jquery.buildconf.json
```