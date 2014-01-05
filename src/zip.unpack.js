/* require
jsziptools.js
utils.js
inflate.js
crc32.js
*/


var mimetypes = (function(){
    var mimefile = "application/epub+zip\tepub\napplication/x-gzip\tgz\napplication/andrew-inset\tez\napplication/annodex\tanx\napplication/atom+xml\tatom\napplication/atomcat+xml\tatomcat\napplication/atomserv+xml\tatomsrv\napplication/bbolin\tlin\napplication/cap\tcap pcap\napplication/cu-seeme\tcu\napplication/davmount+xml\tdavmount\napplication/dsptype\ttsp\napplication/ecmascript\tes\napplication/futuresplash\tspl\napplication/hta\thta\napplication/java-archive\tjar\napplication/java-serialized-object\tser\napplication/java-vm\tclass\napplication/javascript\tjs\napplication/json\tjson\napplication/m3g\tm3g\napplication/mac-binhex40\thqx\napplication/mac-compactpro\tcpt\napplication/mathematica\tnb nbp\napplication/msaccess\tmdb\napplication/msword\tdoc dot\napplication/mxf\tmxf\napplication/octet-stream\tbin\napplication/oda\toda\napplication/ogg\togx\napplication/onenote\tone onetoc2 onetmp onepkg\napplication/pdf\tpdf\napplication/pgp-keys\tkey\napplication/pgp-signature\tpgp\napplication/pics-rules\tprf\napplication/postscript\tps ai eps epsi epsf eps2 eps3\napplication/rar\trar\napplication/rdf+xml\trdf\napplication/rss+xml\trss\napplication/rtf\trtf\napplication/sla\tstl\napplication/smil\tsmi smil\napplication/xhtml+xml\txhtml xht\napplication/xml\txml xsl xsd\napplication/xspf+xml\txspf\napplication/zip\tzip\napplication/vnd.android.package-archive\tapk\napplication/vnd.cinderella\tcdy\napplication/vnd.google-earth.kml+xml\tkml\napplication/vnd.google-earth.kmz\tkmz\napplication/vnd.mozilla.xul+xml\txul\napplication/vnd.ms-excel\txls xlb xlt\napplication/vnd.ms-excel.addin.macroEnabled.12\txlam\napplication/vnd.ms-excel.sheet.binary.macroEnabled.12\txlsb\napplication/vnd.ms-excel.sheet.macroEnabled.12\txlsm\napplication/vnd.ms-excel.template.macroEnabled.12\txltm\napplication/vnd.ms-officetheme\tthmx\napplication/vnd.ms-pki.seccat\tcat\napplication/vnd.ms-powerpoint\tppt pps\napplication/vnd.ms-powerpoint.addin.macroEnabled.12\tppam\napplication/vnd.ms-powerpoint.presentation.macroEnabled.12\tpptm\napplication/vnd.ms-powerpoint.slide.macroEnabled.12\tsldm\napplication/vnd.ms-powerpoint.slideshow.macroEnabled.12\tppsm\napplication/vnd.ms-powerpoint.template.macroEnabled.12\tpotm\napplication/vnd.ms-word.document.macroEnabled.12\tdocm\napplication/vnd.ms-word.template.macroEnabled.12\tdotm\napplication/vnd.oasis.opendocument.chart\todc\napplication/vnd.oasis.opendocument.database\todb\napplication/vnd.oasis.opendocument.formula\todf\napplication/vnd.oasis.opendocument.graphics\todg\napplication/vnd.oasis.opendocument.graphics-template\totg\napplication/vnd.oasis.opendocument.image\todi\napplication/vnd.oasis.opendocument.presentation\todp\napplication/vnd.oasis.opendocument.presentation-template\totp\napplication/vnd.oasis.opendocument.spreadsheet\tods\napplication/vnd.oasis.opendocument.spreadsheet-template\tots\napplication/vnd.oasis.opendocument.text\todt\napplication/vnd.oasis.opendocument.text-master\todm\napplication/vnd.oasis.opendocument.text-template\tott\napplication/vnd.oasis.opendocument.text-web\toth\napplication/vnd.openxmlformats-officedocument.presentationml.presentation\tpptx\napplication/vnd.openxmlformats-officedocument.presentationml.slide\tsldx\napplication/vnd.openxmlformats-officedocument.presentationml.slideshow\tppsx\napplication/vnd.openxmlformats-officedocument.presentationml.template\tpotx\napplication/vnd.openxmlformats-officedocument.spreadsheetml.sheet\txlsx\napplication/vnd.openxmlformats-officedocument.spreadsheetml.sheet\txlsx\napplication/vnd.openxmlformats-officedocument.spreadsheetml.template\txltx\napplication/vnd.openxmlformats-officedocument.spreadsheetml.template\txltx\napplication/vnd.openxmlformats-officedocument.wordprocessingml.document\tdocx\napplication/vnd.openxmlformats-officedocument.wordprocessingml.template\tdotx\napplication/vnd.rim.cod\tcod\napplication/vnd.smaf\tmmf\napplication/vnd.stardivision.calc\tsdc\napplication/vnd.stardivision.chart\tsds\napplication/vnd.stardivision.draw\tsda\napplication/vnd.stardivision.impress\tsdd\napplication/vnd.stardivision.math\tsdf\napplication/vnd.stardivision.writer\tsdw\napplication/vnd.stardivision.writer-global\tsgl\napplication/vnd.sun.xml.calc\tsxc\napplication/vnd.sun.xml.calc.template\tstc\napplication/vnd.sun.xml.draw\tsxd\napplication/vnd.sun.xml.draw.template\tstd\napplication/vnd.sun.xml.impress\tsxi\napplication/vnd.sun.xml.impress.template\tsti\napplication/vnd.sun.xml.math\tsxm\napplication/vnd.sun.xml.writer\tsxw\napplication/vnd.sun.xml.writer.global\tsxg\napplication/vnd.sun.xml.writer.template\tstw\napplication/vnd.symbian.install\tsis\napplication/vnd.visio\tvsd\napplication/vnd.wap.wbxml\twbxml\napplication/vnd.wap.wmlc\twmlc\napplication/vnd.wap.wmlscriptc\twmlsc\napplication/vnd.wordperfect\twpd\napplication/vnd.wordperfect5.1\twp5\napplication/x-123\twk\napplication/x-7z-compressed\t7z\napplication/x-abiword\tabw\napplication/x-apple-diskimage\tdmg\napplication/x-bcpio\tbcpio\napplication/x-bittorrent\ttorrent\napplication/x-cab\tcab\napplication/x-cbr\tcbr\napplication/x-cbz\tcbz\napplication/x-cdf\tcdf cda\napplication/x-cdlink\tvcd\napplication/x-chess-pgn\tpgn\napplication/x-comsol\tmph\napplication/x-cpio\tcpio\napplication/x-csh\tcsh\napplication/x-debian-package\tdeb udeb\napplication/x-director\tdcr dir dxr\napplication/x-dms\tdms\napplication/x-doom\twad\napplication/x-dvi\tdvi\napplication/x-font\tpfa pfb gsf pcf pcf.Z\napplication/x-freemind\tmm\napplication/x-futuresplash\tspl\napplication/x-ganttproject\tgan\napplication/x-gnumeric\tgnumeric\napplication/x-go-sgf\tsgf\napplication/x-graphing-calculator\tgcf\napplication/x-gtar\tgtar\napplication/x-gtar-compressed\ttgz taz\napplication/x-hdf\thdf\napplication/x-httpd-eruby\trhtml\napplication/x-httpd-php\tphtml pht php\napplication/x-httpd-php-source\tphps\napplication/x-httpd-php3\tphp3\napplication/x-httpd-php3-preprocessed\tphp3p\napplication/x-httpd-php4\tphp4\napplication/x-httpd-php5\tphp5\napplication/x-ica\tica\napplication/x-info\tinfo\napplication/x-internet-signup\tins isp\napplication/x-iphone\tiii\napplication/x-iso9660-image\tiso\napplication/x-jam\tjam\napplication/x-java-jnlp-file\tjnlp\napplication/x-jmol\tjmz\napplication/x-kchart\tchrt\napplication/x-killustrator\tkil\napplication/x-koan\tskp skd skt skm\napplication/x-kpresenter\tkpr kpt\napplication/x-kspread\tksp\napplication/x-kword\tkwd kwt\napplication/x-latex\tlatex\napplication/x-lha\tlha\napplication/x-lyx\tlyx\napplication/x-lzh\tlzh\napplication/x-lzx\tlzx\napplication/x-maker\tfrm maker frame fm fb book fbdoc\napplication/x-mif\tmif\napplication/x-mpegURL\tm3u8\napplication/x-ms-wmd\twmd\napplication/x-ms-wmz\twmz\napplication/x-msdos-program\tcom exe bat dll\napplication/x-msi\tmsi\napplication/x-netcdf\tnc\napplication/x-ns-proxy-autoconfig\tpac dat\napplication/x-nwc\tnwc\napplication/x-object\to\napplication/x-oz-application\toza\napplication/x-pkcs7-certreqresp\tp7r\napplication/x-pkcs7-crl\tcrl\napplication/x-python-code\tpyc pyo\napplication/x-qgis\tqgs shp shx\napplication/x-quicktimeplayer\tqtl\napplication/x-rdp\trdp\napplication/x-redhat-package-manager\trpm\napplication/x-ruby\trb\napplication/x-scilab\tsci sce\napplication/x-sh\tsh\napplication/x-shar\tshar\napplication/x-shockwave-flash\tswf swfl\napplication/x-silverlight\tscr\napplication/x-sql\tsql\napplication/x-stuffit\tsit sitx\napplication/x-sv4cpio\tsv4cpio\napplication/x-sv4crc\tsv4crc\napplication/x-tar\ttar\napplication/x-tcl\ttcl\napplication/x-tex-gf\tgf\napplication/x-tex-pk\tpk\napplication/x-texinfo\ttexinfo texi\napplication/x-trash\t~ % bak old sik\napplication/x-troff\tt tr roff\napplication/x-troff-man\tman\napplication/x-troff-me\tme\napplication/x-troff-ms\tms\napplication/x-ustar\tustar\napplication/x-wais-source\tsrc\napplication/x-wingz\twz\napplication/x-x509-ca-cert\tcrt\napplication/x-xcf\txcf\napplication/x-xfig\tfig\napplication/x-xpinstall\txpi\naudio/amr\tamr\naudio/amr-wb\tawb\naudio/amr\tamr\naudio/amr-wb\tawb\naudio/annodex\taxa\naudio/basic\tau snd\naudio/csound\tcsd orc sco\naudio/flac\tflac\naudio/midi\tmid midi kar\naudio/mpeg\tmpga mpega mp2 mp3 m4a\naudio/mpegurl\tm3u\naudio/ogg\toga ogg spx\naudio/prs.sid\tsid\naudio/x-aiff\taif aiff aifc\naudio/x-gsm\tgsm\naudio/x-mpegurl\tm3u\naudio/x-ms-wma\twma\naudio/x-ms-wax\twax\naudio/x-pn-realaudio\tra rm ram\naudio/x-realaudio\tra\naudio/x-scpls\tpls\naudio/x-sd2\tsd2\naudio/x-wav\twav\nchemical/x-alchemy\talc\nchemical/x-cache\tcac cache\nchemical/x-cache-csf\tcsf\nchemical/x-cactvs-binary\tcbin cascii ctab\nchemical/x-cdx\tcdx\nchemical/x-cerius\tcer\nchemical/x-chem3d\tc3d\nchemical/x-chemdraw\tchm\nchemical/x-cif\tcif\nchemical/x-cmdf\tcmdf\nchemical/x-cml\tcml\nchemical/x-compass\tcpa\nchemical/x-crossfire\tbsd\nchemical/x-csml\tcsml csm\nchemical/x-ctx\tctx\nchemical/x-cxf\tcxf cef\nchemical/x-embl-dl-nucleotide\temb embl\nchemical/x-galactic-spc\tspc\nchemical/x-gamess-input\tinp gam gamin\nchemical/x-gaussian-checkpoint\tfch fchk\nchemical/x-gaussian-cube\tcub\nchemical/x-gaussian-input\tgau gjc gjf\nchemical/x-gaussian-log\tgal\nchemical/x-gcg8-sequence\tgcg\nchemical/x-genbank\tgen\nchemical/x-hin\thin\nchemical/x-isostar\tistr ist\nchemical/x-jcamp-dx\tjdx dx\nchemical/x-kinemage\tkin\nchemical/x-macmolecule\tmcm\nchemical/x-macromodel-input\tmmd mmod\nchemical/x-mdl-molfile\tmol\nchemical/x-mdl-rdfile\trd\nchemical/x-mdl-rxnfile\trxn\nchemical/x-mdl-sdfile\tsd sdf\nchemical/x-mdl-tgf\ttgf\nchemical/x-mmcif\tmcif\nchemical/x-mol2\tmol2\nchemical/x-molconn-Z\tb\nchemical/x-mopac-graph\tgpt\nchemical/x-mopac-input\tmop mopcrt mpc zmt\nchemical/x-mopac-out\tmoo\nchemical/x-mopac-vib\tmvb\nchemical/x-ncbi-asn1\tasn\nchemical/x-ncbi-asn1-ascii\tprt ent\nchemical/x-ncbi-asn1-binary\tval aso\nchemical/x-ncbi-asn1-spec\tasn\nchemical/x-pdb\tpdb ent\nchemical/x-rosdal\tros\nchemical/x-swissprot\tsw\nchemical/x-vamas-iso14976\tvms\nchemical/x-vmd\tvmd\nchemical/x-xtel\txtel\nchemical/x-xyz\txyz\nimage/gif\tgif\nimage/ief\tief\nimage/jpeg\tjpeg jpg jpe\nimage/pcx\tpcx\nimage/png\tpng\nimage/svg+xml\tsvg svgz\nimage/tiff\ttiff tif\nimage/vnd.djvu\tdjvu djv\nimage/vnd.wap.wbmp\twbmp\nimage/x-canon-cr2\tcr2\nimage/x-canon-crw\tcrw\nimage/x-cmu-raster\tras\nimage/x-coreldraw\tcdr\nimage/x-coreldrawpattern\tpat\nimage/x-coreldrawtemplate\tcdt\nimage/x-corelphotopaint\tcpt\nimage/x-epson-erf\terf\nimage/x-icon\tico\nimage/x-jg\tart\nimage/x-jng\tjng\nimage/x-ms-bmp\tbmp\nimage/x-nikon-nef\tnef\nimage/x-olympus-orf\torf\nimage/x-photoshop\tpsd\nimage/x-portable-anymap\tpnm\nimage/x-portable-bitmap\tpbm\nimage/x-portable-graymap\tpgm\nimage/x-portable-pixmap\tppm\nimage/x-rgb\trgb\nimage/x-xbitmap\txbm\nimage/x-xpixmap\txpm\nimage/x-xwindowdump\txwd\nmessage/rfc822\teml\nmodel/iges\tigs iges\nmodel/mesh\tmsh mesh silo\nmodel/vrml\twrl vrml\nmodel/x3d+vrml\tx3dv\nmodel/x3d+xml\tx3d\nmodel/x3d+binary\tx3db\ntext/cache-manifest\tmanifest\ntext/calendar\tics icz\ntext/css\tcss\ntext/csv\tcsv\ntext/h323\t323\ntext/html\thtml htm shtml\ntext/iuls\tuls\ntext/mathml\tmml\ntext/plain\tasc txt text pot brf\ntext/richtext\trtx\ntext/scriptlet\tsct wsc\ntext/texmacs\ttm\ntext/tab-separated-values\ttsv\ntext/vnd.sun.j2me.app-descriptor\tjad\ntext/vnd.wap.wml\twml\ntext/vnd.wap.wmlscript\twmls\ntext/x-bibtex\tbib\ntext/x-boo\tboo\ntext/x-c++hdr\th++ hpp hxx hh\ntext/x-c++src\tc++ cpp cxx cc\ntext/x-chdr\th\ntext/x-component\thtc\ntext/x-csh\tcsh\ntext/x-csrc\tc\ntext/x-dsrc\td\ntext/x-diff\tdiff patch\ntext/x-haskell\ths\ntext/x-java\tjava\ntext/x-literate-haskell\tlhs\ntext/x-moc\tmoc\ntext/x-pascal\tp pas\ntext/x-pcs-gcd\tgcd\ntext/x-perl\tpl pm\ntext/x-python\tpy\ntext/x-scala\tscala\ntext/x-setext\tetx\ntext/x-sfv\tsfv\ntext/x-sh\tsh\ntext/x-tcl\ttcl tk\ntext/x-tex\ttex ltx sty cls\ntext/x-vcalendar\tvcs\ntext/x-vcard\tvcf\nvideo/3gpp\t3gp\nvideo/annodex\taxv\nvideo/dl\tdl\nvideo/dv\tdif dv\nvideo/fli\tfli\nvideo/gl\tgl\nvideo/mpeg\tmpeg mpg mpe\nvideo/MP2T\tts\nvideo/mp4\tmp4\nvideo/quicktime\tqt mov\nvideo/ogg\togv\nvideo/webm\twebm\nvideo/vnd.mpegurl\tmxu\nvideo/x-flv\tflv\nvideo/x-la-asf\tlsf lsx\nvideo/x-mng\tmng\nvideo/x-ms-asf\tasf asx\nvideo/x-ms-wm\twm\nvideo/x-ms-wmv\twmv\nvideo/x-ms-wmx\twmx\nvideo/x-ms-wvx\twvx\nvideo/x-msvideo\tavi\nvideo/x-sgi-movie\tmovie\nvideo/x-matroska\tmpv mkv\nx-conference/x-cooltalk\tice\nx-epoc/x-sisx-app\tsisx\nx-world/x-vrml\tvrm vrml wrl",
        lines = mimefile.split('\n'),
        dict = {};

    lines.forEach(function (line) {
        var tmp = line.split('\t'),
            mime = tmp[0],
            exts = tmp[1].split(' ');
        exts.forEach(function (ext) { dict[ext] = mime });
    });

    return {
        /**
         * @param {string} ext
         * @param {string} mimetype
         * @example
         * mimetypes.set('gz', 'application/x-gzip');
         * mimetypes.set({
         *   epub: 'application/epub+zip'
         * });
         */
        set: function(ext, mimetype){
            if(typeof ext === 'object') {
                Object.keys(ext).forEach(function (k) { dict[k] = ext[k] });
            } else {
                dict[ext] = mimetype;
            }
        },

        /**
         * @param  {string} filename
         * @return {string}
         * @example
         * mimetypes.guess('foo.epub'); // 'application/epub+zip'
         */
        guess: function(filename){
            return dict[filename.split(".").pop()] || "aplication/octet-stream";
        }
    };
})();

/**
 * @constructor
 * @param {object} params
 */
function ZipArchiveReader(params){
    this.bytes = utils.toBytes(params.buffer);
    this.buffer = this.bytes.buffer;
    this.params = params;
};

/**
 * @return {Promise}
 */
ZipArchiveReader.prototype.init = function() {
    var signature, header, endCentDirHeader, i, n,
        bytes = this.bytes,
        localFileHeaders = [],
        centralDirHeaders = [],
        files = [],
        folders = [],
        offset = bytes.byteLength - 4,
        view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength),
        self = this,
        params = this.params;

    this.files = files;
    this.folders = folders;
    this.localFileHeaders = localFileHeaders;
    this.centralDirHeaders = centralDirHeaders;

    // check the first local file signature
    if (view.getUint32(0, true) !== zip.LOCAL_FILE_SIGNATURE) {
        throw new Error('zip.unpack: invalid zip file');
    }
    
    // read the end central dir header.
    while(true){
        if(view.getUint32(offset, true) === zip.END_SIGNATURE) {
            endCentDirHeader = self._getEndCentDirHeader(offset);
            break;
        }
        offset--;
        if(offset === 0) throw new Error('zip.unpack: invalid zip file');
    }

    // read central dir headers.
    offset = endCentDirHeader.startpos;
    for(i = 0, n = endCentDirHeader.direntry; i < n; ++i) {
        header = self._getCentralDirHeader(offset);
        centralDirHeaders.push(header);
        offset += header.allsize;
    }

    // read local file headers.
    for(i = 0; i < n; ++i) {
        offset = centralDirHeaders[i].headerpos;
        header = self._getLocalFileHeader(offset);
        header.crc32 = centralDirHeaders[i].crc32;
        header.compsize = centralDirHeaders[i].compsize;
        header.uncompsize = centralDirHeaders[i].uncompsize;
        localFileHeaders.push(header);
    }

    return this._completeInit();
};

/**
 * @return {Promise}
 */
ZipArchiveReader.prototype._completeInit = function() {
    var files = this.files,
        folders = this.folders,
        params = this.params,
        localFileHeaders = this.localFileHeaders,
        self = this;

    localFileHeaders.forEach(function(header, i){
        // Is the last char '/'.
        (header.filename[header.filename.length - 1] !== 47 ? files : folders).push(header);
    });

    // detect encoding. cp932 or utf-8.
    if (params.encoding == null) {
        Promise.resolve(localFileHeaders.map(function (header) {
            return header.filename;
        }))
        .then(utils.concatByteArrays)
        .then(utils.detectEncoding)
        .then(function (encoding) {
            params.encoding = encoding;
        })
    }

    return Promise.all(localFileHeaders.map(function (header, i) {
        return utils.bytesToString(header.filename, params.encoding).then(function (filename) {
            header.filename = filename;
        });
    }))
    .then(function () { return self });
};

/**
 * @param  {number} offset
 * @return {object}
 */
ZipArchiveReader.prototype._getLocalFileHeader = function(offset){
    var view = new DataView(this.buffer, offset),
        bytes = new Uint8Array(this.buffer, offset),
        ret = {};

    ret.signature = view.getUint32(0, true);
    ret.needver = view.getUint16(4, true);
    ret.option = view.getUint16(6, true);
    ret.comptype = view.getUint16(8, true);
    ret.filetime = view.getUint16(10, true);
    ret.filedate = view.getUint16(12, true);
    ret.crc32 = view.getUint32(14, true);
    ret.compsize = view.getUint32(18, true);
    ret.uncompsize = view.getUint32(22, true);
    ret.fnamelen = view.getUint16(26, true);
    ret.extralen = view.getUint16(28, true);
    ret.headersize = 30 + ret.fnamelen + ret.extralen;
    ret.allsize = ret.headersize + ret.compsize;
    ret.filename = bytes.subarray(30, 30 + ret.fnamelen);

    return ret;
};

/**
 * @param  {number} offset
 * @return {object}
 */
ZipArchiveReader.prototype._getCentralDirHeader = function(offset){
    var view = new DataView(this.buffer, offset),
        ret = {};

    ret.signature = view.getUint32(0, true);
    ret.madever = view.getUint16(4, true);
    ret.needver = view.getUint16(6, true);
    ret.option = view.getUint16(8, true);
    ret.comptype = view.getUint16(10, true);
    ret.filetime = view.getUint16(12, true);
    ret.filedate = view.getUint16(14, true);
    ret.crc32 = view.getUint32(16, true);
    ret.compsize = view.getUint32(20, true);
    ret.uncompsize = view.getUint32(24, true);
    ret.fnamelen = view.getUint16(28, true);
    ret.extralen = view.getUint16(30, true);
    ret.commentlen = view.getUint16(32, true);
    ret.disknum = view.getUint16(34, true);
    ret.inattr = view.getUint16(36, true);
    ret.outattr = view.getUint32(38, true);
    ret.headerpos = view.getUint32(42, true);
    ret.allsize = 46 + ret.fnamelen + ret.extralen + ret.commentlen;
    
    return ret;
};

/**
 * @param  {number} offset
 * @return {object}
 */
ZipArchiveReader.prototype._getEndCentDirHeader = function(offset){
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

/**
 * @return {Array.<string>} File names
 */
ZipArchiveReader.prototype.getFileNames = function() {
    return this.files.map(function(file){return file.filename;});
};

/**
 * @param  {string} filename File name
 * @return {number} File index
 */
ZipArchiveReader.prototype._getFileIndex = function(filename) {
    for(var i = 0, n = this.localFileHeaders.length; i < n; ++i)
        if(filename === this.localFileHeaders[i].filename) return i;
    throw new Error('File is not found.');
};

/**
 * @param  {string} filename File name
 * @return {object} byte offset, byte length and compression flag.
 */
ZipArchiveReader.prototype._getFileInfo = function(filename) {
    var i = this._getFileIndex(filename),
        centralDirHeader = this.centralDirHeaders[i],
        localFileHeader = this.localFileHeaders[i];

    return {
        offset: centralDirHeader.headerpos + localFileHeader.headersize,
        length: localFileHeader.compsize,
        isCompressed: localFileHeader.comptype
    };
};

/**
 * @param  {Uint8Array} bytes        Compressed bytes
 * @param  {boolean}    isCompressed Is file compressed.
 * @return {Uint8Array} Decompressed bytes.
 */
ZipArchiveReader.prototype._decompress = function(bytes, isCompressed) {
    return isCompressed ? algorithms.inflate(bytes) : bytes;
}

/**
 * @param  {string}     filename File name
 * @return {Uint8Array} Decompressed bytes.
 */
ZipArchiveReader.prototype._decompressFile = function(filename) {
    var info = this._getFileInfo(filename);
    return this._decompress(new Uint8Array(this.buffer, info.offset, info.length), info.isCompressed);
}

/**
 * @param  {string} filename File name
 * @return {Promise}
 */
ZipArchiveReader.prototype.getFileAsArrayBuffer = function(filename) {
    return new Promise(function (resolve) {
        resolve(this._decompressFile(filename).buffer);
    }.bind(this));
};

/**
 * @param  {string} type     fileReader.getFileAs[type]
 * @param  {string} filename File name
 * @return {Promise}
 */
ZipArchiveReader.prototype._getFileAs = function(type, filename, encoding) {
    var args = arguments;

    return this.getFileAsBlob(filename).then(function (blob) {
        return utils.readFileAs.call(null, type, blob, encoding);
    });
};

/**
 * @param  {string} filename File name
 * @param  {string} encoding Character encoding
 * @return {Promise}
 */
ZipArchiveReader.prototype.getFileAsText = function(filename, encoding) {
    return this._getFileAs('Text', filename, encoding || 'UTF-8');
};

/**
 * @param  {string} filename File name
 * @return {Promise}
 */
ZipArchiveReader.prototype.getFileAsBinaryString = function(filename){
    return this._getFileAs('BinaryString', filename);
};

/**
 * @param  {string} filename File name
 * @return {Promise}
 */
ZipArchiveReader.prototype.getFileAsDataURL = function(filename){
    return this._getFileAs('DataURL', filename);
};

/**
 * @param  {string} filename    File name
 * @param  {string} contentType Content type of file (exp: 'text/plain')
 * @return {Promise}
 */
ZipArchiveReader.prototype.getFileAsBlob = function(filename, contentType){
    return new Promise(function (resolve) {
        resolve(new Blob([this._decompressFile(filename, false)], {type: contentType || mimetypes.guess(filename)}));
    }.bind(this));
};

//for worker
if(env.isWorker){
    /**
     * @param  {string} filename File name
     * @return {ArrayBuffer}
     */
    ZipArchiveReader.prototype.getFileAsArrayBufferSync = function(filename) {
        return this._decompressFile(filename, true).buffer;
    };

    /**
     * @param  {string} filename    File name
     * @param  {string} contentType Content type
     * @return {Blob}
     */
    ZipArchiveReader.prototype.getFileAsBlobSync = function(filename, contentType) {
        return new Blob([this._decompressFile(filename, false)], {type: contentType || mimetypes.guess(filename)});
    };

    /**
     * @param  {string} filename File name
     * @param  {string} encoding Character encoding
     * @return {string}
     */
    ZipArchiveReader.prototype.getFileAsTextSync = function(filename, encoding){
        return new FileReaderSync().readAsText(this.getFileAsBlobSync(filename), encoding || 'UTF-8');
    };

    /**
     * @param  {string} filename File name
     * @return {string}
     */
    ZipArchiveReader.prototype.getFileAsBinaryStringSync = function(filename){
        return new FileReaderSync().readAsBinarySting(this.getFileAsBlobSync(filename));
    };

    /**
     * @param  {string} filename File name
     * @return {string}
     */
    ZipArchiveReader.prototype.getFileAsDataURLSync = function(filename){
        return new FileReaderSync().readAsDataURL(this.getFileAsBlobSync(filename));
    };

    exposeProperty('getFileAsArrayBufferSync', ZipArchiveReader, ZipArchiveReader.prototype.getFileAsArrayBufferSync);
    exposeProperty('getFileAsBlobSync', ZipArchiveReader, ZipArchiveReader.prototype.getFileAsBlobSync);
    exposeProperty('getFileAsTextSync', ZipArchiveReader, ZipArchiveReader.prototype.getFileAsTextSync);
    exposeProperty('getFileAsBinaryStringSync', ZipArchiveReader, ZipArchiveReader.prototype.getFileAsBinaryStringSync);
    exposeProperty('getFileAsDataURLSync', ZipArchiveReader, ZipArchiveReader.prototype.getFileAsDataURLSync);
}

exposeProperty('getFileNames', ZipArchiveReader, ZipArchiveReader.prototype.getFileNames);
exposeProperty('getFileAsArrayBuffer', ZipArchiveReader, ZipArchiveReader.prototype.getFileAsArrayBuffer);
exposeProperty('getFileAsText', ZipArchiveReader, ZipArchiveReader.prototype.getFileAsText);
exposeProperty('getFileAsBinaryString', ZipArchiveReader, ZipArchiveReader.prototype.getFileAsBinaryString);
exposeProperty('getFileAsDataURL', ZipArchiveReader, ZipArchiveReader.prototype.getFileAsDataURL);
exposeProperty('getFileAsBlob', ZipArchiveReader, ZipArchiveReader.prototype.getFileAsBlob);


/**
 * @constructor
 * @param {object} params
 */
function ZipArchiveReaderBlob(params) {
    this.blob = params.buffer;
    this.params = params;
}

ZipArchiveReaderBlob.prototype = Object.create(ZipArchiveReader.prototype);
ZipArchiveReaderBlob.prototype.constructor = ZipArchiveReaderBlob;

/**
 * @return {Promise}
 */
ZipArchiveReaderBlob.prototype.init = function() {
    var blob = this.blob,
        params = this.params,
        self = this,
        endCentDirHeader,
        centralDirHeaders = [],
        localFileHeaders = [],
        files = [],
        folders = [];

    this.files = files;
    this.folders = folders;
    this.localFileHeaders = localFileHeaders;
    this.centralDirHeaders = centralDirHeaders;

    function readChunk (start, end) {
        return utils.readFileAsArrayBuffer(blob.slice(start, end));
    }

    return (function validateFirstLocalFileSignature () {
        return readChunk(0, 4).then(function (chunk) {
            if (new DataView(chunk).getUint32(0, true) === zip.LOCAL_FILE_SIGNATURE) {
                return Math.max(0, blob.size - 0x8000);
            } else {
                throw new Error('zip.unpack: invalid zip file.');
            }
        });
    })()

    .then(function validateEndSignature (offset) {
        return readChunk(offset, Math.min(blob.size, offset + 0x8000)).then(function (buffer) {
            var dv = new DataView(buffer),
                i, n;

            for (i = buffer.byteLength - 4; i--;)
                if (dv.getUint32(i, true) === zip.END_SIGNATURE)
                    return offset + i;

            if (offset) {
                return validateEndSignature(Math.max(offset - 0x8000 + 3, 0));
            } else {
                throw new Error('zip.unpack: invalid zip file.');
            }
        });
    })

    .then(function getEndCentDirHeader (offset) {
        return readChunk(offset, blob.size).then(function (buffer) {
            endCentDirHeader = ZipArchiveReader.prototype._getEndCentDirHeader.call({buffer: buffer}, 0);
            return offset;
        });
    })

    .then(function getCentralDirHeaders (end) {
        return readChunk(endCentDirHeader.startpos, end).then(function (buffer) {
            var offset = 0,
                context = {buffer: buffer},
                i, n, header;

            for (i = 0, n = endCentDirHeader.direntry; i < n; ++i) {
                header = ZipArchiveReader.prototype._getCentralDirHeader.call(context, offset);
                centralDirHeaders.push(header);
                offset += header.allsize;
            }
        });
    })

    .then(function getLocalFileHeaders (index) {
        if (index === centralDirHeaders.length) return;

        var offset = centralDirHeaders[index].headerpos;

        return readChunk(offset + 26, offset + 30).then(function (buffer) {
            var view = new DataView(buffer),
                fnamelen = view.getUint16(0, true),
                extralen = view.getUint16(2, true);
            return readChunk(offset, offset + 30 + fnamelen + extralen);
        })
        .then(function (buffer) {
            var header = ZipArchiveReader.prototype._getLocalFileHeader.call({buffer: buffer}, 0);
            header.crc32 = centralDirHeaders[index].crc32;
            header.compsize = centralDirHeaders[index].compsize;
            header.uncompsize = centralDirHeaders[index].uncompsize;
            localFileHeaders.push(header);
            return getLocalFileHeaders(index + 1);
        });
    }.bind(null, 0))

    .then(this._completeInit.bind(this));
};

/**
 * @param  {string} filename File name
 * @return {Promise}
 */
ZipArchiveReaderBlob.prototype.getFileAsArrayBuffer = function(filename) {
    return this._getFileAs('ArrayBuffer', filename);
}

/**
 * @param  {string} filename    File name
 * @param  {string} contentType Content type
 * @return {Promise}
 */
ZipArchiveReaderBlob.prototype.getFileAsBlob = function(filename, contentType) {
    contentType = contentType || mimetypes.guess(filename);

    var info = this._getFileInfo(filename),
        blob = this.blob.slice(info.offset, info.offset + info.length, {type: contentType});

    if (!info.isCompressed) return Promise.resolve(blob);
    return utils.readFileAsArrayBuffer(blob).then(function (buffer) {
        return new Blob(algorithms.inflate(new Uint8Array(buffer)), {type: contentType});
    });
};

if (env.isWorker) {
    /**
     * @param  {string}  filename File name
     * @param  {boolean} copy     If copy is true, return copy.
     * @return {Uint8Array}
     */
    ZipArchiveReaderBlob.prototype._decompressFile = function(filename, copy) {
        var info = this._getFileInfo(filename),
            blob = this.blob.slice(info.offset, info.offset + info.length),
            bytes = new Uint8Array(new FileReaderSync().readAsArrayBuffer(blob));
        return this._decompress(bytes, info.isCompressed, copy);
    };

    /**
     * @param  {string} filename File name
     * @return {ArrayBuffer}
     */
    ZipArchiveReaderBlob.prototype.getFileAsArrayBufferSync = function(filename) {
        return this._decompressFile(filename, true).buffer;
    };

    /**
     * @param  {string} filename    File name
     * @param  {string} contentType Content type
     * @return {Blob}
     */
    ZipArchiveReaderBlob.prototype.getFileAsBlobSync = function(filename, contentType) {
        return new Blob([this._decompressFile(filename, false)], {type: contentType || mimetypes.guess(filename)});
    };

    exposeProperty('getFileAsArrayBufferSync', ZipArchiveReaderBlob, ZipArchiveReaderBlob.prototype.getFileAsArrayBufferSync);
    exposeProperty('getFileAsBlobSync', ZipArchiveReaderBlob, ZipArchiveReaderBlob.prototype.getFileAsBlobSync);
    exposeProperty('getFileAsTextSync', ZipArchiveReaderBlob, ZipArchiveReaderBlob.prototype.getFileAsTextSync);
    exposeProperty('getFileAsBinaryStringSync', ZipArchiveReaderBlob, ZipArchiveReaderBlob.prototype.getFileAsBinaryStringSync);
    exposeProperty('getFileAsDataURLSync', ZipArchiveReaderBlob, ZipArchiveReaderBlob.prototype.getFileAsDataURLSync);
}

exposeProperty('getFileAsArrayBuffer', ZipArchiveReaderBlob, ZipArchiveReaderBlob.prototype.getFileAsArrayBuffer);
exposeProperty('getFileAsText', ZipArchiveReaderBlob, ZipArchiveReaderBlob.prototype.getFileAsText);
exposeProperty('getFileAsBinaryString', ZipArchiveReaderBlob, ZipArchiveReaderBlob.prototype.getFileAsBinaryString);
exposeProperty('getFileAsDataURL', ZipArchiveReaderBlob, ZipArchiveReaderBlob.prototype.getFileAsDataURL);
exposeProperty('getFileAsBlob', ZipArchiveReaderBlob, ZipArchiveReaderBlob.prototype.getFileAsBlob);
exposeProperty('getFileAsTextSync', ZipArchiveReaderBlob, ZipArchiveReaderBlob.prototype.getFileAsTextSync);
exposeProperty('getFileAsBinaryStringSync', ZipArchiveReaderBlob, ZipArchiveReaderBlob.prototype.getFileAsBinaryStringSync);
exposeProperty('getFileAsDataURLSync', ZipArchiveReaderBlob, ZipArchiveReaderBlob.prototype.getFileAsDataURLSync);


/**
 * unpack a zip file.
 * @param {Object|Uint8Array|Int8Array|Array|ArrayBuffer|string|Blob} params
 * @return {Deferred}
 *
 * @example
 * jz.zip.unpack({
 *     buffer: buffer, // zip buffer
 *     encoding: 'UTF-8' // encoding of filenames
 * })
 * .then(function(reader){ })
 * .catch(function(err){ });
 *
 * jz.zip.unpack(buffer)
 * .then(function(reader){ })
 * .catch(function(err){ });
 *
 */
zip.unpack = function(params){
    switch(params.constructor) {
        case Uint8Array:
        case Int8Array:
        case Array:
        case String:
        case ArrayBuffer:
            params = {buffer: utils.toBytes(params)};
            break;
        case Blob:
        case File:
            params = {buffer: params};
            break;
    }

    return new (params.buffer instanceof Blob ? ZipArchiveReaderBlob : ZipArchiveReader)(params).init();
};

expose('jz.zip.unpack', zip.unpack);
