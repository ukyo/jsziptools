/**
 * @param  {ArrayBuffer|Uint8Array|Array|string} buffer
 * @param  {function}                            streamFn
 * @param  {boolean}                             shareMemory
 * @param  {number}                              chunkSize
 */
stream.gz.decompress = function(buffer, streamFn, shareMemory, chunkSize) {
    var params = utils.getParams(arguments, ['buffer', 'streamFn', 'shareMemory', 'chunkSize']),
        bytes = utils.toBytes(params.buffer),
        flg, ret, crc, streamFn = params.streamFn,
        shareMemory = params.shareMemory,
        chunkSize = params.chunkSize,
        offset = 10,
        view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

    if (view.getUint16(0) !== 0x1F8B) throw new Error('jz.gz.decompress: invalid gzip file.');
    if (bytes[2] !== 0x8) throw new Error('jz.gz.decompress: not deflate.');

    flg = bytes[3];
    // fextra
    if (flg & 0x4) offset += view.getUint16(offset, true) + 2;
    // fname
    if (flg & 0x8) while (bytes[offset++]);
    // fcomment
    if (flg & 0x10) while (bytes[offset++]);
    // fhcrc
    if (flg & 0x2) offset += 2;

    stream.algorithms.inflate({
        buffer: bytes.subarray(offset, bytes.length - 8),
        streamFn: function(chunk) {
            crc = algorithms.crc32(chunk, crc);
            streamFn(chunk);
        },
        shareMemory: shareMemory,
        chunkSize: chunkSize
    });

    if (crc !== view.getUint32(bytes.length - 8, true)) {
        throw new Error('js.stream.gz.decompress: file is broken.');
    }
};

expose('jz.stream.gz.decompress', stream.gz.decompress);