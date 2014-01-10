module.exports = (grunt) ->
  grunt.initConfig
    uglify:
      release:
        src: [
          'src/jsziptools.js'
          'src/utils.js'
          'src/algorithms/adler32.js'
          'src/algorithms/crc32.js'
          'src/algorithms/deflate.js'
          'src/algorithms/inflate.js'
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
        src: [
          'src/header.js'
          'vendor/ES6-Promises/dist/promise-0.1.1.min.js'
          'vendor/zlib-asm/zlib.js'
          '_jsziptools.js'
          'src/footer.js'
        ]
        dest: 'jsziptools.js'

    clean:
      release: '_jsziptools.js'

  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-concat'
  grunt.loadNpmTasks 'grunt-contrib-clean'

  grunt.registerTask 'release', ['uglify', 'concat', 'clean']