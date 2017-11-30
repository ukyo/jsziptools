import * as zlib from '../../node_modules/zlib-asm/index';

export interface ZlibBackend {
    deflate(buffer: Uint8Array, compressionLevel?: number, chunkSize?: number): Uint8Array
    rawDeflate(buffer: Uint8Array, compressionLevel?: number, chunkSize?: number): Uint8Array
    inflate(buffer: Uint8Array, chunkSize?: number): Uint8Array
    rawInflate(buffer: Uint8Array, chunkSize?: number): Uint8Array
    stream: {
        deflate(buffer: Uint8Array, streamFn: (chunk: Uint8Array) => void, compressionLevel?: number, shareMemory?: boolean, chunkSize?: number): void
        rawDeflate(buffer: Uint8Array, streamFn: (chunk: Uint8Array) => void, compressionLevel?: number, shareMemory?: boolean, chunkSize?: number): void
        inflate(buffer: Uint8Array, streamFn?: (chunk:Uint8Array) => any, shareMemory?: boolean, chunkSize?: number): void
        rawInflate(buffer: Uint8Array, streamFn?: (chunk:Uint8Array) => any, shareMemory?: boolean, chunkSize?: number): void
    }
}

export let zlibBackend: ZlibBackend;

export function setZlibBackend(_zlibBackend: ZlibBackend) {
    zlibBackend = _zlibBackend;
}

setZlibBackend({
    deflate: zlib.deflate,
    inflate: zlib.inflate,
    rawDeflate: zlib.rawDeflate,
    rawInflate: zlib.rawInflate,
    stream: {
        deflate(buffer: Uint8Array, streamFn: (chunk: Uint8Array) => any, level?: number, shareMemory?: boolean, chunkSize?: number) {
            zlib.stream.deflate({
                input: buffer,
                streamFn: streamFn,
                compressionLevel: level,
                shareMemory: shareMemory,
                chunkSize: chunkSize
            });
        },
        inflate(buffer: Uint8Array, streamFn?: (chunk:Uint8Array) => any, shareMemory?: boolean, chunkSize?: number) {
            zlib.stream.rawInflate({
                input: buffer,
                streamFn: streamFn,
                shareMemory: shareMemory,
                chunkSize: chunkSize
            });
        },
        rawDeflate(buffer: Uint8Array, streamFn: (chunk: Uint8Array) => any, level?: number, shareMemory?: boolean, chunkSize?: number) {
            zlib.stream.rawDeflate({
                input: buffer,
                streamFn: streamFn,
                compressionLevel: level,
                shareMemory: shareMemory,
                chunkSize: chunkSize
            });
        },
        rawInflate(buffer: Uint8Array, streamFn?: (chunk: Uint8Array) => any, shareMemory?: boolean, chunkSize?: number) {
            zlib.stream.rawInflate({
                input: buffer,
                streamFn: streamFn,
                shareMemory: shareMemory,
                chunkSize: chunkSize
            });
        }
    }
});
