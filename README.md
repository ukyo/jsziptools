# jsziptools

It's a utility of zlib, gzip and zip format binary data.

## required

If you want to run in firefox, required ffDataview(http://github.com/ukyo/ffDataView).

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

    var buffer = jz.zip.compress([
      {name: "foo", childern: [ //folder
        {name: "hello.txt", str: "Hello World!"}, //string
        {name: "bar.js", url: "../src/bar.js"} //xhr
      ]}
    ]);
    
    //個別に圧縮レベルを設定する場合
    var buffer = jz.zip.compress([
      {name: "foo", childern: [ //folder
        {name: "hello.txt", str: "Hello World!", level: 3}, //string
        {name: "bar.js", url: "../src/bar.js", level: 9} //xhr
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