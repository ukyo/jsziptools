/**
 * @param  {object} params
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
stream.zlib.compress = function (params) {
    params.input = utils.toBytes(params.buffer);
    zlib.stream.deflate(params);
};

expose('jz.stream.zlib.compress', stream.zlib.compress);