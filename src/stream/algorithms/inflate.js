/**
 * @param  {object} params
 * @example
 * jz.stream.algos.inflate({
 *   buffer: inputBuffer,
 *   streamFn: function (chunk) {
 *     // ...
 *   },
 *   shareMemory: false,
 *   chunkSize: 0xf000
 * });
 */
stream.algorithms.inflate = function (params) {
    params.input = utils.toBytes(params.buffer);
    zlib.stream.rawInflate(params);
};

expose('jz.stream.algorithms.inflate', stream.algorithms.inflate);