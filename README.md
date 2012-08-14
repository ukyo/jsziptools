# jsziptools

It's a utility of zlib, gzip and zip format binary data.

[API Reference](http://ukyo.github.com/jsziptools/docs/build/html/index.html)

## required

required [ffDataview](http://github.com/ukyo/ffDataView).

## example

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
    var gzbuff = jz.gz.compress(jz.utils.stringToArrayBuffer(text));
    var URL = window.URL || window.webkitURL;
    var bb = new jz.BlobBuilder();
    bb.append(gzbuff);
    location.href = URL.createObjectURL(bb.getBlob());
```

### zip

zip:

```javascript
    var files = [
      {name: "foo", childern: [ //folder
        {name: "hello.txt", str: "Hello World!"}, //string
        {name: "bar.js", buffer: buffer}, //ArrayBuffer
        {name: "hoge.mp3", url: "audiodata/hoge.mp3"} //xhr
      ]}
    ];
    
    //sync
    var buffer = jz.zip.pack({
      files: files,
      level: 4 //compress level
    });
    
    //async(recommend!)
    jz.zip.pack({
      files: files,
      level: 5,
      complete: function(buffer){
        //do anything.
      }
    })
    
    //set compress level each files.
    var files = [
      {name: "foo", childern: [ //folder
        {name: "hello.txt", str: "Hello World!", level: 0}, //string
        {name: "bar.js", buffer: buffer, level: 9}, //ArrayBuffer
        {name: "hoge.mp3", url: "audiodata/hoge.mp3", level: 3} //xhr
      ]}
    ];
    
    jz.zip.pack({
      files: files,
      complete: function(buffer){
        //do anything.
      }
    });
```

unzip:

```javascript
    var loader = jz.zip.unpack(buffer);
    //get file pathes.
    loader.getFileNames();
    //file is read lazy.
    loader.getFileAsText(loader.getFileNames[0], function(result){
      alert(result);
    });
```

## custom build

You can use `build.py` to build jsziptools.

```
$ #see help
$ ./build.py -h
usage: build.py [-h] [-C COMPILER_PATH] [-m MODULES] [-o OUTPUT_PATH]
                [-c CONF_FILE_PATH]

optional arguments:
  -h, --help         show this help message and exit
  -C COMPILER_PATH   Set a Closure Compiler path.
  -m MODULES         Set module names you want to module.
  -o OUTPUT_PATH     Set a output file path.
  -c CONF_FILE_PATH  Set a configuration file path.
$ #select modules
$ ./build.py -m gz.decompress zlib.decompress -o build/gz_zlib_decomp.min.js
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
    "output": "./build/jsziptools.unzip.min.js",
    "files": [
        "src/jsziptools.js",
        "src/utils.js",
        "src/algorithms/crc32.js",
        "src/algorithms/inflate.js",
        "src/zip.unpack.js"
    ]
}
```

Usage:

```
$ ./build.py -c buildconf.json
```

support chrome, firefox, IE10.