import * as jz from '../lib/index';

declare var URL: any;
const expect = chai.expect;
const worker = new Worker('/dist/test_worker.js');

before(done => worker.onmessage = e => done());

describe('jz.common', () => {
    describe('.toBytes(buffer)', () => {
        it('converts to Uint8Array', () => {
            expect(jz.common.toBytes(new Uint8Array(4))).to.be.instanceof(Uint8Array);
            expect(jz.common.toBytes(new ArrayBuffer(4))).to.be.instanceof(Uint8Array);
            expect(jz.common.toBytes([0, 0, 0, 0])).to.be.instanceof(Uint8Array);
            expect(jz.common.toBytes('aaaa')).to.be.instanceof(Uint8Array);
        });
    });

    describe('.readFileAsArrayBuffer(blob)', () => {
        it('reads the file as ArrayBuffer.', () => {
            return jz.common.readFileAsArrayBuffer(new Blob([new Uint8Array(100)]))
            .then(buffer => {
                expect(buffer).to.be.instanceof(ArrayBuffer);
                expect(buffer.byteLength).to.equal(100);
            });
        })
    });

    describe('.readFileAsText(blob, encoding)', () => {
        it('reads the file as string.', () => {
            return jz.common.readFileAsText(new Blob(['こんにちは世界']))
            .then(text => {
                expect(text).to.equal('こんにちは世界');
            });
        })
    });

    describe('.readFileAsDataURL(blob)', () => {
        it('reads the file as data URL.', () => {
            return jz.common.readFileAsDataURL(new Blob(['hello']))
            .then(dataURL => {
                expect(dataURL.split(',').pop()).to.equal(btoa('hello'));
            });
        });
    });

    describe('.bytesToString(buffer)', () => {
        it('converts Uint8Array to string.', () => {
            return jz.common.readFileAsArrayBuffer(new Blob(['こんにちは世界']))
            .then(jz.common.bytesToString)
            .then(text => {
                expect(text).to.equal('こんにちは世界');
            });
        });
    });

    describe('.bytesToStringSync(buffer)', () => {
        it('converts Uint8Array to string.', done => {
            worker.postMessage('jz.common.bytesToStringSync(buffer)');
            worker.onmessage = e => {
                expect(e.data).to.equal('こんにちは世界');
                done();
            };
        });
    });

    describe('.conatBytes(buffers)', () => {
        it('concats bytes.', () => {
            const bytes1 = new Uint8Array([1, 2]);
            const bytes2 = new Uint8Array([3, 4]);
            const bytes3 = new Uint8Array([5, 6]);
            expect(jz.common.concatBytes(bytes1, bytes2, bytes3)).to.eql(new Uint8Array([1, 2, 3, 4, 5, 6]));
            expect(jz.common.concatBytes([bytes1, bytes2, bytes3])).to.eql(new Uint8Array([1, 2, 3, 4, 5, 6]));
        })
    });

    describe('.load(urls)', function() {
        it('loads files as Uint8Array.', function() {
            return jz.common.load(URL.createObjectURL(new Blob([new Uint8Array([1, 2, 3])])))
            .then((bytess) => {
                const bytes = bytess[0];
                expect(bytes).to.be.instanceof(Uint8Array);
                expect(bytes).to.eql(new Uint8Array([1, 2, 3]));
            });
        });
    });
});

describe('jz.core', () => {
    describe('.deflate({buffer, level, chunkSize})', () => {
        it('exists', () => {
            expect(jz.core.deflate).to.exist;
        });
    });

    describe('.inflate({buffer, chunkSize})', () => {
        it('exists', () => {
            expect(jz.core.inflate).to.exist;
        });
    });

    describe('.adler32(buffer)', () => {
        it('exists', () => {
            expect(jz.core.adler32).to.exist;
        });
    });

    describe('.crc32({buffer, src})', () => {
        it('exists', () => {
            expect(jz.core.crc32).to.exist;
        });
    });
});

describe('jz.zlib', () => {
    let zlibStream: Uint8Array;

    before(() => {
        return jz.common.load('test/nicowari.swf')
        .then(([_bytes]: any) => {
            zlibStream = new Uint8Array(_bytes.subarray(8));
        });
    });

    describe('.decompress({buffer, chunkSize})', () => {
        // jz.zip.decompress validates the source with adler32 checksum.
        it('decompresses the zlib stream.', () => {
            expect(jz.zlib.decompress(zlibStream)).to.be.instanceof(Uint8Array);
        })
    });

    describe('.compress({buffer, level, chunkSize})', () => {
        it('compressses to the zlib stream.', () => {
            return Promise.resolve(zlibStream)
            .then(jz.zlib.decompress)
            .then(jz.zlib.compress)
            .then(jz.zlib.decompress)
            .then(decompressed => {
                expect(decompressed).to.be.instanceof(Uint8Array);
            });
        });
    });
});


describe('jz.gz', () => {
    let gzStream: Uint8Array;

    before(() => {
        return jz.common.load('test/sample.txt.gz')
        .then((_gzStream) => gzStream = _gzStream[0]);
    });

    describe('.decompress({buffer, chunkSize})', () => {
        it('decompresses the gzip stream.', () => {
            expect(jz.gz.decompress(gzStream)).to.be.instanceof(Uint8Array);
        });
    });

    describe('jz.gz.compress({buffer, level, chunkSize})', () => {
        it('compresses to the gzip stream.', () => {
            return Promise.resolve(gzStream)
            .then(jz.gz.decompress)
            .then(jz.gz.compress)
            .then(jz.gz.decompress)
            .then(decompressed => {
                expect(decompressed).to.be.instanceof(Uint8Array);
            });
        });
    });
});


describe('jz.zip', () => {
    describe('.unpack({buffer, encoding, chunkSize})', () => {
        it('exists.', () => {
            expect(jz.zip.unpack).to.exist;
        });
    });

    describe('ZipBufferArchiveReader', function() {
        var reader: jz.zip.ZipArchiveReader;

        before(() => {
            return jz.common.load('/test/zipsample.zip')
            .then((buffers) => jz.zip.unpack(buffers[0]))
            .then((_reader) => reader = _reader);
        });

        describe('#getFileNames()', () => {
            it('gets file names in a zip archive.', () => {
                expect(reader.getFileNames()).to.eql([
                    'zipsample/a.txt',
                    'zipsample/folder/b.txt'
                ]);
            });
        });

        describe('#readFileAsText(filename, encoding)', () => {
            it('reads the file as text.', () => {
                return reader.readFileAsText('zipsample/a.txt')
                .then(a => {
                    expect(a).to.equal('a');
                });
            });
        });

        describe('#readFileAsBlob(filename)', () => {
            it('reads the file as Blob.', () => {
                return reader.readFileAsBlob('zipsample/a.txt')
                .then(a => {
                    expect(a).to.be.instanceof(Blob);
                });
            });
        });

        describe('#readFileAsArrayBuffer(filename)', () => {
            it('reads the file as ArrayBuffer.', () => {
                return reader.readFileAsArrayBuffer('zipsample/a.txt')
                .then(a => {
                    expect(a).to.be.instanceof(ArrayBuffer);
                });
            });
        });

        describe('#readFileAsDataURL(filname)', () => {
            it('reads the file as data URL.', () => {
                return reader.readFileAsDataURL('zipsample/a.txt')
                .then(a => {
                    expect(a.split(',').pop()).to.equal(btoa('a'));
                });
            });
        });

        describe('#readFileAsTextSync(filename, encoding)', () => {
            it('reads the file as text.', done => {
                worker.postMessage('ZipBufferArchiveReader#readFileAsTextSync(filename)');
                worker.onmessage = e => {
                    expect(e.data).to.equal('a');
                    done();
                };
            });
        });

        describe('#readFileAsArrayBufferSync(filename)', () => {
            it('reads the file as ArrayBuffer.', done => {
                worker.postMessage('ZipBufferArchiveReader#readFileAsArrayBufferSync(filename)');
                worker.onmessage = e => {
                    expect(e.data).to.be.instanceof(ArrayBuffer);
                    done();
                };
            });
        });
        
        describe('#readFileAsDataURLSync(filename)', () => {
            it('reads the file as data URL.', done => {
                worker.postMessage('ZipBufferArchiveReader#readFileAsDataURLSync(filename)');
                worker.onmessage = e => {
                    expect(e.data.split(',').pop()).to.equal(btoa('a'));
                    done();
                };
            });
        });
        
        describe('#readFileAsBlobSync(filename)', () => {
            it('reads the file as Blob.', done => {
                worker.postMessage('ZipBufferArchiveReader#readFileAsBlobSync(filename)');
                worker.onmessage = e => {
                    expect(e.data).to.be.instanceof(Blob);
                    done();
                };
            });
        }); 
    });

    describe('ZipBlobArchiveReader', () => {
        var reader: jz.zip.ZipArchiveReader;

        before(() => {
            return jz.common.load('/test/zipsample.zip')
            .then(([buffer]: any) => jz.zip.unpack(new Blob([buffer])))
            .then((_reader) => reader = _reader);
        });

        describe('#getFileNames()', () => {
            it('gets file names in a zip archive.', () => {
                expect(reader.getFileNames()).to.eql([
                    'zipsample/a.txt',
                    'zipsample/folder/b.txt'
                ]);
            });
        });

        describe('#readFileAsText(filename, encoding)', () => {
            it('reads the file as text.', () => {
                return reader.readFileAsText('zipsample/a.txt')
                .then(a => {
                    expect(a).to.equal('a');
                });
            });
        });

        describe('#readFileAsBlob(filename)', () => {
            it('reads the file as Blob.', () => {
                return reader.readFileAsBlob('zipsample/a.txt')
                .then(a => {
                    expect(a).to.be.instanceof(Blob);
                });
            });
        });

        describe('#readFileAsArrayBuffer(filename)', () => {
            it('reads the file as ArrayBuffer.', () => {
                return reader.readFileAsArrayBuffer('zipsample/a.txt')
                .then(a => {
                    expect(a).to.be.instanceof(ArrayBuffer);
                });
            });
        });

        describe('#readFileAsDataURL(filname)', () => {
            it('reads the file as data URL.', () => {
                return reader.readFileAsDataURL('zipsample/a.txt')
                .then(a => {
                    expect(a.split(',').pop()).to.equal(btoa('a'));
                });
            });
        });

        describe('#readFileAsTextSync(filename, encoding)', () => {
            it('reads the file as text.', done => {
                worker.postMessage('ZipBlobArchiveReader#readFileAsTextSync(filename)');
                worker.onmessage = e => {
                    expect(e.data).to.equal('a');
                    done();
                };
            });
        });

        describe('#readFileAsArrayBufferSync(filename)', () => {
            it('reads the file as ArrayBuffer.', done => {
                worker.postMessage('ZipBlobArchiveReader#readFileAsArrayBufferSync(filename)');
                worker.onmessage = e => {
                    expect(e.data).to.be.instanceof(ArrayBuffer);
                    done();
                };
            });
        });
        
        describe('#readFileAsDataURLSync(filename)', () => {
            it('reads the file as data URL.', done => {
                worker.postMessage('ZipBlobArchiveReader#readFileAsDataURLSync(filename)');
                worker.onmessage = e => {
                    expect(e.data.split(',').pop()).to.equal(btoa('a'));
                    done();
                };
            });
        });
        
        describe('#readFileAsBlobSync(filename)', () => {
            it('reads the file as Blob.', done => {
                worker.postMessage('ZipBlobArchiveReader#readFileAsBlobSync(filename)');
                worker.onmessage = e => {
                    expect(e.data).to.be.instanceof(Blob);
                    done();
                };
            });
        });
    });

    describe('jz.zip.ZipArchiveWriter', () => {
        const writer = new jz.zip.ZipArchiveWriter({
            shareMemory: true,
            chunkSize: 0x8000
        });

        it('has params.', () => {
            expect(writer.shareMemory).to.equal(true);
            expect(writer.chunkSize).to.equal(0x8000);
        });

        describe('#write', () => {
            it('exists.', () => {
                expect(writer.write).to.exist;
            });
        });

        describe('#writeDir', () => {
            it('exists.', () => {
                expect(writer.writeDir).to.exist;
            });
        });

        describe('#writeFile', () => {
            it('exists.', () => {
                expect(writer.writeFile).to.exist;
            });
        });

        describe('#writeEnd', () => {
            it('exists.', () => {
                expect(writer.writeEnd).to.exist;
            });
        });

        describe('#on', () => {
            it('exists.', () => {
                expect(writer.on).to.exist;
            });
        });
    });

    describe('.pack({files, level, chunkSize})', () => {
        it('pack to the zip archive (buffer).', () => {
            const files = [
                {name: 'zipsample', dir: [
                    {name: 'a.txt', buffer: 'a'},
                    {name: 'folder', dir: [
                        {name: 'b.txt', buffer: 'b'}
                    ]}
                ]}
            ];

            return jz.zip.pack(files)
            .then(jz.zip.unpack)
            .then(reader => {
                return Promise.all([
                    reader.readFileAsText('zipsample/a.txt'),
                    reader.readFileAsText('zipsample/folder/b.txt')
                ])
            })
            .then(([a, b]: any) => {
                expect(a).to.equal('a');
                expect(b).to.equal('b');
            });
        });

        it('pack to the zip archive (url).', () => {
            const files = [
                {name: 'zipsample', dir: [
                    {name: 'a.txt', url: '/test/zipsample/a.txt'},
                    {name: 'folder', dir: [
                        {name: 'b.txt', url: '/test/zipsample/folder/b.txt'}
                    ]}
                ]}
            ];

            return jz.zip.pack(files)
            .then(jz.zip.unpack)
            .then(reader => {
                return Promise.all([
                    reader.readFileAsText('zipsample/a.txt'),
                    reader.readFileAsText('zipsample/folder/b.txt')
                ])
            })
            .then(([a, b]: any) => {
                expect(a).to.equal('a');
                expect(b).to.equal('b');
            });
        });
    });
});


describe('jz.stream.core', () => {
    describe('.deflate({buffer, streamFn, level, shareMemory, chunkSize})', () => {
        it('exists.', () => {
            expect(jz.stream.core.deflate).to.exist;
        });
    });

    describe('.inflate({buffer, streamFn, shareMemory, chunkSize})', () => {
        it('exists.', () => {
            expect(jz.stream.core.inflate).to.exist;
        });
    });
});


describe('jz.stream.zlib', () => {
    describe('.compress({buffer, streamFn, level, shareMemory, chunkSize})', () => {
        it('exists.', () => {
            expect(jz.stream.zlib.compress).to.exist;
        });
    });

    describe('.decompress({buffer, streamFn, shareMemory, chunkSize})', () => {
        it('exists.', () => {
            expect(jz.stream.zlib.decompress).to.exist;
        });
    })
});


describe('jz.stream.gz', () => {
    describe('.compress({buffer, streamFn, level, shareMemory, chunkSize})', () => {
        it('exists.', () => {
            expect(jz.stream.gz.compress).to.exist;
        });
    });

    describe('.decompress({buffer, streamFn, shareMemory, chunkSize})', () => {
        it('exists.', () => {
            expect(jz.stream.gz.decompress).to.exist;
        });
    })
});


describe('jz.stream.zip', () => {
    describe('.pack({files, level, chunkSize})', () => {
        it('exists.', () => {
            expect(jz.stream.zip.pack).to.exist;
        });
    })
});

