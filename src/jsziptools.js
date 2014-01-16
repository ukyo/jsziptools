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
