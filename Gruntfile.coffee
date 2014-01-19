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

    concat:
      release:
        options:
          banner: """
            /*!
             * jsziptools.js <%= pkg.version %> - MIT License. https://github.com/ukyo/jsziptools/blob/master/LICENSE
             * ES6-Promises - MIT License. https://github.com/jakearchibald/ES6-Promises/blob/master/LICENSE
             */
            ;(function(){
          """
          footer: '}).call(this);'
        src: [
          'vendor/ES6-Promises/dist/promise-0.1.1.min.js'
          'vendor/zlib-asm/zlib.js'
          '_jsziptools.js'
        ]
        dest: 'jsziptools.js'

    clean:
      release: '_jsziptools.js'

    testem:
      # options:
      #   launch_in_dev: ['Chrome', 'Firefox']
      dev:
        src: [
          'vendor/ES6-Promises/dist/promise-0.1.1.min.js'
          'vendor/zlib-asm/zlib.js'
          'src/jsziptools.js'
          'src/utils.js'
          'src/algorithms/adler32.js'
          'src/algorithms/crc32.js'
          'src/algorithms/deflate.js'
          'src/algorithms/inflate.js'
          'src/ZipArchiveWriter.js'
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
          'test/loadWorker.js'
          'test/test.js'
        ]
      release:
        src: [
          'jsziptools.js'
          'test/loadWorkerRelease.js'
          'test/test.js'
        ]

  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-concat'
  grunt.loadNpmTasks 'grunt-contrib-clean'
  grunt.loadNpmTasks 'grunt-contrib-testem'

  grunt.registerTask 'release', ['uglify', 'concat', 'clean', 'testem:ci:release']
  grunt.registerTask 'watch', ['testem:run:dev']