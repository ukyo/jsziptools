importScripts(
    '../dist/jsziptools.min.js'
);

onmessage = function(event) {
    var message = event.data,
        aPath = 'zipsample/a.txt',
        bPath = 'zipsample/folder/b.txt';

    switch (message) {
        case 'jz.utils.bytesToStringSync':
            var helloWorld = jz.utils.bytesToStringSync([0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64]);
            postMessage(helloWorld);
            break;
        case 'jz.zip.unpack(ArrayBuffer)':
            jz.utils.load('zipsample.zip')
            .then(jz.zip.unpack)
            .done(function(reader) {
                postMessage({
                    a: reader.getFileAsTextSync(aPath),
                    b: reader.getFileAsTextSync(bPath)
                });
            });
            break;
        case 'jz.zip.unpack(Blob)':
            jz.utils.load('zipsample.zip')
            .then(function(zipsample) {
                return jz.zip.unpack(new Blob([new Uint8Array(zipsample)]));
            })
            .done(function(reader) {
                postMessage({
                    a: reader.getFileAsTextSync(aPath),
                    b: reader.getFileAsTextSync(bPath)
                });
            });
            break;
        case 'jz.zip.pack':
            var files = [
                {name: 'zipsample', dir: [
                    {name: 'a.txt', url: aPath},
                    {name: 'folder', dir: [
                        {name: 'b.txt', url: bPath}
                    ]}
                ]}
            ];
            jz.zip.pack(files)
            .then(jz.zip.unpack)
            .done(function(reader) {
                postMessage({
                    a: reader.getFileAsTextSync(aPath),
                    b: reader.getFileAsTextSync(bPath)
                });
            });
    }
};