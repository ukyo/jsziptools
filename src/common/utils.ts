import { BufferLike } from './buffer_like';
import * as constants from './constants';

/**
 * Converts array-like object to an array.
 *
 * @example
 * jz.common.toArray(document.querySelectorAll("div"));
 */
export function toArray<T>(x: any): T[] {
  return <T[]>Array.prototype.slice.call(x);
}

/**
 * Converts Array, ArrayBuffer or String to an Uint8Array.
 *
 * @example
 * var bytes = jz.common.toBytes('foo');
 * var bytes = jz.common.toBytes([1, 2, 3]);
 */
export function toBytes(buffer: BufferLike): Uint8Array {
  switch (Object.prototype.toString.call(buffer)) {
    case '[object String]':
      return stringToBytes(<string>buffer);
    case '[object Array]':
    case '[object ArrayBuffer]':
      return new Uint8Array(<ArrayBuffer>buffer);
    case '[object Uint8Array]':
      return <Uint8Array>buffer;
    case '[object Int8Array]':
    case '[object Uint8ClampedArray]':
    case '[object CanvasPixelArray]':
      const b = <Uint8Array>buffer;
      return new Uint8Array(b.buffer, b.byteOffset, b.byteLength);
    default:
      throw new Error('jz.utils.toBytes: not supported type.');
  }
}

/**
 * Read a file as selected type. This is a FileReader wrapper.
 */
export function readFileAs(type: 'ArrayBuffer', blob: Blob): Promise<ArrayBuffer>;
export function readFileAs(type: 'Text', blob: Blob, encoding?: string): Promise<string>;
export function readFileAs(type: 'DataURL', blob: Blob): Promise<string>;
export function readFileAs(type: 'ArrayBuffer' | 'Text' | 'DataURL', blob: Blob, encoding = 'UTF-8'): Promise<any> {
  var executor: (resolve: Function, reject: Function) => void;
  if (constants.ENV_IS_WORKER) {
    executor = resolve => {
      var fr = new FileReaderSync();
      switch (type) {
        case 'ArrayBuffer':
          resolve(fr.readAsArrayBuffer(blob));
          break;
        case 'Text':
          resolve(fr.readAsText(blob, encoding));
          break;
        case 'DataURL':
          resolve(fr.readAsDataURL(blob));
          break;
      }
    };
  } else {
    executor = (resolve, reject) => {
      var fr = new FileReader();
      fr.onload = () => resolve(fr.result);
      fr.onerror = err => reject(err);
      switch (type) {
        case 'ArrayBuffer':
          fr.readAsArrayBuffer(blob);
          break;
        case 'Text':
          fr.readAsText(blob, encoding);
          break;
        case 'DataURL':
          fr.readAsDataURL(blob);
          break;
      }
    };
  }
  return new Promise(executor);
}

/**
 * Read a file as a string.
 */
export const readFileAsText = (blob: Blob, encoding?: string) => readFileAs('Text', blob, encoding);

/**
 * Read a file as an ArrayBuffer object.
 */
export const readFileAsArrayBuffer = (blob: Blob) => readFileAs('ArrayBuffer', blob);

/**
 * Read a file as a data url string.
 */
export const readFileAsDataURL = (blob: Blob) => readFileAs('DataURL', blob);

/**
 * Converts string to an Uint8Array. its encoding is utf8.
 */
export function stringToBytes(str: string) {
  let n = str.length;
  let idx = -1;
  let byteLength = 32;
  let bytes = new Uint8Array(byteLength);
  let _bytes: Uint8Array;

  for (let i = 0; i < n; ++i) {
    let c = str.charCodeAt(i);
    if (c <= 0x7f) {
      bytes[++idx] = c;
    } else if (c <= 0x7ff) {
      bytes[++idx] = 0xc0 | (c >>> 6);
      bytes[++idx] = 0x80 | (c & 0x3f);
    } else if (c <= 0xffff) {
      bytes[++idx] = 0xe0 | (c >>> 12);
      bytes[++idx] = 0x80 | ((c >>> 6) & 0x3f);
      bytes[++idx] = 0x80 | (c & 0x3f);
    } else {
      bytes[++idx] = 0xf0 | (c >>> 18);
      bytes[++idx] = 0x80 | ((c >>> 12) & 0x3f);
      bytes[++idx] = 0x80 | ((c >>> 6) & 0x3f);
      bytes[++idx] = 0x80 | (c & 0x3f);
    }
    if (byteLength - idx <= 4) {
      _bytes = bytes;
      byteLength *= 2;
      bytes = new Uint8Array(byteLength);
      bytes.set(_bytes);
    }
  }
  return bytes.subarray(0, ++idx);
}

/**
 * Converts Uint8Array to a string.
 *
 * @example
 * jz.common.bytesToString(bytes).then(str => {
 *     console.log(str);
 * });
 *
 * jz.common.bytesToString(bytes, 'UTF-8').then(str => {
 *     console.log(str);
 * });
 */
export function bytesToString(bytes: BufferLike, encoding = 'UTF-8') {
  return readFileAsText(new Blob([toBytes(bytes)]), encoding);
}

/**
 * Converts Uint8Array to a string. You can use it only a worker process.
 *
 * @example
 * var str = jz.common.bytesToStringSync(bytes);
 * var str = jz.common.bytesToStringSync(bytes, 'UTF-8');
 */
export function bytesToStringSync(bytes: BufferLike, encoding = 'UTF-8') {
  if (!constants.ENV_IS_WORKER) throw new Error('bytesToStringSync is available in worker.');
  return new FileReaderSync().readAsText(new Blob([toBytes(bytes)]), encoding);
}

/**
 * Detects encoding of the buffer like object.
 *
 * @example
 * const encoding = jz.common.detectEncoding(bytes);
 * jz.common.detectEncoding(bytes).then(type => {
 *     console.log(type);
 * });
 */
export function detectEncoding(bytes: BufferLike) {
  let b = toBytes(bytes);
  for (let i = 0, n = b.length; i < n; ++i) {
    if (b[i] < 0x80) {
      continue;
    } else if ((b[i] & 0xe0) === 0xc0) {
      if ((b[++i] & 0xc0) === 0x80) continue;
    } else if ((b[i] & 0xf0) === 0xe0) {
      if ((b[++i] & 0xc0) === 0x80 && (b[++i] & 0xc0) === 0x80) continue;
    } else if ((b[i] & 0xf8) === 0xf0) {
      if ((b[++i] & 0xc0) === 0x80 && (b[++i] & 0xc0) === 0x80 && (b[++i] & 0xc0) === 0x80) continue;
    } else {
      return 'Shift_JIS';
    }
  }
  return 'UTF-8';
}

/**
 * Loads buffers with Ajax(async).
 *
 * @example
 * jz.common.load(['a.zip', 'b.zip'])
 * .then(([a, b]) => {
 *   // arguments are Uint8Array
 * });
 * // or
 * jz.common.load('a.zip', 'b.zip')
 */
export async function load(urls: string[]): Promise<Uint8Array[]>;
export async function load(...urls: string[]): Promise<Uint8Array[]>;
export async function load(args: any): Promise<Uint8Array[]> {
  const urls = <string[]>(Array.isArray(args) ? args : toArray(arguments));
  return await Promise.all(
    urls.map(async url => {
      const res = await fetch(url);
      return new Uint8Array(await res.arrayBuffer());
    }),
  );
}

/**
 * Concats bytes.
 *
 * @example
 * let bytes = jz.common.concatBytes(bytes1, bytes2, bytes3);
 * let bytes = jz.common.concatBytes([bytes1, bytes2, bytes3]);
 */
export function concatBytes(buffers: (Uint8Array | ArrayBuffer)[]): Uint8Array;
export function concatBytes(...buffers: (Uint8Array | ArrayBuffer)[]): Uint8Array;
export function concatBytes(_buffers: any): Uint8Array {
  let size = 0;
  let offset = 0;
  let ret: Uint8Array;
  let i: number;
  let n: number;
  let buffers = (Array.isArray(_buffers) ? _buffers : toArray(arguments)).map(toBytes);

  for (i = 0, n = buffers.length; i < n; ++i) size += buffers[i].length;
  ret = new Uint8Array(size);
  for (i = 0; i < n; ++i) {
    ret.set(buffers[i], offset);
    offset += buffers[i].length;
  }
  return ret;
}
