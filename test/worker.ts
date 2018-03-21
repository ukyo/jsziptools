import * as jz from '../src/index';

let bufferReader: jz.zip.ZipArchiveReader;
let blobReader: jz.zip.ZipArchiveReader;

jz.common
  .load('/test/zipsample.zip')
  .then(([buffer]: any) => {
    return Promise.all([jz.zip.unpack({ buffer }), jz.zip.unpack({ buffer: new Blob([new Uint8Array(buffer)]) })]);
  })
  .then(([_reader, _readerBlob]: any) => {
    bufferReader = _reader;
    blobReader = _readerBlob;
    postMessage('ready');
  });

(self as any).onmessage = (event: MessageEvent) => {
  const message = event.data;
  const helloWorldBuffer = new FileReaderSync().readAsArrayBuffer(new Blob(['こんにちは世界']));

  switch (message) {
    case 'jz.common.bytesToStringSync(buffer)':
      postMessage(jz.common.bytesToStringSync(helloWorldBuffer));
      break;
    case 'ZipBufferArchiveReader#readFileAsTextSync(filename)':
      postMessage(bufferReader.readFileAsTextSync('zipsample/a.txt'));
      break;
    case 'ZipBufferArchiveReader#readFileAsArrayBufferSync(filename)':
      postMessage(bufferReader.readFileAsArrayBufferSync('zipsample/a.txt'));
      break;
    case 'ZipBufferArchiveReader#readFileAsDataURLSync(filename)':
      postMessage(bufferReader.readFileAsDataURLSync('zipsample/a.txt'));
      break;
    case 'ZipBufferArchiveReader#readFileAsBlobSync(filename)':
      postMessage(bufferReader.readFileAsBlobSync('zipsample/a.txt'));
      break;
    case 'ZipBlobArchiveReader#readFileAsTextSync(filename)':
      postMessage(blobReader.readFileAsTextSync('zipsample/a.txt'));
      break;
    case 'ZipBlobArchiveReader#readFileAsArrayBufferSync(filename)':
      postMessage(blobReader.readFileAsArrayBufferSync('zipsample/a.txt'));
      break;
    case 'ZipBlobArchiveReader#readFileAsDataURLSync(filename)':
      postMessage(blobReader.readFileAsDataURLSync('zipsample/a.txt'));
      break;
    case 'ZipBlobArchiveReader#readFileAsBlobSync(filename)':
      postMessage(blobReader.readFileAsBlobSync('zipsample/a.txt'));
      break;
  }
};
