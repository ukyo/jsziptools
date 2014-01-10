/**
 * Decompress from a gzip format buffer.
 * 
 * @param {ArrayBuffer|Uint8Array|Array|string} buffer
 * @param {boolean} check If check crc32 checksum, set true.
 * @return {Uint8Array}
 */
gz.decompress = function (buffer, chunkSize) {
    var params = utils.getParams(arguments, ['buffer', 'chunkSize']),
        chunks = [];
    stream.gz.decompress({
        buffer: params.buffer,
        streamFn: function (chunk) {
            chunks.push(chunk);
        },
        shareMemory: false,
        chunkSize: params.chunkSize
    });
    return utils.concatBytes(chunks);
}

expose('jz.gz.decompress', gz.decompress);