/**
 * @param  {object} params
 * @example
 * jz.stream.zlib.decompress({
 *   buffer: inputBuffer,
 *   streamFn: function (chunk) {
 *     // ...
 *   },
 *   shareMemory: false,
 *   chunkSize: 0xf000
 * });
 */
stream.zlib.decompress = function (params) {
    var params = utils.getParams(arguments, ['buffer', 'streamFn', 'shareMemory', 'chunkSize']);
    params.input = utils.toBytes(params.buffer);
    zlib.stream.inflate(params);
};

expose('jz.stream.zlib.decompress', stream.zlib.decompress);