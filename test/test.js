test('test utility functions', function(){
	equal(jz.utils.arrayBufferToBytes(new ArrayBuffer(10)).constructor, Uint8Array, 'arraybuffer to uint8array');
	equal(jz.utils.arrayBufferToBytes(new Uint8Array(10)).constructor, Uint8Array, 'uint8array to uint8array');
	
	//char codes of 'util'
	var ui8arr = new Uint8Array([117, 116, 105, 108]);
	same(new Uint8Array(jz.utils.stringToArrayBuffer('util')), ui8arr, 'string to arraybuffer');
	equal(jz.utils.readString(ui8arr, 0, 4), 'util', 'read string');
	
	ui8arr = new Uint8Array([1, 2, 4, 8]);
	equal(jz.utils.readUintLE(ui8arr, 0), 0x08040201, 'read uint(little endian)');
	equal(jz.utils.readUintBE(ui8arr, 0), 0x01020408, 'read uint(big endian)');
	equal(jz.utils.readUshortLE(ui8arr, 0), 0x0201, 'read ushort(little endian)');
	equal(jz.utils.readUshortBE(ui8arr, 0), 0x0102, 'read ushort(big endian)');
});

test('test compress algorithm', function(){
	var arr = [1, 1, 1, 1];
	var ui8arr = new Uint8Array(arr);
	
	var compressed = jz.algorithms.deflate(ui8arr);
	ok(compressed, 'compress with deflate');
	
	var decompressed = jz.algorithms.inflate(compressed);
	ok(decompressed, 'decompress with inflate');
	
	ui8arr = new Uint8Array(decompressed);
	var arr2 = [];
	for(var i = 0; i < ui8arr.length; ++i) arr2.push(ui8arr[i]);
	same(arr, arr2, 'diff arr arr2');
	same(new Uint8Array(arr), ui8arr, 'hoge');
});

test('test gzip', function(){
	var gzFileBuffer = jz.utils.loadFileBuffer('sample.txt.gz');
	var fileBuffer = jz.utils.loadFileBuffer('sample.txt');
	
	var decompressed = jz.gz.decompress(gzFileBuffer, true);
	same(new Uint8Array(decompressed.buffer), new Uint8Array(fileBuffer), 'decompress test');
	
	var compressed = jz.gz.compress(fileBuffer, 6, {fname: 'sample.txt'});
	
	var checksum1 = jz.utils.readUintLE(gzFileBuffer, gzFileBuffer.byteLength - 8);
	var checksum2 = jz.utils.readUintLE(compressed, compressed.byteLength - 8);
	equal(checksum1, checksum2, 'check checksum');
	
	var data1 = new Uint8Array(gzFileBuffer).subarray(20);
	var data2 = new Uint8Array(compressed).subarray(20);
	same(data1, data2, 'check compressed data');
});

test('test zlib', function(){
	//this file is compressed.
	//http://www.nicovideo.jp/watch/nm12945826
	var swf = jz.utils.loadFileBuffer('nicowari.swf');
	var zlibBytes = new Uint8Array(swf).subarray(8);
	//decompressed file size
	var size = jz.utils.readUintLE(swf, 4);
	
	var decompressed = jz.zlib.decompress(zlibBytes, true);
	equal(decompressed.byteLength + 8, size, 'decompress test');
	
	var compressed = new Uint8Array(jz.zlib.compress(decompressed));
	same(new Uint8Array(decompressed), new Uint8Array(jz.zlib.decompress(compressed)), 'compress test');
});

asyncTest('test zip', function(){
	var load = jz.utils.loadFileBuffer;
	var zipsample = load('zipsample.zip');
	
	var unpacked = jz.zip.unpack(zipsample);
	var a = load('zipsample/a.txt');
	var b = load('zipsample/folder/b.txt');
	var aStr = jz.utils.readString(a, 0, a.byteLength);
	var bStr = jz.utils.readString(b, 0, b.byteLength);
	var corrects = [aStr, bStr];

	["zipsample/a.txt", "zipsample/folder/b.txt"].forEach(function(v, i){
		unpacked.getFileAsText(v, function(text){
			equal(text.replace("\r\n", "\n"), corrects[i].replace("\r\n", "\n"), 'test unpack');
			start();
		});
	});
	
	var packed = jz.zip.pack([
		{name: 'zipsample', children: [
			{name: 'a.txt', buffer: a},
			{name: 'folder', children: [
				{name: 'b.txt', buffer: b}
			]}
		]}
	]);
	
	var fr = new FileReader();
	
	fr.onload = function(e){
		var unpacked = jz.zip.unpack(e.target.result);
		["zipsample/a.txt", "zipsample/folder/b.txt"].forEach(function(v, i){
			unpacked.getFileAsText(v, function(text){
				equal(text, corrects[i], 'test pack');
				start();
			});
		});
	};
	
	var bb = new jz.BlobBuilder();
	bb.append(packed)
	fr.readAsArrayBuffer(bb.getBlob(packed));
});
