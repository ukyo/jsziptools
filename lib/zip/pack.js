import { concatBytes, defun } from '../common';
import { pack as streamPack } from '../stream/zip';
function _pack(files, level, chunkSize) {
    let chunks = [];
    return streamPack({
        files,
        level,
        chunkSize,
        shareMemory: false,
        streamFn: chunk => chunks.push(chunk),
    })
        .then(() => concatBytes(chunks));
}
export const pack = defun(['files', 'level', 'chunkSize'], _pack);
