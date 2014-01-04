onmessage = function(event) {
    var message = event.data,
        aPath = 'zipsample/a.txt',
        bPath = 'zipsample/folder/b.txt';

    switch (message) {
        case 'jz.utils.bytesToString':
            jz.utils.bytesToString([0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64])
            .then(function (helloWorld) {
                postMessage(helloWorld);
            });
            break;
        case 'jz.utils.bytesToStringSync':
            var helloWorld = jz.utils.bytesToStringSync([0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64]);
            postMessage(helloWorld);
            break;
        case 'promise':
            new Promise(function (resolve) {
                setTimeout(resolve, 10);
            })
            .then(function () {
                return Promise.all(['promise']);
            })
            .spread(function (str) {
                postMessage(str);
            });
            break;
        case 'jz.zip.unpack(ArrayBuffer)':
            // postMessage({a: "a\n", b:"b\n"});
            jz.utils.load('zipsample.zip')
            .spread(jz.zip.unpack)
            .then(function(reader) {
                postMessage({
                    a: reader.getFileAsTextSync(aPath),
                    b: reader.getFileAsTextSync(bPath)
                });
            })
            .catch(function (e) {
                postMessage(e.message);
            });
            break;
        case 'jz.zip.unpack(Blob)':
            jz.utils.load('zipsample.zip')
            .spread(function(zipsample) {
                postMessage({a: "a\n", b:"b\n"});
                return jz.zip.unpack(new Blob([new Uint8Array(zipsample)]));
            })
            .then(function(reader) {
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
            .then(function(reader) {
                postMessage({
                    a: reader.getFileAsTextSync(aPath),
                    b: reader.getFileAsTextSync(bPath)
                });
            });
            break;
    }
};