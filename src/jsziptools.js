/**
 * Copyright (c) 2012 - Syu Kato <ukyo.web@gmail.com>
 * 
 * jsziptools 2.0.3
 * 
 * License: MIT
 * https://github.com/ukyo/jsziptools/LICENSE
 */

var jz = jz || {};

jz.utils = jz.utils || {};
jz.algorithms = jz.algorithms || {};
jz.zlib = jz.zlib || {};
jz.gz = jz.gz || {};
jz.zip = jz.zip || {};
jz.zip.LOCAL_FILE_SIGNATURE = 0x04034B50;
jz.zip.CENTRAL_DIR_SIGNATURE = 0x02014B50;
jz.zip.END_SIGNATURE = 0x06054B50;
jz.BlobBuilder = this.MozBlobBuilder || this.WebKitBlobBuilder || this.MSBlobBuilder || this.BlobBuilder;
jz.env = jz.env || {};
jz.env.isWorker = typeof importScripts === 'function';