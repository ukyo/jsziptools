/**
 * @param {Uint8Array|ArrayBuffer}      buffer
 * @param {function(chunk: Uint8Array)} streamFn
 * @param {boolean}                     shareMemory - optional (default is `false`)
 * @param {number}                      chunkSize - optional (default is `0x8000`) * @example
 * jz.stream.zlib.decompress({
 *   buffer: inputBuffer,
 *   streamFn: function (chunk) {
 *     // ...
 *   },
 *   shareMemory: false,
 *   chunkSize: 0xf000
 * });
 */
stream.zlib.decompress = defun(['buffer', 'streamFn', 'shareMemory', 'chunkSize'], function(buffer, streamFn, shareMemory, chunkSize) {
    zlibBackend.stream.inflate(
        utils.toBytes(buffer),
        streamFn,
        shareMemory,
        chunkSize
    );
});

expose('jz.stream.zlib.decompress', stream.zlib.decompress);