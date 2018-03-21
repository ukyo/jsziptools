import { BufferLike, toBytes } from '../common';

const table = new Uint32Array(256);
const poly = 0xedb88320;
let u: number;
for (let i = 0; i < 256; ++i) {
  u = i;
  for (let j = 0; j < 8; ++j) {
    u = u & 1 ? (u >>> 1) ^ poly : u >>> 1;
  }
  table[i] = u >>> 0;
}

/**
 * Calcurates Crc 32 checksum.
 *
 * @example
 * let checksum;
 * chucks.forEach(c => checksum = jz.common.crc32(c, checksum));
 */
export function crc32(buffer: BufferLike | any, crc?: number): number {
  const bytes = toBytes(buffer);
  const t = table;
  let _crc = crc == null ? 0xffffffff : ~crc >>> 0;
  for (let i = 0, n = bytes.length; i < n; ++i) _crc = (_crc >>> 8) ^ t[bytes[i] ^ (_crc & 0xff)];
  return ~_crc >>> 0;
}
