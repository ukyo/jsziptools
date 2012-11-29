#!/usr/bin/env python

import os
import argparse
import json

REPOSITORY_NAME = "jsziptools"
REPOSITORY_URL = "http://github.com/ukyo/jsziptools"
CLOSURE_COMPILER_PATH = os.environ['CLOSURE_COMPILER_PATH']
OUTPUT_PATH = 'build/jsziptools.min.js'
JQUERY_WRAP = ''

parser = argparse.ArgumentParser()

parser.add_argument('-C',
                    metavar='COMPILER_PATH',
                    dest='compiler',
                    help='Set a Closure Compiler path.',
                    default=CLOSURE_COMPILER_PATH)

parser.add_argument('-m',
                    metavar='MODULES',
                    dest='module',
                    nargs='*',
                    help='Set module names you want to use.',
                    default=['zlib', 'gz', 'zip'])

parser.add_argument('-o',
                    metavar='OUTPUT_PATH',
                    dest='output',
                    help='Set a output file path.',
                    default=OUTPUT_PATH)

parser.add_argument('-c',
                    metavar='CONF_FILE_PATH',
                    dest='conf',
                    help='Set a configuration file path.')

parser.add_argument('-j',
                    metavar='JQUERY_WRAP',
                    dest='jquery',
                    help='Add to the jQuery namespace.',
                    default=JQUERY_WRAP)


ALL_FILES = (
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
)

selected_modules = {
    "src/jsziptools.js": True,
    "src/utils.js": True,
    "src/algorithms/adler32.js": False,
    "src/algorithms/crc32.js": False,
    "src/algorithms/deflate.js": False,
    "src/algorithms/inflate.js": False,
    "src/zlib.compress.js": False,
    "src/zlib.decompress.js": False,
    "src/gz.compress.js": False,
    "src/gz.decompress.js": False,
    "src/zip.pack.js": False,
    "src/zip.unpack.js": False
}

require = {}

require['gz'] = [
    "src/algorithms/crc32.js",
    "src/algorithms/deflate.js",
    "src/algorithms/inflate.js",
    "src/gz.compress.js",
    "src/gz.decompress.js"
]

require['gz.compress'] = [
    "src/algorithms/crc32.js",
    "src/algorithms/deflate.js",
    "src/gz.compress.js",
]

require['gz.decompress'] = [
    "src/algorithms/crc32.js",
    "src/algorithms/inflate.js",
    "src/gz.decompress.js"
]

require['zlib'] = [
    "src/algorithms/adler32.js",
    "src/algorithms/deflate.js",
    "src/algorithms/inflate.js",
    "src/zlib.compress.js",
    "src/zlib.decompress.js"
]

require['zlib.compress'] = [
    "src/algorithms/adler32.js",
    "src/algorithms/deflate.js",
    "src/zlib.compress.js"
]

require['zlib.decompress'] = [
    "src/algorithms/adler32.js",
    "src/algorithms/inflate.js",
    "src/zlib.decompress.js"
]

require['zip'] = [
    "src/algorithms/crc32.js",
    "src/algorithms/deflate.js",
    "src/algorithms/inflate.js",
    "src/zip.pack.js",
    "src/zip.unpack.js"
]

require['zip.pack'] = [
    "src/algorithms/crc32.js",
    "src/algorithms/deflate.js",
    "src/zip.pack.js"
]

require['zip.unpack'] = [
    "src/algorithms/crc32.js",
    "src/algorithms/inflate.js",
    "src/zip.unpack.js"
]


def select_modules(modules):
    for module in modules:
        for filename in require[module]:
            selected_modules[filename] = True

    selected = []
    for filename in ALL_FILES:
        if selected_modules[filename]:
            selected.append(filename)

    return selected


def main():
    tmp_file = "tmp.js"

    option = parser.parse_args()

    if option.conf:
        conf = json.load(open(option.conf, 'r'))
        compiler = conf['compiler'] if 'compiler' in conf else CLOSURE_COMPILER_PATH
        output = conf['output'] if 'output' in conf else OUTPUT_PATH
        files = conf['files']
        jquery = conf['jquery'] if 'jquery' in conf else JQUERY_WRAP
    else:
        compiler = option.compiler
        output = option.output
        option.module = [option.module] if type(option.module) == str else option.module
        files = select_modules(option.module)
        jquery = option.jquery

    if jquery:
        command = "java -jar %s --js %s --js_output_file %s --output_wrapper %s" % (compiler, ' '.join(os.path.abspath(file) for file in files), tmp_file, '";(function($){%output%$.extend({'+jquery+':jz})})(jQuery);"')
    else:
        command = "java -jar %s --js %s --js_output_file %s" % (compiler, ' '.join(os.path.abspath(file) for file in files), tmp_file)
    os.system(command)

    directory = '/'.join(os.path.abspath(output).split('/')[:-1])
    if not os.path.isdir(directory):
        os.makedirs(directory)

    f = open(output, "w")
    f.write("// %s %s\n" % (REPOSITORY_NAME, REPOSITORY_URL))
    f.write(open(tmp_file, "r").read())
    f.close()
    os.remove(tmp_file)

if __name__ == "__main__":
    main()
