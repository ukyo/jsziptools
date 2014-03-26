/**
 * @param {ArrayBuffer|Uint8Array|Array|string} buffer
 * @param {number} chunkSize
 * @return {Uint8Array}
 */
algorithms.inflate = defun(['buffer', 'chunkSize'], function(buffer, chunkSize){
    return zlib['rawInflate'](utils.toBytes(buffer), chunkSize);
});

expose('jz.algorithms.inflate', algorithms.inflate);