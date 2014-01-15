/**
 * @param {ArrayBuffer|Uint8Array|Array|string} buffer
 * @param {number} chunkSize
 * @return {Uint8Array}
 */
algorithms.inflate = function(buffer, chunkSize){
    var params = utils.getParams(arguments, ['buffer', 'chunkSize']);
    return zlib['rawInflate'](utils.toBytes(params.buffer), params.chunkSize);
};

expose('jz.algorithms.inflate', algorithms.inflate);