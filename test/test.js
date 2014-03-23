var expect = chai.expect;

// init web worker.
before(function(done) {
    worker.onmessage = function(e) {
        done();
    };
});


describe('Promise#spread', function() {
    it('spreads the array argument.', function() {
        return Promise.all([1, 2, 3])
        .spread(function(a, b, c) {
            expect(a).to.equal(1);
            expect(b).to.equal(2);
            expect(c).to.equal(3);
        });
    });
});


describe('jz.utils', function() {
    describe('jz.utils.toBytes(buffer)', function() {
        it('converts to Uint8Array.', function() {
            expect(jz.utils.toBytes(new Uint8Array(4))).to.be.instanceof(Uint8Array);
            expect(jz.utils.toBytes(new ArrayBuffer(4))).to.be.instanceof(Uint8Array);
            expect(jz.utils.toBytes([0, 0, 0, 0])).to.be.instanceof(Uint8Array);
            expect(jz.utils.toBytes('aaaa')).to.be.instanceof(Uint8Array);
        });
    });

    describe('jz.utils.readFileAsArrayBuffer(blob)', function() {
        it('reads the file as ArrayBuffer.', function() {
            return jz.utils.readFileAsArrayBuffer(new Blob([new Uint8Array(100)]))
            .then(function(buffer) {
                expect(buffer).to.be.instanceof(ArrayBuffer);
                expect(buffer.byteLength).to.equal(100);
            });
        })
    });

    describe('jz.utils.readFileAsText(blob, encoding)', function() {
        it('reads the file as string.', function() {
            return jz.utils.readFileAsText(new Blob(['こんにちは世界']))
            .then(function(text) {
                expect(text).to.equal('こんにちは世界');
            });
        })
    });

    describe('jz.utils.readFileAsDataURL(blob)', function() {
        it('reads the file as data URL.', function() {
            return jz.utils.readFileAsDataURL(new Blob(['hello']))
            .then(function(dataURL) {
                expect(dataURL.split(',').pop()).to.equal(btoa('hello'));
            });
        });
    });

    describe('jz.utils.readFileAsBinaryString(blob)', function() {
        it('reads the file as binary string.', function() {
            return jz.utils.readFileAsBinaryString(new Blob(['hello']))
            .then(function(binaryString) {
                expect(binaryString).to.be.a('string');
            });
        });
    });

    describe('jz.utils.bytesToString(buffer)', function() {
        it('converts Uint8Array to string.', function() {
            return jz.utils.readFileAsArrayBuffer(new Blob(['こんにちは世界']))
            .then(function(buffer) {
                return jz.utils.bytesToString(buffer);
            })
            .then(function(text) {
                expect(text).to.equal('こんにちは世界');
            });
        });
    });

    describe('jz.utils.bytesToStringSync(buffer)', function() {
        it('converts Uint8Array to string.', function(done) {
            worker.postMessage('jz.utils.bytesToStringSync(buffer)');
            worker.onmessage = function(e) {
                expect(e.data).to.equal('こんにちは世界');
                done();
            };
        });
    });

    describe('jz.utils.conatBytes(buffers)', function() {
        it('concats bytes.', function() {
            var bytes1 = new Uint8Array([1, 2]),
                bytes2 = new Uint8Array([3, 4]),
                bytes3 = new Uint8Array([5, 6]);
            expect(jz.utils.concatBytes(bytes1, bytes2, bytes3)).to.eql(new Uint8Array([1, 2, 3, 4, 5, 6]));
            expect(jz.utils.concatBytes([bytes1, bytes2, bytes3])).to.eql(new Uint8Array([1, 2, 3, 4, 5, 6]));
        })
    });

    describe('jz.utils.load(urls)', function() {
        it('loads files as Uint8Array.', function() {
            return jz.utils.load(URL.createObjectURL(new Blob([new Uint8Array([1, 2, 3])])))
            .then(function(args) {
                var bytes = args[0];
                expect(bytes).to.be.instanceof(Uint8Array);
                expect(bytes).to.eql(new Uint8Array([1, 2, 3]));
            });
        });
    });
});


describe('jz.algos', function() {
    describe('jz.algos.deflate({buffer, level, chunkSize})', function() {
        it('exists', function() {
            expect(jz.algos.deflate).to.exist;
        });
    });

    describe('jz.algos.inflate({buffer, chunkSize})', function() {
        it('exists', function() {
            expect(jz.algos.inflate).to.exist;
        });
    });

    describe('jz.algos.adler32(buffer)', function() {
        it('exists', function() {
            expect(jz.algos.adler32).to.exist;
        });
    });

    describe('jz.algos.crc32({buffer, src})', function() {
        it('exists', function() {
            expect(jz.algos.crc32).to.exist;
        });
    });
})


describe('jz.zlib', function() {
    var zlibStream;

    before(function(done) {
        return jz.utils.load('test/nicowari.swf')
        .spread(function(_bytes) {
            zlibStream = new Uint8Array(_bytes.subarray(8));
            done();
        });
    });

    describe('jz.zlib.decompress({buffer, chunkSize})', function() {
        // jz.zip.decompress validates the source with adler32 checksum.
        it('decompresses the zlib stream.', function() {
            expect(jz.zlib.decompress(zlibStream)).to.be.instanceof(Uint8Array);
        })
    });

    describe('jz.zlib.compress({buffer, level, chunkSize})', function() {
        it('compressses to the zlib stream.', function() {
            return Promise.resolve(zlibStream)
            .then(jz.zlib.decompress)
            .then(jz.zlib.compress)
            .then(jz.zlib.decompress)
            .then(function(decompressed) {
                expect(decompressed).to.be.instanceof(Uint8Array);
            });
        });
    });
});


describe('jz.gz', function() {
    var gzStream;

    before(function(done) {
        return jz.utils.load('test/sample.txt.gz')
        .spread(function(_gzStream) {
            gzStream = _gzStream;
            done();
        });
    });

    describe('jz.gz.decompress({buffer, chunkSize})', function() {
        it('decompresses the gzip stream.', function() {
            expect(jz.gz.decompress(gzStream)).to.be.instanceof(Uint8Array);
        });
    });

    describe('jz.gz.compress({buffer, level, chunkSize})', function() {
        it('compresses to the gzip stream.', function() {
            return Promise.resolve(gzStream)
            .then(jz.gz.decompress)
            .then(jz.gz.compress)
            .then(jz.gz.decompress)
            .then(function(decompressed) {
                expect(decompressed).to.be.instanceof(Uint8Array);
            });
        });
    });
});


describe('jz.zip', function() {
    describe('jz.zip.unpack({buffer, encoding, chunkSize})', function() {
        it('exists.', function() {
            expect(jz.zip.unpack).to.exist;
        });
    });

    describe('ZipArchiveReader', function() {
        var reader;

        before(function(done) {
            jz.utils.load('test/zipsample.zip')
            .spread(jz.zip.unpack)
            .then(function(_reader) {
                reader = _reader;
                done();
            });
        });

        describe('#getFileNames()', function() {
            it('gets file names in a zip archive.', function() {
                expect(reader.getFileNames()).to.eql([
                    'zipsample/a.txt',
                    'zipsample/folder/b.txt'
                ]);
            });
        });

        describe('#readFileAsText(filename, encoding)', function() {
            it('reads the file as text.', function() {
                return reader.readFileAsText('zipsample/a.txt')
                .then(function(a) {
                    expect(a).to.equal('a');
                });
            });
        });

        describe('#readFileAsBlob(filename)', function() {
            it('reads the file as Blob.', function() {
                return reader.readFileAsBlob('zipsample/a.txt')
                .then(function(a) {
                    expect(a).to.be.instanceof(Blob);
                });
            });
        });

        describe('#readFileAsArrayBuffer(filename)', function() {
            it('reads the file as ArrayBuffer.', function() {
                return reader.readFileAsArrayBuffer('zipsample/a.txt')
                .then(function(a) {
                    expect(a).to.be.instanceof(ArrayBuffer);
                });
            });
        });

        describe('#readFileAsDataURL(filname)', function() {
            it('reads the file as data URL.', function() {
                return reader.readFileAsDataURL('zipsample/a.txt')
                .then(function(a) {
                    expect(a.split(',').pop()).to.equal(btoa('a'));
                });
            });
        });

        describe('#readFileAsBinaryString(filename)', function() {
            it('reads the file as binary string.', function() {
                return reader.readFileAsBinaryString('zipsample/a.txt')
                .then(function(a) {
                    expect(a).to.be.a('string');
                });
            });
        });

        describe('#readFileAsTextSync(filename, encoding)', function() {
            it('reads the file as text.', function(done) {
                worker.postMessage('ZipArchiveReader#readFileAsTextSync(filename)');
                worker.onmessage = function(e) {
                    expect(e.data).to.equal('a');
                    done();
                };
            });
        });

        describe('#readFileAsArrayBufferSync(filename)', function() {
            it('reads the file as ArrayBuffer.', function(done) {
                worker.postMessage('ZipArchiveReader#readFileAsArrayBufferSync(filename)');
                worker.onmessage = function(e) {
                    expect(e.data).to.be.instanceof(ArrayBuffer);
                    done();
                };
            });
        });
        
        describe('#readFileAsDataURLSync(filename)', function() {
            it('reads the file as data URL.', function(done) {
                worker.postMessage('ZipArchiveReader#readFileAsDataURLSync(filename)');
                worker.onmessage = function(e) {
                    expect(e.data.split(',').pop()).to.equal(btoa('a'));
                    done();
                };
            });
        });
        
        describe('#readFileAsBlobSync(filename)', function() {
            it('reads the file as Blob.', function(done) {
                worker.postMessage('ZipArchiveReader#readFileAsBlobSync(filename)');
                worker.onmessage = function(e) {
                    expect(e.data).to.be.instanceof(Blob);
                    done();
                };
            });
        });
        
        describe('#readFileAsBinaryStringSync(filename)', function() {
            it('reads the file as binary string.', function(done) {
                worker.postMessage('ZipArchiveReader#readFileAsBinaryStringSync(filename)');
                worker.onmessage = function(e) {
                    expect(e.data).to.be.a('string');
                    done();
                };
            });
        });        
    });

    describe('ZipArchiveReaderBlob', function() {
        var reader;

        before(function(done) {
            jz.utils.load('test/zipsample.zip')
            .spread(function(buffer) {
                return jz.zip.unpack(new Blob([buffer]));
            })
            .then(function(_reader) {
                reader = _reader;
                done();
            });
        });

        describe('#getFileNames()', function() {
            it('gets file names in a zip archive.', function() {
                expect(reader.getFileNames()).to.eql([
                    'zipsample/a.txt',
                    'zipsample/folder/b.txt'
                ]);
            });
        });

        describe('#readFileAsText(filename, encoding)', function() {
            it('reads the file as text.', function() {
                return reader.readFileAsText('zipsample/a.txt')
                .then(function(a) {
                    expect(a).to.equal('a');
                });
            });
        });

        describe('#readFileAsBlob(filename)', function() {
            it('reads the file as Blob.', function() {
                return reader.readFileAsBlob('zipsample/a.txt')
                .then(function(a) {
                    expect(a).to.be.instanceof(Blob);
                });
            });
        });

        describe('#readFileAsArrayBuffer(filename)', function() {
            it('reads the file as ArrayBuffer.', function() {
                return reader.readFileAsArrayBuffer('zipsample/a.txt')
                .then(function(a) {
                    expect(a).to.be.instanceof(ArrayBuffer);
                });
            });
        });

        describe('#readFileAsDataURL(filname)', function() {
            it('reads the file as data URL.', function() {
                return reader.readFileAsDataURL('zipsample/a.txt')
                .then(function(a) {
                    expect(a.split(',').pop()).to.equal(btoa('a'));
                });
            });
        });

        describe('#readFileAsBinaryString(filename)', function() {
            it('reads the file as binary string.', function() {
                return reader.readFileAsBinaryString('zipsample/a.txt')
                .then(function(a) {
                    expect(a).to.be.a('string');
                });
            });
        });

        describe('#readFileAsTextSync(filename, encoding)', function() {
            it('reads the file as text.', function(done) {
                worker.postMessage('ZipArchiveReaderBlob#readFileAsTextSync(filename)');
                worker.onmessage = function(e) {
                    expect(e.data).to.equal('a');
                    done();
                };
            });
        });

        describe('#readFileAsArrayBufferSync(filename)', function() {
            it('reads the file as ArrayBuffer.', function(done) {
                worker.postMessage('ZipArchiveReaderBlob#readFileAsArrayBufferSync(filename)');
                worker.onmessage = function(e) {
                    expect(e.data).to.be.instanceof(ArrayBuffer);
                    done();
                };
            });
        });
        
        describe('#readFileAsDataURLSync(filename)', function() {
            it('reads the file as data URL.', function(done) {
                worker.postMessage('ZipArchiveReaderBlob#readFileAsDataURLSync(filename)');
                worker.onmessage = function(e) {
                    expect(e.data.split(',').pop()).to.equal(btoa('a'));
                    done();
                };
            });
        });
        
        describe('#readFileAsBlobSync(filename)', function() {
            it('reads the file as Blob.', function(done) {
                worker.postMessage('ZipArchiveReaderBlob#readFileAsBlobSync(filename)');
                worker.onmessage = function(e) {
                    expect(e.data).to.be.instanceof(Blob);
                    done();
                };
            });
        });
        
        describe('#readFileAsBinaryStringSync(filename)', function() {
            it('reads the file as binary text.', function(done) {
                worker.postMessage('ZipArchiveReaderBlob#readFileAsBinaryStringSync(filename)');
                worker.onmessage = function(e) {
                    expect(e.data).to.be.a('string');
                    done();
                };
            });
        });  
    });

    describe('jz.zip.ZipArchiveWriter', function() {
        var writer = new jz.zip.ZipArchiveWriter({
            shareMemory: true,
            chunkSize: 0x8000
        });

        it('has params.', function() {
            expect(writer.shareMemory).to.equal(true);
            expect(writer.chunkSize).to.equal(0x8000);
        });

        describe('#write', function() {
            it('exists.', function() {
                expect(writer.write).to.exist;
            });
        });

        describe('#writeDir', function() {
            it('exists.', function() {
                expect(writer.writeDir).to.exist;
            });
        });

        describe('#writeFile', function() {
            it('exists.', function() {
                expect(writer.writeFile).to.exist;
            });
        });

        describe('#writeEnd', function() {
            it('exists.', function() {
                expect(writer.writeEnd).to.exist;
            });
        });

        describe('#on', function() {
            it('exists.', function() {
                expect(writer.on).to.exist;
            });
        });
    });

    describe('jz.zip.pack({files, level, chunkSize})', function() {
        it('pack to the zip archive (buffer).', function() {
            var files = [
                {name: 'zipsample', dir: [
                    {name: 'a.txt', buffer: 'a'},
                    {name: 'folder', dir: [
                        {name: 'b.txt', buffer: 'b'}
                    ]}
                ]}
            ];

            return jz.zip.pack(files)
            .then(jz.zip.unpack)
            .then(function(reader) {
                return Promise.all([
                    reader.readFileAsText('zipsample/a.txt'),
                    reader.readFileAsText('zipsample/folder/b.txt')
                ])
            })
            .spread(function(a, b) {
                expect(a).to.equal('a');
                expect(b).to.equal('b');
            });
        });

        it('pack to the zip archive (url).', function() {
            var files = [
                {name: 'zipsample', dir: [
                    {name: 'a.txt', url: 'test/zipsample/a.txt'},
                    {name: 'folder', dir: [
                        {name: 'b.txt', url: 'test/zipsample/folder/b.txt'}
                    ]}
                ]}
            ];

            return jz.zip.pack(files)
            .then(jz.zip.unpack)
            .then(function(reader) {
                return Promise.all([
                    reader.readFileAsText('zipsample/a.txt'),
                    reader.readFileAsText('zipsample/folder/b.txt')
                ])
            })
            .spread(function(a, b) {
                expect(a).to.equal('a');
                expect(b).to.equal('b');
            });
        });
    });
});


describe('jz.stream.algos', function() {
    describe('jz.stream.algos.deflate({buffer, streamFn, level, shareMemory, chunkSize})', function() {
        it('exists.', function() {
            expect(jz.stream.algos.deflate).to.exist;
        });
    });

    describe('jz.stream.algos.inflate({buffer, streamFn, shareMemory, chunkSize})', function() {
        it('exists.', function() {
            expect(jz.stream.algos.inflate).to.exist;
        });
    });
});


describe('jz.stream.zlib', function() {
    describe('jz.stream.zlib.compress({buffer, streamFn, level, shareMemory, chunkSize})', function() {
        it('exists.', function() {
            expect(jz.stream.zlib.compress).to.exist;
        });
    });

    describe('jz.sttream.zlib.decompress({buffer, streamFn, shareMemory, chunkSize})', function() {
        it('exists.', function() {
            expect(jz.stream.zlib.decompress).to.exist;
        });
    })
});


describe('jz.stream.gz', function() {
    describe('jz.stream.gz.compress({buffer, streamFn, level, shareMemory, chunkSize})', function() {
        it('exists.', function() {
            expect(jz.stream.gz.compress).to.exist;
        });
    });

    describe('jz.stream.gz.decompress({buffer, streamFn, shareMemory, chunkSize})', function() {
        it('exists.', function() {
            expect(jz.stream.gz.decompress).to.exist;
        });
    })
});


describe('jz.stream.zip', function() {
    describe('jz.stream.zip.pack({files, level, chunkSize})', function() {
        it('exists.', function() {
            expect(jz.stream.zip.pack).to.exist;
        });
    })
});

