/**
 * @param  {ArrayBuffer|Uint8Array|Array|string} buffer
 * @param  {number}                              level
 * @param  {number}                              chunkSize
 * @param  {string}                              fname
 * @param  {string}                              fcomment
 * @return {Uint8Array}
 */
gz.compress = function(buffer, level, chunkSize, fname, fcomment) {
    var params = utils.getParams(arguments, ['buffer', 'level', 'chunkSize', 'fname', 'fcomment']),
        chunks = [];
    stream.gz.compress({
        buffer: params.buffer,
        level: params.level,
        chunkSize: params.chunkSize,
        fname: params.fname,
        fcomment: params.fcomments,
        streamFn: function(chunk) {
            chunks.push(chunk);
        }
    });
    return utils.concatBytes(chunks);
};

expose('jz.gz.compress', gz.compress);