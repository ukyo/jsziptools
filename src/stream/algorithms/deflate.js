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
stream.algorithms.deflate = defun(['buffer', 'streamFn', 'level', 'shareMemory', 'chunkSize'], function(buffer, streamFn, level, shareMemory, chunkSize) {
    zlibBackend.stream.rawDeflate(
        utils.toBytes(buffer),
        streamFn,
        level,
        shareMemory,
        chunkSize
    );
});

expose('jz.stream.algorithms.deflate', stream.algorithms.deflate);