import { concatBytes, defun } from '../common';
import { compress as streamCompress } from '../stream/gz';
function _compress(buffer, level, chunkSize, fname, fcomment) {
    const chunks = [];
    streamCompress({
        buffer,
        level,
        chunkSize,
        fname,
        fcomment,
        streamFn: chunk => chunks.push(chunk)
    });
    return concatBytes(chunks);
}
export const compress = defun(['buffer', 'level', 'chunkSize', 'fname', 'fcomment'], _compress);
