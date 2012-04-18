test('test utility functions', function(){
	equal(jz.utils.arrayBufferToBytes(new ArrayBuffer(10)).constructor, Uint8Array, 'arraybuffer to uint8array');
	equal(jz.utils.arrayBufferToBytes(new Uint8Array(10)).constructor, Uint8Array, 'uint8array to uint8array');
	
	//char codes of 'util'
	var ui8arr = new Uint8Array([117, 116, 105, 108]);
	same(new Uint8Array(jz.utils.stringToArrayBuffer('util')), ui8arr, 'string to arraybuffer');
});

test('test jz.algorithms.deflate, jz.algorithms.inflate', function(){
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

asyncTest('test jz.zlib.compress, jz.zlib.decompress', function(){
	//this file is compressed.
	//http://www.nicovideo.jp/watch/nm12945826
	jz.utils.load('nicowari.swf', function(swf){
		var zlibBytes = new Uint8Array(swf).subarray(8);
		start();
		var decompressed = jz.zlib.decompress(zlibBytes, true);
		ok(decompressed, 'decompress test');
		start();
		var compressed = jz.zlib.compress(decompressed);
		ok(jz.zlib.decompress(compressed, true), 'compress test');
		start();
	});
});

asyncTest('test jz.gz.compress, jz.gz.decompress', function(){
	jz.utils.load(['sample.txt.gz', 'sample.txt'], function(gzFileBuffer, fileBuffer){
		var decompressed = jz.gz.decompress(gzFileBuffer, true);
		same(new Uint8Array(decompressed), new Uint8Array(fileBuffer), 'decompress test');
		start();
		var compressed = jz.gz.compress(fileBuffer, 6, {fname: 'sample.txt'});
		ok(jz.gz.decompress(compressed, true), 'check checksum');
		start();
	});
});

asyncTest('test jz.zip.pack, jz.zip.unpack(sync)', function(){
	var aPath = 'zipsample/a.txt';
	var bPath = 'zipsample/folder/b.txt';
	jz.utils.load(['zipsample.zip', aPath, bPath], function(zipsample, a, b){
		var unpacked = jz.zip.unpack(zipsample);
		var aView = new DataView(a);
		var bView = new DataView(b);
		var aStr = aView.getString(0, a.byteLength);
		var bStr = bView.getString(0, b.byteLength);
		var corrects = [aStr, bStr];
	
		[aPath, bPath].forEach(function(v, i){
			unpacked.getFileAsText(v, function(text){
				equal(text.replace("\r\n", "\n"), corrects[i].replace("\r\n", "\n"), 'test unpack');
				start();
			});
		});
		
		var files = [
			{name: 'zipsample', children: [
				{name: 'a.txt', buffer: a},
				{name: 'folder', children: [
					{name: 'b.txt', buffer: b}
				]}
			]}
		];
		
		var packed = jz.zip.pack({
			files: files,
			level: 6,
			async: false
		});
		
		var fr = new FileReader();
		
		fr.onload = function(e){
			var unpacked = jz.zip.unpack(e.target.result);
			[aPath, bPath].forEach(function(v, i){
				unpacked.getFileAsText(v, function(text){
					equal(text.replace("\r\n", "\n"), corrects[i].replace("\r\n", "\n"), 'test pack');
					start();
				});
			});
		};
		
		var bb = new jz.BlobBuilder();
		bb.append(packed)
		fr.readAsArrayBuffer(bb.getBlob(packed));
	});
	
});

asyncTest('test jz.zip.pack, jz.zip.unpack(async)', function(){
	start();
});
