/**
 * @param {Array} files
 * @param {function(chunk: Uint8Array)} streamFn
 * @param {number} level - optional (default is `6`)
 * @param {boolean} shareMemory - optional (default is `false`)
 * @param {number} chunkSize - optional (default is `0x8000`)
 * @return {Promise}
 * @example
 * jz.stream.zlib.compress({
 *   buffer: inputBuffer,
 *   streamFn: function (chunk) {
 *     // ...
 *   },
 *   shareMemory: false,
 *   chunkSize: 0xf000
 * });
 */
stream.zlib.compress = defun(['buffer', 'streamFn', 'level', 'shareMemory', 'chunkSize'], function(buffer, streamFn, level, shareMemory, chunkSize) {
    zlib.stream.deflate({
        input: utils.toBytes(buffer),
        streamFn: streamFn,
        level: level,
        shareMemory: shareMemory,
        chunkSize: chunkSize
    });
});

expose('jz.stream.zlib.compress', stream.zlib.compress);