import * as core from './lib/core';

const checksum = core.crc32(new Uint8Array(100));
