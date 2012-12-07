/* require
jsziptools.js
utils.js
inflate.js
crc32.js
*/


var mimetypes = (function(){
    var mimefile = "application/andrew-inset\tez\napplication/annodex\tanx\napplication/atom+xml\tatom\napplication/atomcat+xml\tatomcat\napplication/atomserv+xml\tatomsrv\napplication/bbolin\tlin\napplication/cap\tcap pcap\napplication/cu-seeme\tcu\napplication/davmount+xml\tdavmount\napplication/dsptype\ttsp\napplication/ecmascript\tes\napplication/futuresplash\tspl\napplication/hta\thta\napplication/java-archive\tjar\napplication/java-serialized-object\tser\napplication/java-vm\tclass\napplication/javascript\tjs\napplication/json\tjson\napplication/m3g\tm3g\napplication/mac-binhex40\thqx\napplication/mac-compactpro\tcpt\napplication/mathematica\tnb nbp\napplication/msaccess\tmdb\napplication/msword\tdoc dot\napplication/mxf\tmxf\napplication/octet-stream\tbin\napplication/oda\toda\napplication/ogg\togx\napplication/onenote\tone onetoc2 onetmp onepkg\napplication/pdf\tpdf\napplication/pgp-keys\tkey\napplication/pgp-signature\tpgp\napplication/pics-rules\tprf\napplication/postscript\tps ai eps epsi epsf eps2 eps3\napplication/rar\trar\napplication/rdf+xml\trdf\napplication/rss+xml\trss\napplication/rtf\trtf\napplication/sla\tstl\napplication/smil\tsmi smil\napplication/xhtml+xml\txhtml xht\napplication/xml\txml xsl xsd\napplication/xspf+xml\txspf\napplication/zip\tzip\napplication/vnd.android.package-archive\tapk\napplication/vnd.cinderella\tcdy\napplication/vnd.google-earth.kml+xml\tkml\napplication/vnd.google-earth.kmz\tkmz\napplication/vnd.mozilla.xul+xml\txul\napplication/vnd.ms-excel\txls xlb xlt\napplication/vnd.ms-excel.addin.macroEnabled.12\txlam\napplication/vnd.ms-excel.sheet.binary.macroEnabled.12\txlsb\napplication/vnd.ms-excel.sheet.macroEnabled.12\txlsm\napplication/vnd.ms-excel.template.macroEnabled.12\txltm\napplication/vnd.ms-officetheme\tthmx\napplication/vnd.ms-pki.seccat\tcat\napplication/vnd.ms-powerpoint\tppt pps\napplication/vnd.ms-powerpoint.addin.macroEnabled.12\tppam\napplication/vnd.ms-powerpoint.presentation.macroEnabled.12\tpptm\napplication/vnd.ms-powerpoint.slide.macroEnabled.12\tsldm\napplication/vnd.ms-powerpoint.slideshow.macroEnabled.12\tppsm\napplication/vnd.ms-powerpoint.template.macroEnabled.12\tpotm\napplication/vnd.ms-word.document.macroEnabled.12\tdocm\napplication/vnd.ms-word.template.macroEnabled.12\tdotm\napplication/vnd.oasis.opendocument.chart\todc\napplication/vnd.oasis.opendocument.database\todb\napplication/vnd.oasis.opendocument.formula\todf\napplication/vnd.oasis.opendocument.graphics\todg\napplication/vnd.oasis.opendocument.graphics-template\totg\napplication/vnd.oasis.opendocument.image\todi\napplication/vnd.oasis.opendocument.presentation\todp\napplication/vnd.oasis.opendocument.presentation-template\totp\napplication/vnd.oasis.opendocument.spreadsheet\tods\napplication/vnd.oasis.opendocument.spreadsheet-template\tots\napplication/vnd.oasis.opendocument.text\todt\napplication/vnd.oasis.opendocument.text-master\todm\napplication/vnd.oasis.opendocument.text-template\tott\napplication/vnd.oasis.opendocument.text-web\toth\napplication/vnd.openxmlformats-officedocument.presentationml.presentation\tpptx\napplication/vnd.openxmlformats-officedocument.presentationml.slide\tsldx\napplication/vnd.openxmlformats-officedocument.presentationml.slideshow\tppsx\napplication/vnd.openxmlformats-officedocument.presentationml.template\tpotx\napplication/vnd.openxmlformats-officedocument.spreadsheetml.sheet\txlsx\napplication/vnd.openxmlformats-officedocument.spreadsheetml.sheet\txlsx\napplication/vnd.openxmlformats-officedocument.spreadsheetml.template\txltx\napplication/vnd.openxmlformats-officedocument.spreadsheetml.template\txltx\napplication/vnd.openxmlformats-officedocument.wordprocessingml.document\tdocx\napplication/vnd.openxmlformats-officedocument.wordprocessingml.template\tdotx\napplication/vnd.rim.cod\tcod\napplication/vnd.smaf\tmmf\napplication/vnd.stardivision.calc\tsdc\napplication/vnd.stardivision.chart\tsds\napplication/vnd.stardivision.draw\tsda\napplication/vnd.stardivision.impress\tsdd\napplication/vnd.stardivision.math\tsdf\napplication/vnd.stardivision.writer\tsdw\napplication/vnd.stardivision.writer-global\tsgl\napplication/vnd.sun.xml.calc\tsxc\napplication/vnd.sun.xml.calc.template\tstc\napplication/vnd.sun.xml.draw\tsxd\napplication/vnd.sun.xml.draw.template\tstd\napplication/vnd.sun.xml.impress\tsxi\napplication/vnd.sun.xml.impress.template\tsti\napplication/vnd.sun.xml.math\tsxm\napplication/vnd.sun.xml.writer\tsxw\napplication/vnd.sun.xml.writer.global\tsxg\napplication/vnd.sun.xml.writer.template\tstw\napplication/vnd.symbian.install\tsis\napplication/vnd.visio\tvsd\napplication/vnd.wap.wbxml\twbxml\napplication/vnd.wap.wmlc\twmlc\napplication/vnd.wap.wmlscriptc\twmlsc\napplication/vnd.wordperfect\twpd\napplication/vnd.wordperfect5.1\twp5\napplication/x-123\twk\napplication/x-7z-compressed\t7z\napplication/x-abiword\tabw\napplication/x-apple-diskimage\tdmg\napplication/x-bcpio\tbcpio\napplication/x-bittorrent\ttorrent\napplication/x-cab\tcab\napplication/x-cbr\tcbr\napplication/x-cbz\tcbz\napplication/x-cdf\tcdf cda\napplication/x-cdlink\tvcd\napplication/x-chess-pgn\tpgn\napplication/x-comsol\tmph\napplication/x-cpio\tcpio\napplication/x-csh\tcsh\napplication/x-debian-package\tdeb udeb\napplication/x-director\tdcr dir dxr\napplication/x-dms\tdms\napplication/x-doom\twad\napplication/x-dvi\tdvi\napplication/x-font\tpfa pfb gsf pcf pcf.Z\napplication/x-freemind\tmm\napplication/x-futuresplash\tspl\napplication/x-ganttproject\tgan\napplication/x-gnumeric\tgnumeric\napplication/x-go-sgf\tsgf\napplication/x-graphing-calculator\tgcf\napplication/x-gtar\tgtar\napplication/x-gtar-compressed\ttgz taz\napplication/x-hdf\thdf\napplication/x-httpd-eruby\trhtml\napplication/x-httpd-php\tphtml pht php\napplication/x-httpd-php-source\tphps\napplication/x-httpd-php3\tphp3\napplication/x-httpd-php3-preprocessed\tphp3p\napplication/x-httpd-php4\tphp4\napplication/x-httpd-php5\tphp5\napplication/x-ica\tica\napplication/x-info\tinfo\napplication/x-internet-signup\tins isp\napplication/x-iphone\tiii\napplication/x-iso9660-image\tiso\napplication/x-jam\tjam\napplication/x-java-jnlp-file\tjnlp\napplication/x-jmol\tjmz\napplication/x-kchart\tchrt\napplication/x-killustrator\tkil\napplication/x-koan\tskp skd skt skm\napplication/x-kpresenter\tkpr kpt\napplication/x-kspread\tksp\napplication/x-kword\tkwd kwt\napplication/x-latex\tlatex\napplication/x-lha\tlha\napplication/x-lyx\tlyx\napplication/x-lzh\tlzh\napplication/x-lzx\tlzx\napplication/x-maker\tfrm maker frame fm fb book fbdoc\napplication/x-mif\tmif\napplication/x-mpegURL\tm3u8\napplication/x-ms-wmd\twmd\napplication/x-ms-wmz\twmz\napplication/x-msdos-program\tcom exe bat dll\napplication/x-msi\tmsi\napplication/x-netcdf\tnc\napplication/x-ns-proxy-autoconfig\tpac dat\napplication/x-nwc\tnwc\napplication/x-object\to\napplication/x-oz-application\toza\napplication/x-pkcs7-certreqresp\tp7r\napplication/x-pkcs7-crl\tcrl\napplication/x-python-code\tpyc pyo\napplication/x-qgis\tqgs shp shx\napplication/x-quicktimeplayer\tqtl\napplication/x-rdp\trdp\napplication/x-redhat-package-manager\trpm\napplication/x-ruby\trb\napplication/x-scilab\tsci sce\napplication/x-sh\tsh\napplication/x-shar\tshar\napplication/x-shockwave-flash\tswf swfl\napplication/x-silverlight\tscr\napplication/x-sql\tsql\napplication/x-stuffit\tsit sitx\napplication/x-sv4cpio\tsv4cpio\napplication/x-sv4crc\tsv4crc\napplication/x-tar\ttar\napplication/x-tcl\ttcl\napplication/x-tex-gf\tgf\napplication/x-tex-pk\tpk\napplication/x-texinfo\ttexinfo texi\napplication/x-trash\t~ % bak old sik\napplication/x-troff\tt tr roff\napplication/x-troff-man\tman\napplication/x-troff-me\tme\napplication/x-troff-ms\tms\napplication/x-ustar\tustar\napplication/x-wais-source\tsrc\napplication/x-wingz\twz\napplication/x-x509-ca-cert\tcrt\napplication/x-xcf\txcf\napplication/x-xfig\tfig\napplication/x-xpinstall\txpi\naudio/amr\tamr\naudio/amr-wb\tawb\naudio/amr\tamr\naudio/amr-wb\tawb\naudio/annodex\taxa\naudio/basic\tau snd\naudio/csound\tcsd orc sco\naudio/flac\tflac\naudio/midi\tmid midi kar\naudio/mpeg\tmpga mpega mp2 mp3 m4a\naudio/mpegurl\tm3u\naudio/ogg\toga ogg spx\naudio/prs.sid\tsid\naudio/x-aiff\taif aiff aifc\naudio/x-gsm\tgsm\naudio/x-mpegurl\tm3u\naudio/x-ms-wma\twma\naudio/x-ms-wax\twax\naudio/x-pn-realaudio\tra rm ram\naudio/x-realaudio\tra\naudio/x-scpls\tpls\naudio/x-sd2\tsd2\naudio/x-wav\twav\nchemical/x-alchemy\talc\nchemical/x-cache\tcac cache\nchemical/x-cache-csf\tcsf\nchemical/x-cactvs-binary\tcbin cascii ctab\nchemical/x-cdx\tcdx\nchemical/x-cerius\tcer\nchemical/x-chem3d\tc3d\nchemical/x-chemdraw\tchm\nchemical/x-cif\tcif\nchemical/x-cmdf\tcmdf\nchemical/x-cml\tcml\nchemical/x-compass\tcpa\nchemical/x-crossfire\tbsd\nchemical/x-csml\tcsml csm\nchemical/x-ctx\tctx\nchemical/x-cxf\tcxf cef\nchemical/x-embl-dl-nucleotide\temb embl\nchemical/x-galactic-spc\tspc\nchemical/x-gamess-input\tinp gam gamin\nchemical/x-gaussian-checkpoint\tfch fchk\nchemical/x-gaussian-cube\tcub\nchemical/x-gaussian-input\tgau gjc gjf\nchemical/x-gaussian-log\tgal\nchemical/x-gcg8-sequence\tgcg\nchemical/x-genbank\tgen\nchemical/x-hin\thin\nchemical/x-isostar\tistr ist\nchemical/x-jcamp-dx\tjdx dx\nchemical/x-kinemage\tkin\nchemical/x-macmolecule\tmcm\nchemical/x-macromodel-input\tmmd mmod\nchemical/x-mdl-molfile\tmol\nchemical/x-mdl-rdfile\trd\nchemical/x-mdl-rxnfile\trxn\nchemical/x-mdl-sdfile\tsd sdf\nchemical/x-mdl-tgf\ttgf\nchemical/x-mmcif\tmcif\nchemical/x-mol2\tmol2\nchemical/x-molconn-Z\tb\nchemical/x-mopac-graph\tgpt\nchemical/x-mopac-input\tmop mopcrt mpc zmt\nchemical/x-mopac-out\tmoo\nchemical/x-mopac-vib\tmvb\nchemical/x-ncbi-asn1\tasn\nchemical/x-ncbi-asn1-ascii\tprt ent\nchemical/x-ncbi-asn1-binary\tval aso\nchemical/x-ncbi-asn1-spec\tasn\nchemical/x-pdb\tpdb ent\nchemical/x-rosdal\tros\nchemical/x-swissprot\tsw\nchemical/x-vamas-iso14976\tvms\nchemical/x-vmd\tvmd\nchemical/x-xtel\txtel\nchemical/x-xyz\txyz\nimage/gif\tgif\nimage/ief\tief\nimage/jpeg\tjpeg jpg jpe\nimage/pcx\tpcx\nimage/png\tpng\nimage/svg+xml\tsvg svgz\nimage/tiff\ttiff tif\nimage/vnd.djvu\tdjvu djv\nimage/vnd.wap.wbmp\twbmp\nimage/x-canon-cr2\tcr2\nimage/x-canon-crw\tcrw\nimage/x-cmu-raster\tras\nimage/x-coreldraw\tcdr\nimage/x-coreldrawpattern\tpat\nimage/x-coreldrawtemplate\tcdt\nimage/x-corelphotopaint\tcpt\nimage/x-epson-erf\terf\nimage/x-icon\tico\nimage/x-jg\tart\nimage/x-jng\tjng\nimage/x-ms-bmp\tbmp\nimage/x-nikon-nef\tnef\nimage/x-olympus-orf\torf\nimage/x-photoshop\tpsd\nimage/x-portable-anymap\tpnm\nimage/x-portable-bitmap\tpbm\nimage/x-portable-graymap\tpgm\nimage/x-portable-pixmap\tppm\nimage/x-rgb\trgb\nimage/x-xbitmap\txbm\nimage/x-xpixmap\txpm\nimage/x-xwindowdump\txwd\nmessage/rfc822\teml\nmodel/iges\tigs iges\nmodel/mesh\tmsh mesh silo\nmodel/vrml\twrl vrml\nmodel/x3d+vrml\tx3dv\nmodel/x3d+xml\tx3d\nmodel/x3d+binary\tx3db\ntext/cache-manifest\tmanifest\ntext/calendar\tics icz\ntext/css\tcss\ntext/csv\tcsv\ntext/h323\t323\ntext/html\thtml htm shtml\ntext/iuls\tuls\ntext/mathml\tmml\ntext/plain\tasc txt text pot brf\ntext/richtext\trtx\ntext/scriptlet\tsct wsc\ntext/texmacs\ttm\ntext/tab-separated-values\ttsv\ntext/vnd.sun.j2me.app-descriptor\tjad\ntext/vnd.wap.wml\twml\ntext/vnd.wap.wmlscript\twmls\ntext/x-bibtex\tbib\ntext/x-boo\tboo\ntext/x-c++hdr\th++ hpp hxx hh\ntext/x-c++src\tc++ cpp cxx cc\ntext/x-chdr\th\ntext/x-component\thtc\ntext/x-csh\tcsh\ntext/x-csrc\tc\ntext/x-dsrc\td\ntext/x-diff\tdiff patch\ntext/x-haskell\ths\ntext/x-java\tjava\ntext/x-literate-haskell\tlhs\ntext/x-moc\tmoc\ntext/x-pascal\tp pas\ntext/x-pcs-gcd\tgcd\ntext/x-perl\tpl pm\ntext/x-python\tpy\ntext/x-scala\tscala\ntext/x-setext\tetx\ntext/x-sfv\tsfv\ntext/x-sh\tsh\ntext/x-tcl\ttcl tk\ntext/x-tex\ttex ltx sty cls\ntext/x-vcalendar\tvcs\ntext/x-vcard\tvcf\nvideo/3gpp\t3gp\nvideo/annodex\taxv\nvideo/dl\tdl\nvideo/dv\tdif dv\nvideo/fli\tfli\nvideo/gl\tgl\nvideo/mpeg\tmpeg mpg mpe\nvideo/MP2T\tts\nvideo/mp4\tmp4\nvideo/quicktime\tqt mov\nvideo/ogg\togv\nvideo/webm\twebm\nvideo/vnd.mpegurl\tmxu\nvideo/x-flv\tflv\nvideo/x-la-asf\tlsf lsx\nvideo/x-mng\tmng\nvideo/x-ms-asf\tasf asx\nvideo/x-ms-wm\twm\nvideo/x-ms-wmv\twmv\nvideo/x-ms-wmx\twmx\nvideo/x-ms-wvx\twvx\nvideo/x-msvideo\tavi\nvideo/x-sgi-movie\tmovie\nvideo/x-matroska\tmpv mkv\nx-conference/x-cooltalk\tice\nx-epoc/x-sisx-app\tsisx\nx-world/x-vrml\tvrm vrml wrl",
        lines = mimefile.split('\n'),
        defaultdic = {},
        userdic, i, j, n, exts, mime, tmp;

    for(i = 0, n = lines.length; i < n; ++i){
        tmp = lines[i].split('\t');
        mime = tmp[0];
        exts = tmp[1].split(' ');
        for(j = 0; j < exts.length; ++j) defaultdic[exts[j]] = mime;
    }

    userdic = {
        "epub": "application/epub+zip",
        "gz": "application/x-gzip"
    };

    return {
        set: function(ext, mimetype){
            if(typeof ext === 'object') {
                for(var k in ext) if(ext.hasOwnProperty(k)) userdic[k] = ext[k];
                return;
            }
            userdic[ext] = mimetype;
        },
        guess: function(filename){
            var extension = filename.split(".").pop();
            return userdic[extension] || defaultdic[extension] || "aplication/octet-stream";
        }
    };
})();


/**
 * @constructor
 */
function ZipArchiveReader(bytes){
    bytes = utils.toBytes(bytes);

    var signature, header, endCentDirHeader, i, n,
        localFileHeaders = [],
        centralDirHeaders = [],
        files = [],
        folders = [],
        offset = bytes.byteLength - 4,
        view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

    this.buffer = bytes.buffer;

    //check signature
    if (view.getUint32(0, true) !== zip.LOCAL_FILE_SIGNATURE) {
        throw new Error('invalid zip file');
    }

    //read the end central dir header.
    while(true){
        if(view.getUint32(offset, true) === zip.END_SIGNATURE) {
            endCentDirHeader = this._getEndCentDirHeader(offset);
            break;
        }
        offset--;
        if(offset === 0) throw new Error('invalid zip file');
    }

    //read central dir headers.
    offset = endCentDirHeader.startpos;
    for(i = 0, n = endCentDirHeader.direntry; i < n; ++i) {
        header = this._getCentralDirHeader(offset);
        centralDirHeaders.push(header);
        offset += header.allsize;
    }

    //read local file headers.
    for(i = 0; i < n; ++i) {
        offset = centralDirHeaders[i].headerpos;
        header = this._getLocalFileHeader(offset);
        header.crc32 = centralDirHeaders[i].crc32;
        header.compsize = centralDirHeaders[i].compsize;
        header.uncompsize = centralDirHeaders[i].uncompsize;
        localFileHeaders.push(header);
    }
    
    localFileHeaders.forEach(function(header, i){
        // Is the last char '/'.
        (header.filename[header.filename.length - 1] !== 47 ? files : folders).push(header);
    });

    this.files = files;
    this.folders = folders;
    this.localFileHeaders = localFileHeaders;
    this.centralDirHeaders = centralDirHeaders;
};

var p = ZipArchiveReader.prototype;

p._getLocalFileHeader = function(offset){
    var view = new DataView(this.buffer, offset),
        bytes = new Uint8Array(this.buffer, offset),
        ret;

    ret = {
        signature: view.getUint32(0, true),
        needver: view.getUint16(4, true),
        option: view.getUint16(6, true),
        comptype: view.getUint16(8, true),
        filetime: view.getUint16(10, true),
        filedate: view.getUint16(12, true),
        crc32: view.getUint32(14, true),
        compsize: view.getUint32(18, true),
        uncompsize: view.getUint32(22, true),
        fnamelen: view.getUint16(26, true),
        extralen: view.getUint16(28, true),
        headersize: 30 + view.getUint16(26, true) + view.getUint16(28, true),
        allsize: 30 + view.getUint32(18, true) + view.getUint16(26, true) + view.getUint16(28, true)
    };
    ret.filename = bytes.subarray(30, 30 + view.getUint16(26, true));

    return ret;
};

p._getCentralDirHeader = function(offset){
    var view = new DataView(this.buffer, offset);
    return {
        signature: view.getUint32(0, true),
        madever: view.getUint16(4, true),
        needver: view.getUint16(6, true),
        option: view.getUint16(8, true),
        comptype: view.getUint16(10, true),
        filetime: view.getUint16(12, true),
        filedate: view.getUint16(14, true),
        crc32: view.getUint32(16, true),
        compsize: view.getUint32(20, true),
        uncompsize: view.getUint32(24, true),
        fnamelen: view.getUint16(28, true),
        extralen: view.getUint16(30, true),
        commentlen: view.getUint16(32, true),
        disknum: view.getUint16(34, true),
        inattr: view.getUint16(36, true),
        outattr: view.getUint32(38, true),
        headerpos: view.getUint32(42, true),
        allsize: 46 + view.getUint16(28, true) + view.getUint16(30, true) + view.getUint16(32, true)
    };
};

p._getEndCentDirHeader = function(offset){
    var view = new DataView(this.buffer, offset);
    return {
        signature: view.getUint32(0, true),
        disknum: view.getUint16(4, true),
        startdisknum: view.getUint16(6, true),
        diskdirentry: view.getUint16(8, true),
        direntry: view.getUint16(10, true),
        dirsize: view.getUint32(12, true),
        startpos: view.getUint32(16, true),
        commentlen: view.getUint16(20, true)
    };
};

p.getFileNames = function(){
    return this.files.map(function(file){return file.filename;});
};

p._getFileIndex = function(filename){
    for(var i = 0, n = this.localFileHeaders.length; i < n; ++i)
        if(filename === this.localFileHeaders[i].filename) return i;
    throw new Error('File is not found.');
};

p.getFileAsArrayBuffer = function(filename){
    var i = this._getFileIndex(filename),
        offset = this.centralDirHeaders[i].headerpos + this.localFileHeaders[i].headersize,
        len = this.localFileHeaders[i].compsize,
        bytes = new Uint8Array(this.buffer, offset, len);

    if(this.centralDirHeaders[i].comptype === 0) return new Uint8Array(bytes).buffer;
    return algorithms.inflate(bytes);
};

p._getFileAs = function(type, filename, callback){
    var fr = new FileReader(),
        args = [this.getFileAsBlob(filename)].concat(Array.prototype.slice.call(arguments, 3));

    fr.onload = function(e){
        callback.call(fr, e.target.result, e);
    };
    fr['readAs' + type].apply(fr, args);
};

p.getFileAsText = function(filename, encoding, callback){
    if(typeof encoding === 'function') {
        callback = encoding;
        encoding = 'UTF-8';
    }
    this._getFileAs('Text', filename, callback, encoding);
};

p.getFileAsBinaryString = function(filename, callback){
    this._getFileAs('BinaryString', filename, callback);
};

p.getFileAsDataURL = function(filename, callback){
    this._getFileAs('DataURL', filename, callback);
};

p.getFileAsBlob = function(filename, contentType){
    return new Blob([this.getFileAsArrayBuffer(filename)], {type: contentType} || mimetypes.guess(filename));
};

p.getFileAsTextSync = null;
p.getFileAsBinaryStringSync = null;
p.getFileAsDataURLSync = null;

//for worker
if(env.isWorker){
    p.getFileAsTextSync = function(filename, encoding){
        return new FileReaderSync().readAsText(this.getFileAsBlob(filename), encoidng || 'UTF-8');
    };

    p.getFileAsBinaryStringSync = function(filename){
        return new FileReaderSync().readAsBinarySting(this.getFileAsBlob(filename));
    };

    p.getFileAsDataURLSync = function(filename){
        return new FileReaderSync().readAsDataURL(this.getFileAsBlob(filename));
    };
}

exposeProperty('getFileNames', ZipArchiveReader, p.getFileNames);
exposeProperty('getFileAsArrayBuffer', ZipArchiveReader, p.getFileAsArrayBuffer);
exposeProperty('getFileAsText', ZipArchiveReader, p.getFileAsText);
exposeProperty('getFileAsBinaryString', ZipArchiveReader, p.getFileAsBinaryString);
exposeProperty('getFileAsDataURL', ZipArchiveReader, p.getFileAsDataURL);
exposeProperty('getFileAsBlob', ZipArchiveReader, p.getFileAsBlob);
exposeProperty('getFileAsTextSync', ZipArchiveReader, p.getFileAsTextSync);
exposeProperty('getFileAsBinaryStringSync', ZipArchiveReader, p.getFileAsBinaryStringSync);
exposeProperty('getFileAsDataURLSync', ZipArchiveReader, p.getFileAsDataURLSync);


/**
 * unpack a zip file.
 * @param {Object|Uint8Array|Int8Array|Uint8ClampedArray|Array|ArrayBuffer|string} params
 *
 * @example
 * jz.zip.unpack({
 *     buffer: buffer, // zip buffer
 *     encoding: 'UTF-8', // encoding of filenames
 *     complete: function(reader) { // jz.ZipArchiveReader
 *         // ...
 *     },
 *     error: function(err) {}
 * });
 *
 * // or
 *
 * jz.zip.unpack({
 *     buffer: buffer, // zip buffer
 *     encoding: 'UTF-8' // encoding of filenames
 * })
 * .done(function(reader){ })
 * .fail(function(err){ });
 *
 * // or (auto encoding detect.)
 *
 * jz.zip.unpack(buffer)
 * .done(function(reader){ })
 * .fail(function(err){ });
 *
 */
zip.unpack = function(params){
    switch(params.constructor) {
    case Uint8Array:
    case Int8Array:
    case Uint8ClampedArray:
    case Array:
    case String:
    case ArrayBuffer:
        params = {buffer: utils.toBytes(params)};
        break;
    }

    var callbacks = new utils.Callbacks,
        wait = utils.wait,
        waitArr = [],
        reader,
        concatedFilenameBytes;

    setTimeout(function() {
        try {
            //init zip reader.
            reader = new ZipArchiveReader(params.buffer);

            //detect encoding. cp932 or utf-8.
            if(params.encoding == null) {
                concatedFilenameBytes = utils.concatByteArrays(reader.localFileHeaders.map(function(header) {
                    return header.filename;
                }));
                params.encoding = utils.detectEncoding(concatedFilenameBytes);
            }

            //all filenames is convert from bytes to string.
            reader.localFileHeaders.forEach(function(header, i) {
                waitArr[i] = wait.PROCESSING;
                utils.bytesToString(header.filename, params.encoding, function(str) {
                    header.filename = str;
                    waitArr[i] = wait.RESOLVE;
                });
            });

            wait(waitArr).done(function() {
                callbacks.doneCallback(reader);
                if(typeof params.complete === 'function') params.complete(reader);
            });
            
        } catch(err) {
            callbacks.failCallback(err);
            if(typeof params.error === 'function') params.error(err);
        }
    }, 1);

    return callbacks;
};

expose('jz.zip.unpack', zip.unpack);
