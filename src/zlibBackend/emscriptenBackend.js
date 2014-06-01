setZlibBackend({
    deflate: zlib.deflate,
    inflate: zlib.inflate,
    rawDeflate: zlib.rawDeflate,
    rawInflate: zlib.rawInflate,
    stream: {
        deflate: function(buffer, streamFn, level, shareMemory, chunkSize) {
            zlib.stream.deflate({
                input: buffer,
                streamFn: streamFn,
                level: level,
                shareMemory: shareMemory,
                chunkSize: chunkSize
            });
        },
        inflate: function(buffer, streamFn, shareMemory, chunkSize) {
            zlib.stream.rawInflate({
                input: buffer,
                streamFn: streamFn,
                shareMemory: shareMemory,
                chunkSize: chunkSize
            });
        },
        rawDeflate: function(buffer, streamFn, level, shareMemory, chunkSize) {
            zlib.stream.rawDeflate({
                input: buffer,
                streamFn: streamFn,
                level: level,
                shareMemory: shareMemory,
                chunkSize: chunkSize
            });
        },
        rawInflate: function(buffer, streamFn, shareMemory, chunkSize) {
            zlib.stream.rawInflate({
                input: buffer,
                streamFn: streamFn,
                shareMemory: shareMemory,
                chunkSize: chunkSize
            });
        }
    }
});
