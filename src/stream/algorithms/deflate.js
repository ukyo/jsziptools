/**
 * @param  {object} params
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
stream.algorithms.deflate = function (buffer, streamFn, level, shareMemory, chunkSize) {
    var params = utils.getParams(arguments, ['buffer', 'streamFn', 'level', 'shareMemory', 'chunkSize']);
    params.input = utils.toBytes(params.buffer);
    zlib.stream.rawDeflate(params);
};

expose('jz.stream.algorithms.deflate', stream.algorithms.deflate);