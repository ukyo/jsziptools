/**
 * @param  {ArrayBuffer|Uint8Array|Array|string} buffer
 * @param  {number}                              level
 * @param  {number}                              chunkSize
 * @param  {string}                              fname
 * @param  {string}                              fcomment
 * @return {Uint8Array}
 */
gz.compress = defun(['buffer', 'level', 'chunkSize', 'fname', 'fcomment'], function(buffer, level, chunkSize, fname, fcomment) {
    var chunks = [];
    stream.gz.compress({
        buffer: buffer,
        level: level,
        chunkSize: chunkSize,
        fname: fname,
        fcomment: fcomment,
        streamFn: function(chunk) {
            chunks.push(chunk);
        }
    });
    return utils.concatBytes(chunks);
});

expose('jz.gz.compress', gz.compress);