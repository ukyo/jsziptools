var utils = {},
    algorithms = {},
    gz = {},
    zip = {},
    env = {},
    zpipe = {},
    stream = {
        algorithms: {},
        zlib: {},
        gz: {},
        zip: {}
    },
    global = this;

zip.LOCAL_FILE_SIGNATURE = 0x04034B50;
zip.CENTRAL_DIR_SIGNATURE = 0x02014B50;
zip.END_SIGNATURE = 0x06054B50;
env.isWorker = typeof importScripts === 'function';

expose('jz.algos', algorithms);
expose('jz.stream.algos', stream.algorithms);

function expose(namespace, o) {
    var paths = namespace.split('.'),
        last = paths.pop(),
        object = global;
    paths.forEach(function(path) {
        object[path] = object[path] || {};
        object = object[path];
    });
    object[last] = o;
}

function exposeProperty(name, cls, property) {
    cls.prototype[name] = property;
}

function defun(propertyNames, fn) {
    return function() {
        var args, params = arguments[0];
        if (Object.prototype.toString.call(params) === '[object Object]') {
            args = propertyNames.map(function(name) {
                return params[name];
            });
        } else {
            args = arguments;
        }
        return fn.apply(this, args);
    };
}

var mimetypes = (function() {
    var mimefile = "application/epub+zip\tepub\napplication/x-gzip\tgz\napplication/andrew-inset\tez\napplication/annodex\tanx\napplication/atom+xml\tatom\napplication/atomcat+xml\tatomcat\napplication/atomserv+xml\tatomsrv\napplication/bbolin\tlin\napplication/cap\tcap pcap\napplication/cu-seeme\tcu\napplication/davmount+xml\tdavmount\napplication/dsptype\ttsp\napplication/ecmascript\tes\napplication/futuresplash\tspl\napplication/hta\thta\napplication/java-archive\tjar\napplication/java-serialized-object\tser\napplication/java-vm\tclass\napplication/javascript\tjs\napplication/json\tjson\napplication/m3g\tm3g\napplication/mac-binhex40\thqx\napplication/mac-compactpro\tcpt\napplication/mathematica\tnb nbp\napplication/msaccess\tmdb\napplication/msword\tdoc dot\napplication/mxf\tmxf\napplication/octet-stream\tbin\napplication/oda\toda\napplication/ogg\togx\napplication/onenote\tone onetoc2 onetmp onepkg\napplication/pdf\tpdf\napplication/pgp-keys\tkey\napplication/pgp-signature\tpgp\napplication/pics-rules\tprf\napplication/postscript\tps ai eps epsi epsf eps2 eps3\napplication/rar\trar\napplication/rdf+xml\trdf\napplication/rss+xml\trss\napplication/rtf\trtf\napplication/sla\tstl\napplication/smil\tsmi smil\napplication/xhtml+xml\txhtml xht\napplication/xml\txml xsl xsd\napplication/xspf+xml\txspf\napplication/zip\tzip\napplication/vnd.android.package-archive\tapk\napplication/vnd.cinderella\tcdy\napplication/vnd.google-earth.kml+xml\tkml\napplication/vnd.google-earth.kmz\tkmz\napplication/vnd.mozilla.xul+xml\txul\napplication/vnd.ms-excel\txls xlb xlt\napplication/vnd.ms-excel.addin.macroEnabled.12\txlam\napplication/vnd.ms-excel.sheet.binary.macroEnabled.12\txlsb\napplication/vnd.ms-excel.sheet.macroEnabled.12\txlsm\napplication/vnd.ms-excel.template.macroEnabled.12\txltm\napplication/vnd.ms-officetheme\tthmx\napplication/vnd.ms-pki.seccat\tcat\napplication/vnd.ms-powerpoint\tppt pps\napplication/vnd.ms-powerpoint.addin.macroEnabled.12\tppam\napplication/vnd.ms-powerpoint.presentation.macroEnabled.12\tpptm\napplication/vnd.ms-powerpoint.slide.macroEnabled.12\tsldm\napplication/vnd.ms-powerpoint.slideshow.macroEnabled.12\tppsm\napplication/vnd.ms-powerpoint.template.macroEnabled.12\tpotm\napplication/vnd.ms-word.document.macroEnabled.12\tdocm\napplication/vnd.ms-word.template.macroEnabled.12\tdotm\napplication/vnd.oasis.opendocument.chart\todc\napplication/vnd.oasis.opendocument.database\todb\napplication/vnd.oasis.opendocument.formula\todf\napplication/vnd.oasis.opendocument.graphics\todg\napplication/vnd.oasis.opendocument.graphics-template\totg\napplication/vnd.oasis.opendocument.image\todi\napplication/vnd.oasis.opendocument.presentation\todp\napplication/vnd.oasis.opendocument.presentation-template\totp\napplication/vnd.oasis.opendocument.spreadsheet\tods\napplication/vnd.oasis.opendocument.spreadsheet-template\tots\napplication/vnd.oasis.opendocument.text\todt\napplication/vnd.oasis.opendocument.text-master\todm\napplication/vnd.oasis.opendocument.text-template\tott\napplication/vnd.oasis.opendocument.text-web\toth\napplication/vnd.openxmlformats-officedocument.presentationml.presentation\tpptx\napplication/vnd.openxmlformats-officedocument.presentationml.slide\tsldx\napplication/vnd.openxmlformats-officedocument.presentationml.slideshow\tppsx\napplication/vnd.openxmlformats-officedocument.presentationml.template\tpotx\napplication/vnd.openxmlformats-officedocument.spreadsheetml.sheet\txlsx\napplication/vnd.openxmlformats-officedocument.spreadsheetml.sheet\txlsx\napplication/vnd.openxmlformats-officedocument.spreadsheetml.template\txltx\napplication/vnd.openxmlformats-officedocument.spreadsheetml.template\txltx\napplication/vnd.openxmlformats-officedocument.wordprocessingml.document\tdocx\napplication/vnd.openxmlformats-officedocument.wordprocessingml.template\tdotx\napplication/vnd.rim.cod\tcod\napplication/vnd.smaf\tmmf\napplication/vnd.stardivision.calc\tsdc\napplication/vnd.stardivision.chart\tsds\napplication/vnd.stardivision.draw\tsda\napplication/vnd.stardivision.impress\tsdd\napplication/vnd.stardivision.math\tsdf\napplication/vnd.stardivision.writer\tsdw\napplication/vnd.stardivision.writer-global\tsgl\napplication/vnd.sun.xml.calc\tsxc\napplication/vnd.sun.xml.calc.template\tstc\napplication/vnd.sun.xml.draw\tsxd\napplication/vnd.sun.xml.draw.template\tstd\napplication/vnd.sun.xml.impress\tsxi\napplication/vnd.sun.xml.impress.template\tsti\napplication/vnd.sun.xml.math\tsxm\napplication/vnd.sun.xml.writer\tsxw\napplication/vnd.sun.xml.writer.global\tsxg\napplication/vnd.sun.xml.writer.template\tstw\napplication/vnd.symbian.install\tsis\napplication/vnd.visio\tvsd\napplication/vnd.wap.wbxml\twbxml\napplication/vnd.wap.wmlc\twmlc\napplication/vnd.wap.wmlscriptc\twmlsc\napplication/vnd.wordperfect\twpd\napplication/vnd.wordperfect5.1\twp5\napplication/x-123\twk\napplication/x-7z-compressed\t7z\napplication/x-abiword\tabw\napplication/x-apple-diskimage\tdmg\napplication/x-bcpio\tbcpio\napplication/x-bittorrent\ttorrent\napplication/x-cab\tcab\napplication/x-cbr\tcbr\napplication/x-cbz\tcbz\napplication/x-cdf\tcdf cda\napplication/x-cdlink\tvcd\napplication/x-chess-pgn\tpgn\napplication/x-comsol\tmph\napplication/x-cpio\tcpio\napplication/x-csh\tcsh\napplication/x-debian-package\tdeb udeb\napplication/x-director\tdcr dir dxr\napplication/x-dms\tdms\napplication/x-doom\twad\napplication/x-dvi\tdvi\napplication/x-font\tpfa pfb gsf pcf pcf.Z\napplication/x-freemind\tmm\napplication/x-futuresplash\tspl\napplication/x-ganttproject\tgan\napplication/x-gnumeric\tgnumeric\napplication/x-go-sgf\tsgf\napplication/x-graphing-calculator\tgcf\napplication/x-gtar\tgtar\napplication/x-gtar-compressed\ttgz taz\napplication/x-hdf\thdf\napplication/x-httpd-eruby\trhtml\napplication/x-httpd-php\tphtml pht php\napplication/x-httpd-php-source\tphps\napplication/x-httpd-php3\tphp3\napplication/x-httpd-php3-preprocessed\tphp3p\napplication/x-httpd-php4\tphp4\napplication/x-httpd-php5\tphp5\napplication/x-ica\tica\napplication/x-info\tinfo\napplication/x-internet-signup\tins isp\napplication/x-iphone\tiii\napplication/x-iso9660-image\tiso\napplication/x-jam\tjam\napplication/x-java-jnlp-file\tjnlp\napplication/x-jmol\tjmz\napplication/x-kchart\tchrt\napplication/x-killustrator\tkil\napplication/x-koan\tskp skd skt skm\napplication/x-kpresenter\tkpr kpt\napplication/x-kspread\tksp\napplication/x-kword\tkwd kwt\napplication/x-latex\tlatex\napplication/x-lha\tlha\napplication/x-lyx\tlyx\napplication/x-lzh\tlzh\napplication/x-lzx\tlzx\napplication/x-maker\tfrm maker frame fm fb book fbdoc\napplication/x-mif\tmif\napplication/x-mpegURL\tm3u8\napplication/x-ms-wmd\twmd\napplication/x-ms-wmz\twmz\napplication/x-msdos-program\tcom exe bat dll\napplication/x-msi\tmsi\napplication/x-netcdf\tnc\napplication/x-ns-proxy-autoconfig\tpac dat\napplication/x-nwc\tnwc\napplication/x-object\to\napplication/x-oz-application\toza\napplication/x-pkcs7-certreqresp\tp7r\napplication/x-pkcs7-crl\tcrl\napplication/x-python-code\tpyc pyo\napplication/x-qgis\tqgs shp shx\napplication/x-quicktimeplayer\tqtl\napplication/x-rdp\trdp\napplication/x-redhat-package-manager\trpm\napplication/x-ruby\trb\napplication/x-scilab\tsci sce\napplication/x-sh\tsh\napplication/x-shar\tshar\napplication/x-shockwave-flash\tswf swfl\napplication/x-silverlight\tscr\napplication/x-sql\tsql\napplication/x-stuffit\tsit sitx\napplication/x-sv4cpio\tsv4cpio\napplication/x-sv4crc\tsv4crc\napplication/x-tar\ttar\napplication/x-tcl\ttcl\napplication/x-tex-gf\tgf\napplication/x-tex-pk\tpk\napplication/x-texinfo\ttexinfo texi\napplication/x-trash\t~ % bak old sik\napplication/x-troff\tt tr roff\napplication/x-troff-man\tman\napplication/x-troff-me\tme\napplication/x-troff-ms\tms\napplication/x-ustar\tustar\napplication/x-wais-source\tsrc\napplication/x-wingz\twz\napplication/x-x509-ca-cert\tcrt\napplication/x-xcf\txcf\napplication/x-xfig\tfig\napplication/x-xpinstall\txpi\naudio/amr\tamr\naudio/amr-wb\tawb\naudio/amr\tamr\naudio/amr-wb\tawb\naudio/annodex\taxa\naudio/basic\tau snd\naudio/csound\tcsd orc sco\naudio/flac\tflac\naudio/midi\tmid midi kar\naudio/mpeg\tmpga mpega mp2 mp3 m4a\naudio/mpegurl\tm3u\naudio/ogg\toga ogg spx\naudio/prs.sid\tsid\naudio/x-aiff\taif aiff aifc\naudio/x-gsm\tgsm\naudio/x-mpegurl\tm3u\naudio/x-ms-wma\twma\naudio/x-ms-wax\twax\naudio/x-pn-realaudio\tra rm ram\naudio/x-realaudio\tra\naudio/x-scpls\tpls\naudio/x-sd2\tsd2\naudio/x-wav\twav\nchemical/x-alchemy\talc\nchemical/x-cache\tcac cache\nchemical/x-cache-csf\tcsf\nchemical/x-cactvs-binary\tcbin cascii ctab\nchemical/x-cdx\tcdx\nchemical/x-cerius\tcer\nchemical/x-chem3d\tc3d\nchemical/x-chemdraw\tchm\nchemical/x-cif\tcif\nchemical/x-cmdf\tcmdf\nchemical/x-cml\tcml\nchemical/x-compass\tcpa\nchemical/x-crossfire\tbsd\nchemical/x-csml\tcsml csm\nchemical/x-ctx\tctx\nchemical/x-cxf\tcxf cef\nchemical/x-embl-dl-nucleotide\temb embl\nchemical/x-galactic-spc\tspc\nchemical/x-gamess-input\tinp gam gamin\nchemical/x-gaussian-checkpoint\tfch fchk\nchemical/x-gaussian-cube\tcub\nchemical/x-gaussian-input\tgau gjc gjf\nchemical/x-gaussian-log\tgal\nchemical/x-gcg8-sequence\tgcg\nchemical/x-genbank\tgen\nchemical/x-hin\thin\nchemical/x-isostar\tistr ist\nchemical/x-jcamp-dx\tjdx dx\nchemical/x-kinemage\tkin\nchemical/x-macmolecule\tmcm\nchemical/x-macromodel-input\tmmd mmod\nchemical/x-mdl-molfile\tmol\nchemical/x-mdl-rdfile\trd\nchemical/x-mdl-rxnfile\trxn\nchemical/x-mdl-sdfile\tsd sdf\nchemical/x-mdl-tgf\ttgf\nchemical/x-mmcif\tmcif\nchemical/x-mol2\tmol2\nchemical/x-molconn-Z\tb\nchemical/x-mopac-graph\tgpt\nchemical/x-mopac-input\tmop mopcrt mpc zmt\nchemical/x-mopac-out\tmoo\nchemical/x-mopac-vib\tmvb\nchemical/x-ncbi-asn1\tasn\nchemical/x-ncbi-asn1-ascii\tprt ent\nchemical/x-ncbi-asn1-binary\tval aso\nchemical/x-ncbi-asn1-spec\tasn\nchemical/x-pdb\tpdb ent\nchemical/x-rosdal\tros\nchemical/x-swissprot\tsw\nchemical/x-vamas-iso14976\tvms\nchemical/x-vmd\tvmd\nchemical/x-xtel\txtel\nchemical/x-xyz\txyz\nimage/gif\tgif\nimage/ief\tief\nimage/jpeg\tjpeg jpg jpe\nimage/pcx\tpcx\nimage/png\tpng\nimage/svg+xml\tsvg svgz\nimage/tiff\ttiff tif\nimage/vnd.djvu\tdjvu djv\nimage/vnd.wap.wbmp\twbmp\nimage/x-canon-cr2\tcr2\nimage/x-canon-crw\tcrw\nimage/x-cmu-raster\tras\nimage/x-coreldraw\tcdr\nimage/x-coreldrawpattern\tpat\nimage/x-coreldrawtemplate\tcdt\nimage/x-corelphotopaint\tcpt\nimage/x-epson-erf\terf\nimage/x-icon\tico\nimage/x-jg\tart\nimage/x-jng\tjng\nimage/x-ms-bmp\tbmp\nimage/x-nikon-nef\tnef\nimage/x-olympus-orf\torf\nimage/x-photoshop\tpsd\nimage/x-portable-anymap\tpnm\nimage/x-portable-bitmap\tpbm\nimage/x-portable-graymap\tpgm\nimage/x-portable-pixmap\tppm\nimage/x-rgb\trgb\nimage/x-xbitmap\txbm\nimage/x-xpixmap\txpm\nimage/x-xwindowdump\txwd\nmessage/rfc822\teml\nmodel/iges\tigs iges\nmodel/mesh\tmsh mesh silo\nmodel/vrml\twrl vrml\nmodel/x3d+vrml\tx3dv\nmodel/x3d+xml\tx3d\nmodel/x3d+binary\tx3db\ntext/cache-manifest\tmanifest\ntext/calendar\tics icz\ntext/css\tcss\ntext/csv\tcsv\ntext/h323\t323\ntext/html\thtml htm shtml\ntext/iuls\tuls\ntext/mathml\tmml\ntext/plain\tasc txt text pot brf\ntext/richtext\trtx\ntext/scriptlet\tsct wsc\ntext/texmacs\ttm\ntext/tab-separated-values\ttsv\ntext/vnd.sun.j2me.app-descriptor\tjad\ntext/vnd.wap.wml\twml\ntext/vnd.wap.wmlscript\twmls\ntext/x-bibtex\tbib\ntext/x-boo\tboo\ntext/x-c++hdr\th++ hpp hxx hh\ntext/x-c++src\tc++ cpp cxx cc\ntext/x-chdr\th\ntext/x-component\thtc\ntext/x-csh\tcsh\ntext/x-csrc\tc\ntext/x-dsrc\td\ntext/x-diff\tdiff patch\ntext/x-haskell\ths\ntext/x-java\tjava\ntext/x-literate-haskell\tlhs\ntext/x-moc\tmoc\ntext/x-pascal\tp pas\ntext/x-pcs-gcd\tgcd\ntext/x-perl\tpl pm\ntext/x-python\tpy\ntext/x-scala\tscala\ntext/x-setext\tetx\ntext/x-sfv\tsfv\ntext/x-sh\tsh\ntext/x-tcl\ttcl tk\ntext/x-tex\ttex ltx sty cls\ntext/x-vcalendar\tvcs\ntext/x-vcard\tvcf\nvideo/3gpp\t3gp\nvideo/annodex\taxv\nvideo/dl\tdl\nvideo/dv\tdif dv\nvideo/fli\tfli\nvideo/gl\tgl\nvideo/mpeg\tmpeg mpg mpe\nvideo/MP2T\tts\nvideo/mp4\tmp4\nvideo/quicktime\tqt mov\nvideo/ogg\togv\nvideo/webm\twebm\nvideo/vnd.mpegurl\tmxu\nvideo/x-flv\tflv\nvideo/x-la-asf\tlsf lsx\nvideo/x-mng\tmng\nvideo/x-ms-asf\tasf asx\nvideo/x-ms-wm\twm\nvideo/x-ms-wmv\twmv\nvideo/x-ms-wmx\twmx\nvideo/x-ms-wvx\twvx\nvideo/x-msvideo\tavi\nvideo/x-sgi-movie\tmovie\nvideo/x-matroska\tmpv mkv\nx-conference/x-cooltalk\tice\nx-epoc/x-sisx-app\tsisx\nx-world/x-vrml\tvrm vrml wrl",
        lines = mimefile.split('\n'),
        dict = {};

    lines.forEach(function(line) {
        var tmp = line.split('\t'),
            mime = tmp[0],
            exts = tmp[1].split(' ');
        exts.forEach(function(ext) {
            dict[ext] = mime
        });
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
        set: function(ext, mimetype) {
            if (typeof ext === 'object') {
                Object.keys(ext).forEach(function(k) {
                    dict[k] = ext[k]
                });
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
        guess: function(filename) {
            return dict[filename.split(".").pop()] || "aplication/octet-stream";
        }
    };
})();