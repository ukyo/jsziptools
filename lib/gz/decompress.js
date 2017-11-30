import { defun, concatBytes } from '../common';
import { decompress as streamDecompress } from '../stream/gz';
function _decompress(buffer, chunkSize) {
    const chunks = [];
    streamDecompress({
        buffer,
        streamFn: chunk => chunks.push(chunk),
        chunkSize
    });
    return concatBytes(chunks);
}
export const decompress = defun(['buffer', 'chunkSize'], _decompress);
