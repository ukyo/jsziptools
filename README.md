# jsziptools

It's a utility of zlib, gzip and zip format binary data.

## zlib

decompress compressed swf file:

    var swf = jz.utils.loadFileBuffer('compressed.swf');
    var header = new Uint8Array(swf, 0, 8);
    var decompressedData = jz.zlib.decompress(new Uint8Array(swf, 8));


## gzip

compress and download:

    var text = 'aaaaaabbbbbbbbbbbccccccccc';
    var gzbuff = jz.gz.compress(jz.utils.stringToArrayBuffer(text));
    var BlobBuilder = window.MozBlobBuilder || window.WebKitBlobBuilder;
    var URL = window.URL || window.webkitURL;
    var bb = new BlobBuilder();
    bb.append(gzbuff);
    location.href = URL.createObjectURL(bb.getBlob());
    //rename a download file.

## zip

zip:

    var b = jz.zip.compress([
      {name: "foo", childern: [ //folder
        {name: "hello.txt", str: "Hello World!"}, //string
        {name: "bar.js", url: "../src/bar.js"} //xhr
      ]}
    ]);


unzip:

    //if arg is string, load with xhr.
    var loader = jz.zip.decompress("foo.zip");
    //get file pathes.
    loader.getFileNames();
    //file is read lazy.
    loader.getFileAsText(loader.getFileNames[0], function(result){
      alert(result);
    });

support chrome, firefox, IE10.