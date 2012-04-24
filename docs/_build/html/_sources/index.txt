.. jsziptools documentation master file, created by
   sphinx-quickstart on Mon Apr 23 03:03:32 2012.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.

JSZIPTOOLS API REFERENCE
========================

`jsziptools <https://github.com/ukyo/jsziptools>`_ のAPIリファレンスです。

jz.algorithms
-------------

`RFC 1951 <http://tools.ietf.org/html/rfc1951>`_ で定義されているdeflateの圧縮、伸張(とデータのチェック)の実装です。
jz.zlib_ , jz.gz_ , jz.zip_ で使用されます。
もちろんこれらの関数を直接使用することもできます( ``indexDB`` , ``webstorage`` に保存するときに有効かもしれません)。

.. note::

   deflateは `zlib <http://www.zlib.net/>`_ を `emscripten <https://github.com/kripken/emscripten>`_
   で変換したものを使用しています。
   inflateは `pdf.js <https://github.com/mozilla/pdf.js>`_ のものを使用しています。

jz.algorithms.adler32
~~~~~~~~~~~~~~~~~~~~~

圧縮前のバイト列からadler32チェックサムを計算します。

.. js:function:: jz.algorithms.adler32(bytes)

   :param ArrayBuffer|Uint8Array|Array bytes: 圧縮前のバイト列
   :returns: number of adler32 checksum

jz.algorithms.crc32
~~~~~~~~~~~~~~~~~~~

圧縮前のバイト列からcrc32チェックサムを計算します。

.. js:function:: jz.algorithms.crc32(bytes)

   :param ArrayBuffer|Uint8Array bytes: 圧縮前のバイト列
   :returns: number of crc32 checksum

jz.algorithms.deflate
~~~~~~~~~~~~~~~~~~~~~

.. js:function:: jz.algorithms.deflate(bytes[, level])

   :param ArrayBuffer|Uint8Array|Array bytes: バイト列
   :param number level: 圧縮レベル。省略した場合はデフォルト値として6が指定されます。範囲は0(無圧縮)〜9まで指定することができます
   :returns: deflate圧縮された結果を ``ArrayBuffer`` として返します

jz.algorithms.inflate
~~~~~~~~~~~~~~~~~~~~~

.. js:function:: jz.algorithms.inflate(bytes)

   :param ArrayBuffer|Uint8Array|Array bytes: deflate圧縮されたバイト列
   :returns: 伸張された結果を ``ArrayBuffer`` として返します

jz.zlib
-------

`RFC 1950 <http://tools.ietf.org/html/rfc1950>`_ で定義されているzlib形式でファイルを圧縮、伸張します。
内部的にzlibを使用しているものはたくさんあるので(swf,pngなど)、けっこう重宝します。

jz.zlib.compress
~~~~~~~~~~~~~~~~

.. js:function:: jz.zlib.compress(bytes[, level])

   :param ArrayBuffer|Uint8Array|Array bytes: バイト列
   :param number level: 圧縮レベル。省略した場合はデフォルト値として6が指定されます。範囲は0(無圧縮)〜9まで指定することができます
   :returns: zlib形式で圧縮された結果を ``ArrayBuffer`` として返します

jz.zlib.decompress
~~~~~~~~~~~~~~~~~~

.. js:function:: jz.zlib.decompress(bytes[, check])

   :param ArrayBuffer|Uint8Array|Array bytes: バイト列
   :param boolean check: trueが指定されている場合、adler32 checksumが正しいかチェックを行います。デフォルト値はfalseです
   :returns: 伸張された結果を ``ArrayBuffer`` として返します

jz.gz
-----

`RFC 1952 <http://tools.ietf.org/html/rfc1952>`_ で定義されているgzip形式のファイルの圧縮、伸張を行います。
クライアントでgzip圧縮をしてサーバの負荷を減らすというのもありかもしれません(処理時間は巨大なファイルでもなければ無視できるレベル)。

.. code-block:: javascript

   var xhr = new XMLHttpRequest;
   xhr.open('POST', '/upload', true);
   
   //gzip圧縮して送信
   xhr.send(jz.gz.compress(buffer, 9));
   
jz.gz.compress
~~~~~~~~~~~~~~

.. js:function:: jz.gz.compress(bytes[, level])

   :param ArrayBuffer|Uint8Array|Array bytes: バイト列
   :param number level: 圧縮レベル。省略した場合はデフォルト値として6が指定されます。範囲は0(無圧縮)〜9まで指定することができます
   :returns: gzip形式で圧縮された結果を ``ArrayBuffer`` として返します


jz.gz.decompress
~~~~~~~~~~~~~~~~

.. js:function:: jz.gz.decompress(bytes[, check])

   :param ArrayBuffer|Uint8Array|Array bytes: バイト列
   :param boolean check: trueが指定されている場合、crc32 checksumが正しいかチェックを行います。デフォルト値はfalseです
   :returns: 伸張された結果を ``ArrayBuffer`` として返します

jz.zip
------

jz.zip.pack
~~~~~~~~~~~

files_ で表現されるディレクトリ構造を同期的、非同期的にzip形式のアーカイブに変換します。

.. js:function:: jz.zip.pack(params)

   :param Object params: params_ を参照
   :returns: 同期的に実行する場合、アーカイブされた結果を ``ArrayBuffer`` として返します

例:

.. code-block:: javascript

   //同期的
   var packedSync = jz.zip.pack({
     files: files,
     level: 8
   });
   
   //非同期的 completeを設定すると非同期になる
   jz.zip.pack({
     files: files,
     level: 8,
     complete: function(packed){
       //なにか処理
     }
   });

Ajaxでファイルを読み込む必要がない場合は、同期的に処理しても問題ないでしょう。
Ajaxで読み込む場合は非同期的に処理することをお勧めします(最近Firefoxあたりで同期読み込みができない)。

params
``````

files
   files_ を参照
level
   圧縮レベル。省略した場合はデフォルト値として6が指定されます。範囲は0(無圧縮)〜9まで指定することができます
complete
   処理が完了したときに呼ばれるコールバック関数。引数には ``ArrayBuffer`` を受け取る。省略した場合は同期的に処理を行う

files
`````

JSON形式でディレクトリ構造を表現します。
各要素はファイル名を表す ``name`` と種類に応じたプロパティを持っています。
ルートは配列です。

str
   文字列をそのままテキストファイルの中身とします
url
   URLから読み込んだデータをファイルの中身とします
buffer
   ``ArrayBuffer`` , ``Uint8Array`` , ``Array`` をバイト列として、それをファイルの中身とします
dir,children,folder
   配列を用いてディレクトリ構造を表現します

さらに、各要素ごとに圧縮レベルを設定することができます。
``level`` というプロパティを作り、0〜9までの圧縮レベルを指定してください。
ここで設定した圧縮レベルは params_ で設定したものより優先的に使用されます。
設定しない場合は、 params_ で設定したものが使用されます。

例:

.. code-block:: javascript

   var files = [
     {name: 'hello.txt', str: 'hello world!'},
     {name: 'dog.png', url: './image/dog.png'},
     {name: 'hoge.wav', buffer: wavbuff, level: 9},
     {name: 'sub', dir: [
       {name: 'subsub', dir: [
         {name: 'fuga.txt', str: 'fuga'}
       ]}
     ]}
   ];

jz.zip.unpack
~~~~~~~~~~~~~

.. js:function:: jz.zip.unpack(buffer)

   :param ArrayBuffer buffer: zip形式のアーカイブ
   :returns: jz.zip.LazyLoader_ インスタンスを返します。

jz.zip.LazyLoader
~~~~~~~~~~~~~~~~~

jz.zip.unpack_ ではいきなり全てを伸張せずに、
遅延ロードするための jz.zip.LazyLoader_ クラスを提供します。
safixにSyncがつくメソッドはworker内だけで有効になります。

.. js:function:: jz.zip.LazyLoader.prototype.getFileNames

   :returns: ルートディレクトリからのフルパスのファイル名の配列を返します

.. js:function:: jz.zip.LazyLoader.prototype.getFileAsArrayBuffer(filename)

   :param string filename: フルパスのファイル名
   :returns: 伸張されたファイルを ``ArrayBuffer`` として返します
    
.. js:function:: jz.zip.LazyLoader.prototype.getFileAsText(filename[, encoding], callback)

   :param string filename: フルパスのファイル名
   :param string encoding: エンコーディング、デフォルト値はUTF-8です。
   :param function callback: 処理が完了したときに呼ばれるコールバック関数。引数には処理結果が文字列として渡されます
   
   
.. js:function:: jz.zip.LazyLoader.prototype.getFileAsBlob(filename)

   :param string filename: フルパスのファイル名
   :returns: 伸張されたファイルを ``Blob`` として返します

.. js:function:: jz.zip.LazyLoader.prototype.getFileAsBinaryString(filename, callback)

   :param string filename: フルパスのファイル名
   :param function callback: 処理が完了したときに呼ばれるコールバック関数。引数には処理結果がバイナリ文字列として渡されます
   
.. js:function:: jz.zip.LazyLoader.prototype.getFileAsDataURL(filename, callback)

   :param string filename: フルパスのファイル名
   :param function callback: 処理が完了したときに呼ばれるコールバック関数。引数には処理結果がデータURLとして渡されます
   
.. js:function:: jz.zip.LazyLoader.prototype.getFileAsTextSync(filename[, encoding])

   :param string filename: フルパスのファイル名
   :param string encoding: エンコーディング、デフォルト値はUTF-8です。
   :returns: 処理結果を文字列として返します
   
.. js:function:: jz.zip.LazyLoader.prototype.getFileAsBinaryStringSync(filename)

   :param string filename: フルパスのファイル名
   :returns: 処理結果をバイナリ文字列として返します
   
.. js:function:: jz.zip.LazyLoader.prototype.getFileAsDataURLSync(filename)

   :param string filename: フルパスのファイル名
   :returns: 処理結果をデータURLとして返します

例:

.. code-block:: javascript

   //zipファイルの作成
   var packed = jz.zip.pack({
     files: [
       {name: 'hello.txt', str: 'hello!'},
       {name: 'sub', dir: [
         {name: 'hoge.png', buffer: pngbuff}
       ]}
     ]
   });
   
   var loader = jz.zip.unpack(packed);
   //ファイル一覧を表示
   console.log(loader.getFileNames());
   //hello.txtの中身を表示
   loader.getFileAsText('hello.txt', console.log);
   //hoge.pngの表示
   loader.getFileAsDataURL('sub/hoge.png', function(dataurl){
     var image = document.getElementById("image");
     image.src = dataurl;
   });
   
jz.utils
--------

jz.utils.toBytes
~~~~~~~~~~~~~~~~

``ArrayBuffer`` , ``Array`` , ``String`` を ``Uint8Array`` に変換します。
引数のタイプがUint8Arrayの場合はそのまま返します(コピーされない)。

.. js:function:: jz.utils.toBytes(buffer)

   :param ArrayBuffer|Uint8Array|Array buffer:
   :returns: Uint8Array

jz.utils.stringToArrayBuffer
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

文字列をUTF8として ``ArrayBuffer`` に変換します。もちろん日本語も変換できます。

.. js:function:: jz.utils.stringToArrayBuffer(str)

   :param string str:
   :returns: 変換された結果をArrayBufferとして返します。

jz.utils.loadSync
~~~~~~~~~~~~~~~~~

Ajaxで同期的にバイナリファイルを読み込みます。
本当は非推奨なんですが。

.. js:function:: jz.utils.loadSync(url)

   :param string url: 読み込むファイルのURL
   :returns: 読み込まれたファイルをArrayBufferとして返します

jz.utils.load
~~~~~~~~~~~~~

Ajaxで非同期的にバイナリファイルを読み込みます。複数ファイルの指定が可能です

.. js:function:: jz.utils.load(url, complete)

   :param string|Array.<string> urls: 読み込むファイルのURL
   :param function(...ArrayBuffer) complete: 読み込み完了時に呼ばれるコールバック関数
   :returns: 読み込まれたファイルをArrayBufferとして返します

例:

.. code-block:: javascript

   jz.utils.load(['hello.txt', 'hoge.txt'], function(hello, hoge){
     //何か処理
   });

jz.utils.concatByteArrays
~~~~~~~~~~~~~~~~~~~~~~~~~

複数のバイト列を一つのバイト列にまとめます。
ネイティブのAPIを使っているので高速です(多分)。

.. js:function:: jz.utils.concatByteArrays(byteArrays)

   :param ...Uint8Array byteArrays: 可変引数か配列でバイト列を与えます
   :return: 連結された結果をUint8Arrayとして返します

例:

.. code-block:: javascript

   //上と下は同じ意味
   var concated = jz.utils.concatByteArrays([bytes1, bytes2, bytes3]);
   var concated = jz.utils.concatByteArrays(bytes1, bytes2, bytes3);