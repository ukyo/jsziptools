#!/bin/sh
#minify with Closure Compiler.
#http://code.google.com/p/closure-compiler/
java -jar compiler.jar\
  --js=src/jsziptools.js\
  --js=src/utils.js\
  --js=src/algorithms/adler32.js\
  --js=src/algorithms/crc32.js\
  --js=src/algorithms/deflate.js\
  --js=src/algorithms/inflate.js\
  --js=src/zlib.js\
  --js=src/gz.js\
  --js=src/zip.js\
  --js=src/unzip.js\
  --js_output_file=build/jsziptools.min.js
