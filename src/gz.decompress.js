/**
 * Decompress from a gzip format buffer.
 * 
 * @param  {ArrayBuffer|Uint8Array|Array|string} buffer
 * @param  {boolean}                             chunkSize
 * @return {Uint8Array}
 */
gz.decompress = defun(['buffer', 'chunkSize'], function(buffer, chunkSize) {
    var chunks = [];
    stream.gz.decompress({
        buffer: buffer,
        streamFn: function(chunk) {
            chunks.push(chunk);
        },
        chunkSize: chunkSize
    });
    return utils.concatBytes(chunks);
});

expose('jz.gz.decompress', gz.decompress);