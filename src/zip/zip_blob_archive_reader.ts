import {
  ZipArchiveReader,
  ZipLocalFileHeader,
  ZipCentralDirHeader,
  ZipEndCentDirHeader,
  readLocalFileHeader,
  readCentralDirHeader,
  readEndCentDirHeader,
} from './zip_archive_reader';
import { readFileAsArrayBuffer, LOCAL_FILE_SIGNATURE, END_SIGNATURE } from '../common';

export interface ZipBlobArchiveReaderConstructorParams {
  blob: Blob;
  encoding?: string;
  chunkSize?: number;
}

/**
 * ZipBlobArchiveReader
 */
export class ZipBlobArchiveReader extends ZipArchiveReader {
  private blob: Blob;

  constructor(params: ZipBlobArchiveReaderConstructorParams);
  constructor(blob: Blob, encoding?: string, chunkSize?: number);
  constructor(blob: any, encoding?: string, chunkSize?: number) {
    super();
    this.blob = blob;
    this.encoding = encoding;
    this.chunkSize = chunkSize;
  }

  async init() {
    let blob = this.blob;
    let endCentDirHeader: ZipEndCentDirHeader;
    let centralDirHeaders: ZipCentralDirHeader[] = [];
    let localFileHeaders: ZipLocalFileHeader[] = [];
    let files: ZipLocalFileHeader[] = [];
    let folders: ZipLocalFileHeader[] = [];
    let readChunk = (start: number, end: number) => readFileAsArrayBuffer(blob.slice(start, end));

    this.files = files;
    this.folders = folders;
    this.localFileHeaders = localFileHeaders;
    this.centralDirHeaders = centralDirHeaders;

    let offset: number;
    // validate first local file signature
    {
      const chunk = await readChunk(0, 4);
      if (new DataView(chunk).getUint32(0, true) === LOCAL_FILE_SIGNATURE) {
        offset = Math.max(0, blob.size - 0x8000);
      } else {
        throw new Error('zip.unpack: invalid zip file.');
      }
    }
    // validate end signature
    OUTER: do {
      const chunk = await readChunk(offset, Math.min(blob.size, offset + 0x8000));
      const view = new DataView(chunk);
      for (let i = chunk.byteLength - 4; i--; ) {
        if (view.getUint32(i, true) === END_SIGNATURE) {
          offset += i;
          break OUTER;
        }
      }
      offset = Math.max(offset - 0x8000 + 3, 0);
    } while (offset);
    if (!offset) throw new Error('zip.unpack: invalid zip file.');
    // read end central dir header
    endCentDirHeader = readEndCentDirHeader(await readChunk(offset, blob.size), 0);
    // read central dir headers
    await readChunk(endCentDirHeader.startpos, offset).then(buffer => {
      let offset = 0;
      let header: ZipCentralDirHeader;

      for (let i = 0; i < endCentDirHeader.direntry; ++i) {
        header = readCentralDirHeader(buffer, offset);
        centralDirHeaders.push(header);
        offset += header.allsize;
      }
    });
    // read local file headers
    for (let i = 0; i < centralDirHeaders.length; ++i) {
      const offset = centralDirHeaders[i].headerpos;
      const view = new DataView(await readChunk(offset + 26, offset + 30));
      const fnamelen = view.getUint16(0, true);
      const extralen = view.getUint16(2, true);
      const header = readLocalFileHeader(await readChunk(offset, offset + 30 + fnamelen + extralen), 0);
      header.crc32 = centralDirHeaders[i].crc32;
      header.compsize = centralDirHeaders[i].compsize;
      header.uncompsize = centralDirHeaders[i].uncompsize;
      localFileHeaders.push(header);
    }
    return this._completeInit();
  }

  protected _decompressFile(fileName: string): Promise<Uint8Array> {
    let info = this._getFileInfo(fileName);
    let blob = this.blob.slice(info.offset, info.offset + info.length);
    return readFileAsArrayBuffer(blob).then(ab => this._decompress(new Uint8Array(ab), info.isCompressed));
  }

  protected _decompressFileSync(fileName: string) {
    let info = this._getFileInfo(fileName);
    let blob = this.blob.slice(info.offset, info.offset + info.length);
    let bytes = new Uint8Array(new FileReaderSync().readAsArrayBuffer(blob));
    return this._decompress(bytes, info.isCompressed);
  }
}
