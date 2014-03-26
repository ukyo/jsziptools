/**
 * @param {Array} files
 * @param {function(chunk: Uint8Array)} streamFn
 * @param {number} level - optional (default is `6`)
 * @param {boolean} shareMemory - optional (default is `false`)
 * @param {number} chunkSize - optional (default is `0x8000`)
 * @return {Promise}
 *
 * @example
 * var files = [
 *     {name: 'foo.txt', str: 'foo'}, // String
 *     {name: 'bar.mp3', buffer: mp3Bytes}, // ArrayBuffer, Uint8Array, Array
 *     {name: 'baz.json', url: 'path/to/baz.json'}, // xhr
 *     {name: 'dir', dir: [ // dir
 *         {name: 'children', children: [ // dir
 *             {name: 'folder', folder: [ // dir
 *                 {name: 'aaa.txt', str: 'aaa.txt'}
 *             ]}
 *         ]}
 *     ], level: 8}
 * ];
 *
 * jz.stream.zip.pack({
 *     files: files,
 *     streamFn: function(chunk) {
 *         // ...
 *     }
 * })
 * .then(function() {
 *   // no args.
 * });
 */
stream.zip.pack = defun(['files', 'streamFn', 'level', 'shareMemory', 'chunkSize'], function(files, streamFn, level, shareMemory, chunkSize) {
    var promises = [],
        writer = new ZipArchiveWriter(shareMemory, chunkSize);
    writer.on('data', streamFn);

    function packItem(level, path, item) {
        var dir = item.children || item.dir || item.folder,
            buffer;
        level = typeof item.level === 'number' ? item.level : level;
        // init buffer and file path.
        if (dir) {
            path += item.name + (/.+\/$/.test(item.name) ? '' : '/');
            writer.writeDir(path);
            dir.forEach(packItem.bind(null, level, path));
        } else {
            if (item.buffer != null) buffer = item.buffer;
            if (item.str != null) buffer = item.str;
            if (buffer != null) {
                path += item.name;
            } else {
                throw new Error('jz.zip.pack: This type is not supported.');
            }
            writer.writeFile(path, utils.toBytes(buffer), level);
        }
    }
    // load files with ajax(async).
    function loadFile(item) {
        var dir = item.children || item.dir || item.folder;
        if(dir) {
            dir.forEach(loadFile);
        } else if (item.url) {
            promises.push(utils.load(item.url).then(function(args) {
                item.buffer = args[0];
                item.url = null;
            }));
        }
    }

    files.forEach(loadFile);
    return Promise.all(promises).then(function() {
        files.forEach(packItem.bind(null, level, ''));
        writer.writeEnd();
    });
});

expose('jz.stream.zip.pack', stream.zip.pack);
