# jsziptools

It's a utility of zlib, gzip and zip format binary data.

## suported browser

chrome, firefox, Edge, safari, opera.

## examples

### web examples

* [Deflate text](http://ukyo.github.com/jsziptools/examples/deflate_text.html)
* [Zip viewer](http://ukyo.github.com/jsziptools/examples/zip_viewer.html)

## APIs

### common

#### BufferLike

@type {string | number[] | ArrayBuffer | Uint8Array | Int8Array | Uint8ClampedArray}

#### jz.common.toBytes(buffer)

* @param {BufferLike} buffer
* @return {Uint8Array}

#### jz.common.readFileAsArrayBuffer(blob)

* @param {Blob} blob
* @return {Promise\<ArrayBuffer\>}

```js
jz.common.readFileAsArrayBuffer(blob).then(buffer => {
  // ...
});
```

#### jz.common.readFileAsText(blob, encoding)

* @param {Blob} blob
* @param {string} encoding - optional (default is `"UTF-8"`)
* @return {Promise\<string\>}

#### jz.common.readFileAsDataURL(blob)

* @param {Blob} blob
* @return {Promise\<string\>}

#### jz.common.bytesToString(buffer)

* @param {BufferLike} buffer
* @return {Promise\<string\>}

```js
jz.common.bytesToString(bytes).then(str => {
  // ...
});
```

#### jz.common.concatBytes(buffers)

* @param {Array\<BufferLike\>} buffers
* @return {Uint8Array}

```js
let concated = jz.common.concatBytes([bytes1, bytes2]);
// or
let concated = jz.common.concatBytes(bytes1, bytes2);
```

#### jz.common.load(urls)

It loads files as `Uint8Array`.

* @param {Array\<string\>} urls
* @return {Promise\<Uint8Array[]\>}

```js
jz.common.load(['foo.png', 'bar.jpg']).then(([foo, bar]) => {
  // ...
});
// or
jz.common.load('foo.png', 'bar.jpg').then(([foo, bar]) => {
  // ...
});
```

### core

#### jz.core.deflate({buffer, level, chunkSize})

* @param {BufferLike} buffer
* @param {number} level - optional (default is `6`, range is 0-9)
* @param {number} chunkSize - optional (default is `0x8000`)
* @return {Uint8Array}

#### jz.core.inflate({buffer, chunkSize})

* @param {BufferLike} buffer
* @param {number} chunkSize - optional (default is `0x8000`)
* @return {Uint8Array}

#### jz.core.adler32(buffer)

* @param {BufferLike} buffer
* @return {number}

#### jz.core.crc32({buffer, crc})

* @param {BufferLike} buffer
* @param {number}
* @return {number}

#### jz.stream.core.deflate({buffer, streamFn, level, shareMemory, chunkSize})

* @param {BufferLike} buffer
* @param {function(chunk: Uint8Array)} streamFn
* @param {number} level - optional (default is `6`)
* @param {boolean} shareMemory - optional (default is `false`)
* @param {number} chunkSize - optional (default is `0x8000`)

```js
jz.stream.core.deflate({
  buffer: buffer,
  streamFn: chunk => {
    // ...
  },
  shareMemory: false,
});
```

#### jz.steram.core.inflate({buffer, streamFn, shareMemory, chunkSize})

* @param {BufferLike} buffer
* @param {function(chunk: Uint8Array)} streamFn
* @param {boolean} shareMemory - optional (default is `false`)
* @param {number} chunkSize - optional (default is `0x8000`)

### zlib

#### jz.zlib.compress({buffer, level, chunkSize})

* @param {BufferLike} buffer
* @param {number} level - optional (default is `6`)
* @param {number} chunkSize - optional (default is `0x8000`)
* @return {Uint8Array}

#### jz.zlib.decompress({buffer, chunkSize})

* @param {BufferLike} buffer
* @param {number} chunkSize - optional (default is `0x8000`)
* @return {Uint8Array}

#### jz.stream.zlib.compress({buffer, streamFn, level, shareMemory, chunkSize})

* @param {BufferLike} buffer
* @param {function(chunk: Uint8Array)} streamFn
* @param {number} level - optional (default is `6`)
* @param {boolean} shareMemory - optional (default is `false`)
* @param {number} chunkSize - optional (default is `0x8000`)

#### jz.stream.zlib.decompress({buffer, streamFn, shareMemory, chunkSize})

* @param {BufferLike} buffer
* @param {function(chunk: Uint8Array)} streamFn
* @param {boolean} shareMemory - optional (default is `false`)
* @param {number} chunkSize - optional (default is `0x8000`)

### gzip

#### jz.gz.compress({buffer, level, chunkSize})

* @param {BufferLike} buffer
* @param {number} level - optional (default is `6`)
* @param {number} chunkSize - optional (default is `0x8000`)
* @return {Uint8Array}

#### jz.gz.decompress({buffer, chunkSize})

* @param {BufferLike} buffer
* @param {number} chunkSize - optional (default is `0x8000`)
* @return {Uint8Array}

#### jz.stream.gz.compress({buffer, streamFn, level, shareMemory, chunkSize, fname, fcomment})

* @param {BufferLike} buffer
* @param {function(chunk: Uint8Array)} streamFn
* @param {number} level - optional (default is `6`)
* @param {boolean} shareMemory - optional (default is `false`)
* @param {number} chunkSize - optional (default is `0x8000`)
* @param {string} fname - optional
* @param {string} fcomment - optional

#### jz.stream.gz.decompress({buffer, streamFn, shareMemory, chunkSize})

* @param {BufferLike} buffer
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
  {
    name: 'foo',
    dir: [
      // folder
      { name: 'hello.txt', buffer: 'Hello World!' }, // string
      { name: 'bar.js', buffer: buffer }, // ArrayBuffer
      { name: 'hoge.mp3', url: 'audiodata/hoge.mp3' }, // xhr
    ],
  },
];

jz.zip
  .pack({
    files: files,
    level: 5,
  })
  .then(buffer => {
    // buffer is Uint8Array
  });

// You cat set compression level to each files.
var files = [
  { name: 'mimetype', buffer: 'application/epub+zip', level: 0 }, //string
  {
    name: 'META-INF',
    dir: [
      //folder
      { name: 'container.xml', buffer: buffer, level: 0 }, //ArrayBuffer
    ],
  },
  { name: 'package.opf', url: 'package.opf', level: 6 },
  { name: 'foo.xhtml', url: 'foo.xhtml', level: 9 }, //xhr
];

jz.zip.pack({ files }).then(buffer => {
  // ...
});
```

#### jz.zip.unpack({buffer, encoding, chunkSize})

* @param {BufferLike | Blob} buffer
* @param {string} encoding - optional (default is `"UTF-8"`)
* @param {number} chunkSize - optional (default is `0x8000`)
* @return {Promise}

```js
jz.zip
  .unpack({
    buffer: buffer,
    encoding: 'Shift_JIS', // encoding of filenames
  })
  .then(reader => {
    // reader is ZipArchiveReader. See below.
    // get file names.
    reader.getFileNames();
    reader.readFileAsText(reader.getFileNames[0]).then(text => {
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
jz.stream.zip
  .pack({
    files: files,
    streamFn: chunk => {
      // ...
    },
  })
  .then(() => {
    // no args
  });
```

### ZipArchiveReader

#### ZipArchiveReader#getFileNames()

It gets filenames in the zip archive.

* @return {Array\<string\>}

#### ZipArchiveReader#readFileAsArrayBuffer(filename)

* @param {string} filename
* @return {Promise\<ArrayBuffer\>}

#### ZipArchiveReader#readFileAsBlob(filename)

* @param {string} filename
* @return {Promise\<Blob\>}

#### ZipArchiveReader#readFileAsText(filename, encoding)

* @param {string} filename
* @param {string} encoding
* @return {Promise\<string\>}

#### ZipArchiveReader#readFileAsDataURL(filename)

* @param {string} filename
* @return {Promise\<string\>}

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
const writer = new jz.zip.ZipArchiveWriter({ shareMemory: true, chunkSize: 0xf000 });
writer
  .on('data', chunk => {
    // chunk is Uint8Array.
  })
  .on('end', () => {
    // ...
  })
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

## Import subdirectries

You can import modules from subdirectries.

```js
import { deflate } from "jsziptools/core";
import * as zip from "jsziptools/zip";

deflate(...);
zip.pack(...).then();
```
