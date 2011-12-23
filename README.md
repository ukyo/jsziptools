# Example

zip:

    var b = jsziptools.zip([
      {name: "foo", childern: [ //folder
        {name: "hello.txt", str: "Hello World!"}, //string
        {name: "bar.js", url: "../src/bar.js"} //xhr
      ]}
    ]);
    //download a zip file
    location.href = b;

unzip:

    //if arg is string, load with xhr.
    var loader = jsziptools.unzip("foo.zip");
    //get file pathes.
    loader.getFileNames();
    //file is read lazy.
    loader.getFileAsText(loader.getFileNames[0], function(result){
      alert(result);
    });

support chrome, firefox.