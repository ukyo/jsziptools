//author: @ukyo
//license: GPLv3

var jsziptools = {};

jsziptools.loadFileBuffer = function(url){
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, false);
  //304対策
  xhr.setRequestHeader('If-Modified-Since', '01 Jan 1970 00:00:00 GMT');
  xhr.responseType = 'arraybuffer';
  xhr.send();
  return xhr.response;
};

jsziptools.LOCAL_FILE_SIGNATURE = 0x04034B50;
jsziptools.CENTRAL_DIR_SIGNATURE = 0x02014B50;
jsziptools.END_SIGNATURE = 0x06054B50;