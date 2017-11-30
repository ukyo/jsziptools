import { toBytes, load, defun } from '../../common';
import { ZipArchiveWriter } from '../../zip';
function _pack(files, streamFn, level, shareMemory, chunkSize) {
    const promises = [];
    const writer = new ZipArchiveWriter(shareMemory, chunkSize);
    level = typeof level === 'number' ? level : 6;
    writer.on('data', streamFn);
    function packItem(level, path, item) {
        const dir = item.children || item.dir || item.folder;
        let buffer;
        level = typeof item.level === 'number' ? item.level : level;
        // init buffer and file path.
        if (dir) {
            path += item.name + (/.+\/$/.test(item.name) ? '' : '/');
            writer.writeDir(path);
            dir.forEach(item => packItem(level, path, item));
        }
        else {
            if (item.buffer != null)
                buffer = item.buffer;
            if (buffer != null) {
                path += item.name;
            }
            else {
                throw new Error('jz.zip.pack: This type is not supported.');
            }
            writer.writeFile(path, toBytes(buffer), level);
        }
    }
    // load files with ajax(async).
    function loadFile(item) {
        const dir = item.children || item.dir || item.folder;
        if (dir) {
            dir.forEach(loadFile);
        }
        else if (!item.buffer && item.url) {
            promises.push(load(item.url).then((bytess) => item.buffer = bytess[0]));
        }
    }
    files.forEach(loadFile);
    return Promise.all(promises).then(() => {
        files.forEach(item => packItem(level, '', item));
        writer.writeEnd();
    });
}
export const pack = defun(['files', 'streamFn', 'level', 'shareMemory', 'chunkSize'], _pack);
