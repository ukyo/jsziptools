#!/usr/bin/env python

import os
import sys


def main(conf=None):
    tmp_path = "tmp.js"

    COMPILER_PATH = getattr(conf, 'COMPILER_PATH', os.environ['CLOSURE_COMPILER_PATH'])
    REPOSITORY_NAME = getattr(conf, 'REPOSITORY_NAME', 'jsziptools.js')
    REPOSITORY_URL = getattr(conf, 'REPOSITORY_URL', 'http://github.com/ukyo/jsziptools')
    OUTPUT_NAME = getattr(conf, 'OUTPUT_NAME', 'jsziptools.min.js')
    BUILD_PATH = getattr(conf, 'BUILD_PATH', 'build')

    JS_FILES = getattr(conf, 'JS_FILES', (
        "src/jsziptools.js",
        "src/utils.js",
        "src/algorithms/adler32.js",
        "src/algorithms/crc32.js",
        "src/algorithms/deflate.js",
        "src/algorithms/inflate.js",
        "src/zlib.compress.js",
        "src/zlib.decompress.js",
        "src/gz.compress.js",
        "src/gz.decompress.js",
        "src/zip.pack.js",
        "src/zip.unpack.js",
    ))

    os.system("java -jar %s --js %s --js_output_file %s" %
              (COMPILER_PATH, ' '.join(os.path.abspath(file) for file in JS_FILES), tmp_path))
    if not os.path.isdir(BUILD_PATH):
        os.mkdir(BUILD_PATH)
    f = open(BUILD_PATH + '/' + OUTPUT_NAME, "w")
    f.write("// %s %s\n" % (REPOSITORY_NAME, REPOSITORY_URL))
    f.write(open(tmp_path, "r").read())
    f.close()
    os.remove(tmp_path)

if __name__ == "__main__":
    arglen = len(sys.argv)
    if arglen == 2:
        print sys.argv
        main(__import__(sys.argv[1][: -3]))
    elif arglen == 1:
        main()
    else:
        print 'invalid'
