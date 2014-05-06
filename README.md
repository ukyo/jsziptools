# jsziptools

It's a utility of zlib, gzip and zip format binary data.

## suported browser

chrome, firefox, IE10, safari, opera.

## examples

### web examples

* [Deflate text](http://ukyo.github.com/jsziptools/examples/deflate_text.html)
* [Zip viewer](http://ukyo.github.com/jsziptools/examples/zip_viewer.html)

## APIs

If the api is written as *foo({a, b, c})*, you can call it as below.

```js
foo(1, 2, 3);
foo({
  a: 1,
  b: 2,
  c: 3
});
```

### Promise

jsziptools uses ES6 Promises and add `spread` method.

### Promise.prototype.spread(onFulfillment, onRejection)

* @param {function} onFulfillment
* @param {function} onRejection - optional
* @return {Promise}

It spreads a Array argument in a `onFulfillment` callback. 

```js
// in ES6 Promises then
Promise.all([1, 2, 3]).then(function (args) {
  var one = args[0], two = args[1], three = args[2];
});

// in Promise.prototype.spread
Promise.all([1, 2, 3]).spread(function (one, two, three) {
  // ...
});
```

### utils

#### jz.utils.toBytes(buffer)

* @param {ArrayBuffer|Uint8Array|Array|string} buffer
* @return {Uint8Array}

#### jz.utils.readFileAsArrayBuffer(blob)

* @param {Blob} blob
* @return {Promise}

```js
jz.utils.readFileAsArrayBuffer(blob)
.then(function (buffer) {
  // ...
});
```

#### jz.utils.readFileAsText(blob, encoding)

* @param {Blob} blob
* @param {string} encoding - optional (default is `"UTF-8"`)
* @return {Promise}

#### jz.utils.readFileAsDataURL(blob)

* @param {Blob} blob
* @return {Promise}

#### jz.utils.readFileAsBinaryString(blob)

* @param {Blob} blob
* @return {Promise}

#### jz.utils.bytesToString(buffer)

* @param {Uint8Array|ArrayBuffer|Array|string} buffer
* @return {Promise}

```js
jz.utils.bytesToString(bytes)
.then(function (str) {
  // ...
});
```

#### jz.utils.concatBytes(buffers)

* @param {Array.\<Uint8Array|ArrayBuffer\>} buffers
* @return {Uint8Array}

```js
var concated = jz.utils.concatBytes([bytes1, bytes2]);
// or
var concated = jz.utils.concatBytes(bytes1, bytes2);
```

#### jz.utils.load(urls)

It loads files as `Uint8Array`.

* @param {Array.\<string\>} urls
* @return {Promise}

```js
jz.utils.load(['foo.png', 'bar.jpg'])
.spread(function (foo, bar) {
  // ...
});
// or
jz.utils.load('foo.png', 'bar.jpg')
.spread(function (foo, bar) {
  // ...
});
```

### algos

#### jz.algos.deflate({buffer, level, chunkSize})

* @param {Uint8Array|ArrayBuffer} buffer
* @param {number} level - optional (default is `6`, range is 0-9)
* @param {number} chunkSize - optional (default is `0x8000`)
* @return {Uint8Array}

#### jz.algos.inflate({buffer, chunkSize})

* @param {Uint8Array|ArrayBuffer} buffer
* @param {number} chunkSize - optional (default is `0x8000`)
* @return {Uint8Array}

#### jz.algos.adler32(buffer)

* @param {Uint8Array|ArrayBuffer} buffer
* @return {number}

#### jz.algos.crc32({buffer, crc})

* @param {Uint8Array|ArrayBuffer} buffer
* @param {number}
* @return {number}

#### jz.stream.algos.deflate({buffer, streamFn, level, shareMemory, chunkSize})

* @param {Uint8Array|ArrayBuffer} buffer
* @param {function(chunk: Uint8Array)} streamFn
* @param {number} level - optional (default is `6`)
* @param {boolean} shareMemory - optional (default is `false`)
* @param {number} chunkSize - optional (default is `0x8000`)

```js
jz.stream.algos.deflate({
  buffer: buffer,
  streamFn: function (chunk) {
    // ...
  },
  shareMemory: false
});
```

#### jz.steram.algos.inflate({buffer, streamFn, shareMemory, chunkSize})

* @param {Uint8Array|ArrayBuffer} buffer
* @param {function(chunk: Uint8Array)} streamFn
* @param {boolean} shareMemory - optional (default is `false`)
* @param {number} chunkSize - optional (default is `0x8000`)

### zlib

#### jz.zlib.compress({buffer, level, chunkSize})

* @param {Uint8Array|ArrayBuffer} buffer
* @param {number} level - optional (default is `6`)
* @param {number} chunkSize - optional (default is `0x8000`)
* @return {Uint8Array}

#### jz.zlib.decompress({buffer, chunkSize})

* @param {Uint8Array|ArrayBuffer} buffer
* @param {number} chunkSize - optional (default is `0x8000`)
* @return {Uint8Array}

#### jz.stream.zlib.compress({buffer, streamFn, level, shareMemory, chunkSize})

* @param {Uint8Array|ArrayBuffer} buffer
* @param {function(chunk: Uint8Array)} streamFn
* @param {number} level - optional (default is `6`)
* @param {boolean} shareMemory - optional (default is `false`)
* @param {number} chunkSize - optional (default is `0x8000`)

#### jz.stream.zlib.decompress({buffer, streamFn, shareMemory, chunkSize})

* @param {Uint8Array|ArrayBuffer} buffer
* @param {function(chunk: Uint8Array)} streamFn
* @param {boolean} shareMemory - optional (default is `false`)
* @param {number} chunkSize - optional (default is `0x8000`)

### gzip

#### jz.gz.compress({buffer, level, chunkSize})

* @param {Uint8Array|ArrayBuffer} buffer
* @param {number} level - optional (default is `6`)
* @param {number} chunkSize - optional (default is `0x8000`)
* @return {Uint8Array}

#### jz.gz.decompress({buffer, chunkSize})

* @param {Uint8Array|ArrayBuffer} buffer
* @param {number} chunkSize - optional (default is `0x8000`)
* @return {Uint8Array}

#### jz.stream.gz.compress({buffer, streamFn, level, shareMemory, chunkSize, fname, fcomment})

* @param {Uint8Array|ArrayBuffer} buffer
* @param {function(chunk: Uint8Array)} streamFn
* @param {number} level - optional (default is `6`)
* @param {boolean} shareMemory - optional (default is `false`)
* @param {number} chunkSize - optional (default is `0x8000`)
* @param {string} fname - optional
* @param {string} fcomment - optional

#### jz.stream.gz.decompress({buffer, streamFn, shareMemory, chunkSize})

* @param {Uint8Array|ArrayBuffer} buffer
* @param {function(chunk: Uint8Array)} streamFn
* @param {boolean} shareMemory - optional (default is `false`)
* @param {number} chunkSize - optional (default is `0x8000`)

### zip

#### jz.zip.pack({files, level, chunkSize})

* @param {Array.<object>} files
* @param {number} level - optional (default is `6`)
* @param {number} chunkSize - optional (default is `0x8000`)
* @return {Promise}

```js
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
.then(function (buffer) {
  // buffer is Uint8Array
});


// You cat set compression level to each files.
var files = [
  {name: "mimetype", buffer: "application/epub+zip", level: 0}, //string
  {name: "META-INF", dir: [ //folder
    {name: "container.xml", buffer: buffer, level: 0}, //ArrayBuffer
  ]},
  {name: "package.opf", url: "package.opf", level: 6},
  {name: "foo.xhtml", url: "foo.xhtml", level: 9} //xhr
];

jz.zip.pack(files)
.then(function (buffer) {
  // ...
});
```

#### jz.zip.unpack({buffer, encoding, chunkSize})

* @param {Uint8Array|ArrayBuffer|Blob} buffer
* @param {string} encoding - optional (default is `"UTF-8"`)
* @param {number} chunkSize - optional (default is `0x8000`)
* @return {Promise}

```js
jz.zip.unpack({
  buffer: buffer,
  encoding: 'Shift_JIS' // encoding of filenames
})
.then(function (reader) {
  // reader is ZipArchiveReader. See below.
  // get file names.
  reader.getFileNames();
  reader.readFileAsText(reader.getFileNames[0])
  .then(function (text) {
    // ...
  });
});
```

#### jz.stream.zip.pack({files, streamFn, level, shareMemory, chunkSize})

* @param {Array} files
* @param {function(chunk: Uint8Array)} streamFn
* @param {number} level - optional (default is `6`)
* @param {boolean} shareMemory - optional (default is `false`)
* @param {number} chunkSize - optional (default is `0x8000`)
* @return {Promise}

```js
jz.stream.zip.pack({
  files: files,
  streamFn: function (chunk) {
    // ...
  }
})
.then(function () {
  // no args
});
```

### ZipArchiveReader

#### ZipArchiveReader#getFileNames()

It gets filenames in the zip archive.

* @return {Array.\<string\>}

#### ZipArchiveReader#readFileAsArrayBuffer(filename)

* @param {string} filename
* @return {Promise}

#### ZipArchiveReader#readFileAsBlob(filename)

* @param {string} filename
* @return {Promise}

#### ZipArchiveReader#readFileAsText(filename, encoding)

* @param {string} filename
* @param {string} encoding
* @return {Promise}

#### ZipArchiveReader#readFileAsDataURL(filename)

* @param {string} filename
* @return {Promise}

#### ZipArchiveReader#readFileAsBinaryString(filename)

* @param {string} filename
* @return {Promise}

#### ZipArchiveReader#readFileAsArrayBufferSync(filename)

* @param {string} filename
* @return {ArrayBuffer}

#### ZipArchiveReader#readFileAsBlobSync(filename)

* @param {string} filename
* @return {Blob}

#### ZipArchiveReader#readFileAsTextSync(filename, encoding)

* @param {string} filename
* @param {string} encoding
* @return {string}

#### ZipArchiveReader#readFileAsBinaryStringSync(filename)

* @param {string} filename
* @return {string}

#### ZipArchiveReader#readFileAsDataURLSync(filename)

* @param {string} filename
* @return {string}

### jz.zip.ZipArchiveWriter({shareMemory, chunkSize})

Low level zip archive writer.

* @param {boolean} shareMemory - optional (default is `false`)
* @param {number} chunkSize - optional (default is `0x8000`)

```js
 var writer = new jz.zip.ZipArchiveWriter({shareMemory: true, chunkSize: 0xf000});
 writer
 .on('data', function(chunk) {
   // chunk is Uint8Array.
 })
 .on('end', function() {
   // ...
 });
 .write('foo/bar/baz.txt', buffer)
 .write('a.mp3', mp3Buff)
 .writeEnd();
```

#### #on(name, callback)

* @param {string} name
* @param {function} callback
* @return {jz.zip.ZipArchiveWriter} this

#### #write(path, buffer, level)

Write the file. Directories are created automatically.

* @param {string} path
* @param {Uint8Array} buffer
* @param {number} level - optional (default is `6`)
* @return {jz.zip.ZipArchiveWriter} this

```js
writer.write('a/b/c/d/foo.txt', buffer, 7);
```

#### #writeDir(path)

* @param {string} path
* @return {jz.zip.ZipArchiveWriter} this

```js
writer.writeDir('foo/');
// or
writer.writeDir('bar');
```

#### #writeFile(path, buffer, level)

* @param {string} path
* @param {Uint8Array} buffer
* @param {number} level - optional (default is `6`)
* @return {jz.zip.ZipArchiveWriter} this

```js
writer.writeDir('a/');
writer.writeDir('a/b/');
writer.writeDir('a/b/c/');
writer.writeFile('a/b/c/foo.txt', buffer, 7);
```

#### #writeEnd()

Write central directory headers and the end central dirctory header.

```js
writer.writeEnd();
```
