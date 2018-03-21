import { BufferLike, toBytes, load } from '../../common';
import { ZipItem, ZipArchiveWriter } from '../../zip';

export interface StreamZipPackParams {
  files: ZipItem[];
  streamFn?(chunk: Uint8Array): any;
  level?: number;
  shareMemory?: boolean;
  chunkSize?: number;
}

/**
 * Creates zip archive.
 *
 * @example
 * jz.stream.zip.pack({
 *   files: [
 *     {name: "foo.mp3", buffer: mp3Buffer}
 *   ],
 *   streamFn: chunk => console.log(chunk.length),
 *   level: 6,
 *   shareMemory: false,
 *   chunkSize: 0x8000
 * })
 */
export async function pack({ files, streamFn, level, shareMemory, chunkSize }: StreamZipPackParams): Promise<void> {
  const promises: Promise<any>[] = [];
  const writer = new ZipArchiveWriter({ shareMemory, chunkSize });
  level = typeof level === 'number' ? level : 6;
  writer.on('data', streamFn);

  function packItem(level: number, path: string, item: ZipItem) {
    const dir = item.children || item.dir || item.folder;
    let buffer: BufferLike;
    level = typeof item.level === 'number' ? item.level : level;
    // init buffer and file path.
    if (dir) {
      path += item.name + (/.+\/$/.test(item.name) ? '' : '/');
      writer.writeDir(path);
      dir.forEach(item => packItem(level, path, item));
    } else {
      if (item.buffer != null) buffer = item.buffer;
      if (buffer != null) {
        path += item.name;
      } else {
        throw new Error('jz.zip.pack: This type is not supported.');
      }
      writer.writeFile(path, toBytes(buffer), level);
    }
  }
  // load files with ajax(async).
  function loadFile(item: ZipItem) {
    const dir = item.children || item.dir || item.folder;
    if (dir) {
      dir.forEach(loadFile);
    } else if (!item.buffer && item.url) {
      promises.push(load(item.url).then((bytess: Uint8Array[]) => (item.buffer = bytess[0])));
    }
  }

  files.forEach(loadFile);
  await Promise.all(promises);
  (<ZipItem[]>files).forEach(item => packItem(level, '', item));
  writer.writeEnd();
}
