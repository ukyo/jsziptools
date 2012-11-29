# jsziptools

It's a utility of zlib, gzip and zip format binary data.

[API Reference](http://ukyo.github.com/jsziptools/docs/build/html/index.html)

## suported browser

chrome, firefox, IE10.

## examples

### zlib

decompress compressed swf file:

```javascript
jz.utils.load('compressed.swf', function(swf){
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
  level: 5, // compress level
  complete: function(buffer){ // buffer is ArrayBuffer
    //...
  },
  error: function(err){
    //...
  }
});

// or

jz.zip.pack({
  files: files,
  level: 5
})
.done(function(buffer){})
.fail(function(err){});


//set compress level each files.
var files = [
  {name: "mimetype", buffer: "application/epub+zip", level: 0}, //string
  {name: "META-INF", dir: [ //folder
    {name: "container.xml", buffer: buffer, level: 0}, //ArrayBuffer
  ]},
  {name: "package.opf", url: "package.opf", level: 6},
  {name: "foo.xhtml", url: "foo.xhtml", level: 9} //xhr
];

jz.zip.pack({
  files: files,
  complete: function(buffer){
    //...
  }
});
```

unzip:

```javascript
jz.zip.unpack({
  buffer: buffer,
  encoding: 'cp932', //encoding of filenames.
  complete: function(reader) {
    // get file pathes.
    reader.getFileNames();
    // file is read lazy.
    reader.getFileAsText(reader.getFileNames[0], function(result){
      alert(result);
    });
  },
  error: function(err) {}
});

// or

jz.zip.unpack({
  buffer: buffer,
  encoding: 'cp932'
})
.done(function(reader){})
.fail(function(err){});

// you can skip to set the encoding.

jz.zip.unpack(buffer)
.done(function(reader){})
.fail(function(err){});
```

## custom build

You can use the `build.py` to build jsziptools.

```
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

module list:

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
        "src/jsziptools.js",
        "src/utils.js",
        "src/algorithms/crc32.js",
        "src/algorithms/inflate.js",
        "src/zip.unpack.js"
    ],
    "jquery": "jz"
}
```

Usage:

```
$ ./build.py -c jquery.buildconf.json
```