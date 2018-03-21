import {
  BufferLike,
  toBytes,
  LOCAL_FILE_SIGNATURE,
  END_SIGNATURE,
  concatBytes,
  detectEncoding,
  bytesToString,
} from '../common';
import { inflate } from '../core';
import {
  ZipArchiveReader,
  ZipLocalFileHeader,
  ZipCentralDirHeader,
  ZipEndCentDirHeader,
  readLocalFileHeader,
  readCentralDirHeader,
  readEndCentDirHeader,
} from './zip_archive_reader';

export interface ZipArchiveReaderConstructorParams {
  buffer: BufferLike;
  encoding?: string;
  chunkSize?: number;
}

export class ZipBufferArchiveReader extends ZipArchiveReader {
  private bytes: Uint8Array;

  constructor(params: ZipArchiveReaderConstructorParams);
  constructor(buffer: BufferLike, encoding?: string, chunkSize?: number);
  constructor(buffer: any, encoding?: string, chunkSize?: number) {
    super();
    this.buffer = buffer;
    this.encoding = encoding;
    this.chunkSize = chunkSize;
    this.bytes = toBytes(this.buffer);
    this.init = this.init.bind(this);
  }

  init() {
    let signature: number;
    let localFileHeader: ZipLocalFileHeader;
    let centralDirHeader: ZipCentralDirHeader;
    let endCentDirHeader: ZipEndCentDirHeader;
    let i: number;
    let n: number;
    let bytes = this.bytes;
    let localFileHeaders: ZipLocalFileHeader[] = [];
    let centralDirHeaders: ZipCentralDirHeader[] = [];
    let files: ZipLocalFileHeader[] = [];
    let folders: ZipLocalFileHeader[] = [];
    let offset = bytes.byteLength - 4;
    let view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

    this.files = files;
    this.folders = folders;
    this.localFileHeaders = localFileHeaders;
    this.centralDirHeaders = centralDirHeaders;

    // check the first local file signature
    if (view.getUint32(0, true) !== LOCAL_FILE_SIGNATURE) {
      throw new Error('zip.unpack: invalid zip file');
    }

    // read the end central dir header.
    while (true) {
      if (view.getUint32(offset, true) === END_SIGNATURE) {
        endCentDirHeader = readEndCentDirHeader(this.bytes.buffer, offset);
        break;
      }
      offset--;
      if (offset === 0) throw new Error('zip.unpack: invalid zip file');
    }

    // read central dir headers.
    offset = endCentDirHeader.startpos;
    for (i = 0, n = endCentDirHeader.direntry; i < n; ++i) {
      centralDirHeader = readCentralDirHeader(this.bytes.buffer, this.bytes.byteOffset + offset);
      centralDirHeaders.push(centralDirHeader);
      offset += centralDirHeader.allsize;
    }

    // read local file headers.
    for (i = 0; i < n; ++i) {
      offset = centralDirHeaders[i].headerpos;
      localFileHeader = readLocalFileHeader(this.bytes.buffer, this.bytes.byteOffset + offset);
      localFileHeader.crc32 = centralDirHeaders[i].crc32;
      localFileHeader.compsize = centralDirHeaders[i].compsize;
      localFileHeader.uncompsize = centralDirHeaders[i].uncompsize;
      localFileHeaders.push(localFileHeader);
    }

    return this._completeInit();
  }

  protected async _decompressFile(fileName: string) {
    let info = this._getFileInfo(fileName);
    return this._decompress(this.bytes.subarray(info.offset, info.offset + info.length), info.isCompressed);
  }

  protected _decompressFileSync(fileName: string) {
    let info = this._getFileInfo(fileName);
    return this._decompress(this.bytes.subarray(info.offset, info.offset + info.length), info.isCompressed);
  }
}
