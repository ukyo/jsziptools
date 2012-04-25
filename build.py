#!/usr/bin/env python

import os
import sys
from buildconf import *

def main(compiler_path):
    tmp_path = "tmp.js"
    
    try:
        build_path = BUILD_PATH if BUILD_PATH[-1] == "/" else BUILD_PATH + "/"
    except:
        build_path = ""
    
    os.system("java -jar %s --js %s --js_output_file %s" %
              (compiler_path, ' '.join(os.path.abspath(file) for file in JS_FILES), tmp_path))
    if not os.path.isdir(BUILD_PATH): os.mkdir(BUILD_PATH)
    f = open(build_path + OUTPUT_NAME, "w")
    f.write("// %s %s\n" % (REPOSITORY_NAME, REPOSITORY_URL))
    f.write(open(tmp_path, "r").read())
    f.close()
    os.remove(tmp_path)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        main(sys.argv[1])
    else:
        try:
            compiler_path = COMPILER_PATH
        except:
            compiler_path = os.environ['CLOSURE_COMPILER_PATH']
        main(compiler_path)