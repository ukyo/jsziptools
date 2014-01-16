/**
 * Compress to a gzip format buffer.
 * 
 * @param {Uint8Array|ArrayBuffer}      buffer
 * @param {function(chunk: Uint8Array)} streamFn
 * @param {number}                      level - optional (default is `6`)
 * @param {boolean}                     shareMemory - optional (default is `false`)
 * @param {number}                      chunkSize - optional (default is `0x8000`)
 * @param {string}                      fname - optional
 * @param {string}                      fcomment - optional
 */
stream.gz.compress = function(buffer, streamFn, level, shareMemory, chunkSize, fname, fcomment) {
    var params = utils.getParams(arguments, ['buffer', 'streamFn', 'level', 'shareMemory', 'chunkSize', 'fname', 'fcomment']),
        bytes = utils.toBytes(params.buffer),
        level = params.level,
        streamFn = params.streamFn,
        shareMemory = params.shareMemory,
        chunkSize = params.chunkSize,
        fname = params.fname && utils.toBytes(params.fname),
        fcomment = params.fcomment && utils.toBytes(params.fcomment),
        flg = 0,
        headerLength = 10,
        offset = 0,
        now = Date.now(),
        header, footer, view;

    // add length of metadatas
    if (fname) {
        headerLength += fname.length + 1;
        flg |= 0x8;
    }
    if (fcomment) {
        headerLength += fcomment.length + 1;
        flg |= 0x10;
    }

    // write header
    header = new Uint8Array(headerLength);
    view = new DataView(header.buffer);
    view.setUint32(offset, 0x1F8B0800 | flg); // gzip header and flags
    offset += 4;
    view.setUint32(offset, now, true); // modificated
    offset += 4;
    view.setUint16(offset, 0x04FF);
    offset += 2;
    // add metadatas to header
    if (fname) {
        header.set(fname, offset);
        offset += fname.length;
        header[offset++] = 0;
    }
    if (fcomment) {
        header.set(fcomment, offset);
        offset += fcomment.length;
        header[offset++] = 0;
    }
    streamFn(header);

    // write body
    stream.algorithms.deflate({
        buffer: bytes,
        streamFn: streamFn,
        shareMemory: shareMemory,
        chunkSize: chunkSize
    });

    // write footer
    footer = new Uint8Array(8);
    view = new DataView(footer.buffer);
    view.setUint32(0, algorithms.crc32(bytes), true); // crc checksum
    view.setUint32(4, bytes.length, true); // isize
    streamFn(footer);
};

expose('jz.stream.gz.compress', stream.gz.compress);