jz.algorithms = jz.algorithms || {};

(function(jz){

jz.algorithms.deflate = function(bytes, level){
	bytes = jz.utils.arrayBufferToBytes(bytes);
	var hoge = String.fromCharCode.apply(null, bytes),
		str = zpipe.deflate(String.fromCharCode.apply(null, bytes)),
		arr = new Uint8Array(str.length - 6),
		i, n;
	for(i = 0, n = arr.length; i < n; ++i) {
		arr[i] = str.charCodeAt(i + 2) & 0xff;
	}
	return arr.buffer;
};

})(jz);
