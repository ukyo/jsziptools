/**
 * @param {Uint8Array|ArrayBuffer}      buffer
 * @param {function(chunk: Uint8Array)} streamFn
 * @param {boolean}                     shareMemory - optional (default is `false`)
 * @param {number}                      chunkSize - optional (default is `0x8000`) * @example
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
stream.algorithms.inflate = function(buffer, streamFn, shareMemory, chunkSize) {
    var params = utils.getParams(arguments, ['buffer', 'streamFn', 'shareMemory', 'chunkSize']);
    params.input = utils.toBytes(params.buffer);
    zlib.stream.rawInflate(params);
};

expose('jz.stream.algorithms.inflate', stream.algorithms.inflate);