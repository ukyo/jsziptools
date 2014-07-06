module.exports = (grunt) ->
  grunt.initConfig
    pkg: grunt.file.readJSON 'package.json'
    uglify:
      release:
        src: [
          'src/jsziptools.js'
          'src/utils.js'
          'src/algorithms/adler32.js'
          'src/algorithms/crc32.js'
          'src/algorithms/deflate.js'
          'src/algorithms/inflate.js'
          'src/ZipArchiveWriter.js'
          'src/ZipArchiveReader.js'
          'src/ZipArchiveReaderBlob.js'
          'src/stream/algorithms/deflate.js'
          'src/stream/algorithms/inflate.js'
          'src/stream/zlib.compress.js'
          'src/stream/zlib.decompress.js'
          'src/stream/gz.compress.js'
          'src/stream/gz.decompress.js'
          'src/stream/zip.pack.js'
          'src/zlib.compress.js'
          'src/zlib.decompress.js'
          'src/gz.compress.js'
          'src/gz.decompress.js'
          'src/zip.pack.js'
          'src/zip.unpack.js'
        ]
        dest: '_jsziptools.js'
      zlibBackend:
        src: [
          'src/zlibBackend/emscriptenBackend.js'
        ]
        dest: '_emscriptenBackend.js'

    concat:
      release:
        options:
          banner: """
            /*!
             * jsziptools.js <%= pkg.version %> - MIT License. https://github.com/ukyo/jsziptools/blob/master/LICENSE
             * ES6-Promises - MIT License. https://github.com/jakearchibald/es6-promise/blob/master/LICENSE
             */
            ;(function(){
          """
          footer: '}).call(this);'
        src: [
          'node_modules/es6-promise/dist/promise-1.0.0.min.js'
          '_jsziptools.js'
          'vendor/zlib-asm/zlib.js'
          '_emscriptenBackend.js'
        ]
        dest: 'jsziptools.js'

    clean:
      release: '_jsziptools.js'
      zlibBackend: '_emscriptenBackend.js'
      worker: 'worker.js'

    testem:
      # options:
      #   launch_in_dev: ['Chrome', 'Firefox']
      dev:
        src: [
          'node_modules/es6-promise/dist/promise-1.0.0.js'
          'src/jsziptools.js'
          'src/utils.js'
          'src/algorithms/adler32.js'
          'src/algorithms/crc32.js'
          'src/algorithms/deflate.js'
          'src/algorithms/inflate.js'
          'src/ZipArchiveWriter.js'
          'src/ZipArchiveReader.js'
          'src/ZipArchiveReaderBlob.js'
          'src/stream/algorithms/deflate.js'
          'src/stream/algorithms/inflate.js'
          'src/stream/zlib.compress.js'
          'src/stream/zlib.decompress.js'
          'src/stream/gz.compress.js'
          'src/stream/gz.decompress.js'
          'src/stream/zip.pack.js'
          'src/zlib.compress.js'
          'src/zlib.decompress.js'
          'src/gz.compress.js'
          'src/gz.decompress.js'
          'src/zip.pack.js'
          'src/zip.unpack.js'
          'vendor/zlib-asm/zlib.js'
          'src/zlibBackend/emscriptenBackend.js'
          'test/test.js'
        ]
      release:
        src: [
          'jsziptools.js'
          'test/test.js'
        ]

    worker:
      dev:
        src: [
          'node_modules/es6-promise/dist/promise-1.0.0.js'
          'src/jsziptools.js'
          'src/utils.js'
          'src/algorithms/adler32.js'
          'src/algorithms/crc32.js'
          'src/algorithms/deflate.js'
          'src/algorithms/inflate.js'
          'src/ZipArchiveWriter.js'
          'src/ZipArchiveReader.js'
          'src/ZipArchiveReaderBlob.js'
          'src/stream/algorithms/deflate.js'
          'src/stream/algorithms/inflate.js'
          'src/stream/zlib.compress.js'
          'src/stream/zlib.decompress.js'
          'src/stream/gz.compress.js'
          'src/stream/gz.decompress.js'
          'src/stream/zip.pack.js'
          'src/zlib.compress.js'
          'src/zlib.decompress.js'
          'src/gz.compress.js'
          'src/gz.decompress.js'
          'src/zip.pack.js'
          'src/zip.unpack.js'
          'vendor/zlib-asm/zlib.js'
          'src/zlibBackend/emscriptenBackend.js'
          'test/workerBody.js'
        ]
      release:
        src: [
          'jsziptools.js'
          'test/workerBody.js'
        ]

  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-concat'
  grunt.loadNpmTasks 'grunt-contrib-clean'
  grunt.loadNpmTasks 'grunt-contrib-testem'

  grunt.registerTask 'release', ['uglify', 'concat', 'worker:release', 'testem:ci:release', 'clean']
  grunt.registerTask 'watch', ['worker:dev', 'testem:run:dev']

  grunt.registerMultiTask 'worker', 'create a worker for test', ->
    content = 'importScripts(' + @data.src.map((path) -> "'#{path}'").join(',') + ');'
    grunt.file.write 'worker.js', content
