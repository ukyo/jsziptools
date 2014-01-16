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
stream.zlib.compress = function(buffer, streamFn, level, shareMemory, chunkSize) {
    var params = utils.getParams(arguments, ['buffer', 'streamFn', 'level', 'shareMemory', 'chunkSize']);
    params.input = utils.toBytes(params.buffer);
    zlib.stream.deflate(params);
};

expose('jz.stream.zlib.compress', stream.zlib.compress);