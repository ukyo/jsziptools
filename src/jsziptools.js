/**
 * @license Copyright (c) 2012 - Syu Kato <ukyo.web@gmail.com>
 * 
 * jsziptools 1.1
 * 
 * License: MIT
 * 
 * Original codes of deflate.js and inflate.js is written by Masanao Izumo <iz@onicos.co.jp>.
 * http://www.onicos.com/staff/iz/amuse/javascript/expert/deflate.txt
 * http://www.onicos.com/staff/iz/amuse/javascript/expert/inflate.txt
 */

var jz = jz || {};

jz.zip = jz.zip || {};

/** 
 * @const
 * @type {number}
 */
jz.zip.LOCAL_FILE_SIGNATURE = 0x04034B50;

/**
 * @const
 * @type {number}
 */
jz.zip.CENTRAL_DIR_SIGNATURE = 0x02014B50;

/**
 * @const
 * @type {number}
 */
jz.zip.END_SIGNATURE = 0x06054B50;

jz.BlobBuilder = this.MozBlobBuilder || this.WebKitBlobBuilder || this.MSBlobBuilder || this.BlobBuilder;
