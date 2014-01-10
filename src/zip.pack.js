/**
 * @param  {Array.<object>} files
 * @param  {number} level
 * @param  {number} chunkSize
 * @return {Uint8Array}
 *
 * The object in `files` has some properties.
 * * {string} name - file name
 * * {ArrayBuffer|Uint8Array|Array|string} buffer - file body
 * * {string} url - file url
 * * {number} level - compression level
 * * {Array.<object>} dir - directory
 *
 * @example
 * var files = [
 *  {name: "foo", dir: [ // folder
 *    {name: "hello.txt", buffer: "Hello World!"}, // string
 *    {name: "bar.js", buffer: buffer}, // ArrayBuffer
 *    {name: "hoge.mp3", url: "audiodata/hoge.mp3"} // xhr
 *  ]}
 * ];
 * jz.zip.pack(files).then(function (buffer) {
 *   // buffer is Uint8Array.
 * });
 */
zip.pack = function (files, level, chunkSize) {
    var params = utils.getParams(arguments, ['files', 'level', 'chunkSize']),
        chunks = [];
    return stream.zip.pack({
        files: params.files,
        shareMemory: false,
        level: params.level,
        chunkSize: params.chunkSize,
        streamFn: function (chunk) {
            chunks.push(chunk);
        }
    })
    .then(function () {
        return utils.concatBytes(chunks);
    });
};

expose('jz.zip.pack', zip.pack);
