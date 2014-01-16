/**
 * @param {Uint8Array|ArrayBuffer}      buffer
 * @param {function(chunk: Uint8Array)} streamFn
 * @param {number}                      level - optional (default is `6`)
 * @param {boolean}                     shareMemory - optional (default is `false`)
 * @param {number}                      chunkSize - optional (default is `0x8000`)
 * @example
 * jz.stream.algos.deflate({
 *   buffer: inputBuffer,
 *   streamFn: function (chunk) {
 *     // ...
 *   },
 *   shareMemory: false,
 *   chunkSize: 0xf000
 * });
 */
stream.algorithms.deflate = function(buffer, streamFn, level, shareMemory, chunkSize) {
    var params = utils.getParams(arguments, ['buffer', 'streamFn', 'level', 'shareMemory', 'chunkSize']);
    params.input = utils.toBytes(params.buffer);
    zlib.stream.rawDeflate(params);
};

expose('jz.stream.algorithms.deflate', stream.algorithms.deflate);