var reader, readerBlob;
jz.utils.load('zipsample.zip')
.spread(function(buffer) {
    return Promise.all([
        jz.zip.unpack(buffer),
        jz.zip.unpack(new Blob([new Uint8Array(buffer)]))
    ]);
})
.spread(function(_reader, _readerBlob) {
    reader = _reader;
    readerBlob = _readerBlob;
    postMessage('ready');
});

onmessage = function(event) {
    var message = event.data,
        helloWorldBuffer = new FileReaderSync().readAsArrayBuffer(new Blob(['こんにちは世界']));

    switch (message) {
        case 'jz.utils.bytesToStringSync(buffer)':
            postMessage(jz.utils.bytesToStringSync(helloWorldBuffer));
            break;
        case 'ZipArchiveReader#readFileAsTextSync(filename)':
            postMessage(reader.readFileAsTextSync('zipsample/a.txt'));
            break;
        case 'ZipArchiveReader#readFileAsArrayBufferSync(filename)':
            postMessage(reader.readFileAsArrayBufferSync('zipsample/a.txt'));
            break;
        case 'ZipArchiveReader#readFileAsDataURLSync(filename)':
            postMessage(reader.readFileAsDataURLSync('zipsample/a.txt'));
            break;
        case 'ZipArchiveReader#readFileAsBlobSync(filename)':
            postMessage(reader.readFileAsBlobSync('zipsample/a.txt'));
            break;
        case 'ZipArchiveReader#readFileAsBinaryStringSync(filename)':
            postMessage(reader.readFileAsBinaryStringSync('zipsample/a.txt'));
            break;
        case 'ZipArchiveReaderBlob#readFileAsTextSync(filename)':
            postMessage(readerBlob.readFileAsTextSync('zipsample/a.txt'));
            break;
        case 'ZipArchiveReaderBlob#readFileAsArrayBufferSync(filename)':
            postMessage(readerBlob.readFileAsArrayBufferSync('zipsample/a.txt'));
            break;
        case 'ZipArchiveReaderBlob#readFileAsDataURLSync(filename)':
            postMessage(readerBlob.readFileAsDataURLSync('zipsample/a.txt'));
            break;
        case 'ZipArchiveReaderBlob#readFileAsBlobSync(filename)':
            postMessage(readerBlob.readFileAsBlobSync('zipsample/a.txt'));
            break;
        case 'ZipArchiveReaderBlob#readFileAsBinaryStringSync(filename)':
            postMessage(readerBlob.readFileAsBinaryStringSync('zipsample/a.txt'));
            break;
    }
};