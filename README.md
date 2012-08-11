# jsziptools

It's a utility of zlib, gzip and zip format binary data.

[API Reference](http://ukyo.github.com/jsziptools/docs/build/html/index.html)

## required

required [ffDataview](http://github.com/ukyo/ffDataView).

## example

### zlib

decompress compressed swf file:

    jz.utils.load('compressed.swf', function(swf){
      var header = new Uint8Array(swf, 0, 8);
      var decompressedData = jz.zlib.decompress(new Uint8Array(swf, 8));
    });
    


### gzip

compress and download:

    var text = 'aaaaaabbbbbbbbbbbccccccccc';
    var gzbuff = jz.gz.compress(jz.utils.stringToArrayBuffer(text));
    var URL = window.URL || window.webkitURL;
    var bb = new jz.BlobBuilder();
    bb.append(gzbuff);
    location.href = URL.createObjectURL(bb.getBlob());

### zip

zip:

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


unzip:

    //if arg is string, load with xhr.
    var loader = jz.zip.unpack("foo.zip");
    //get file pathes.
    loader.getFileNames();
    //file is read lazy.
    loader.getFileAsText(loader.getFileNames[0], function(result){
      alert(result);
    });

support chrome, firefox, IE10.