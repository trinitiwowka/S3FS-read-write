var fs = require('fs');
var S3FS = require('s3fs');

const config = {
    sslEnabled: false,
    endpoint: 'http://127.0.0.1:8000',
    signatureCache: false,
    signatureVersion: 'v4',
    region: 'us-east-1',
    s3ForcePathStyle: true,
    accessKeyId: 'accessKey1',
    secretAccessKey: 'verySecretKey1',
};
var fsImpl = new S3FS('test-bucket', config);

var walk = function(dir, done) {
    var results = [];
    fs.readdir(dir, function(err, list) {
        if (err) return done(err);
        var i = 0;
        (function next() {
            var file = list[i++];
            if (!file) return done(null, results);
            file = dir + '/' + file;
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function(err, res) {
                        results = results.concat(res);
                        next();
                    });
                } else {
                    results.push(file);
                    next();
                }
            });
        })();
    });
};

walk('mobile-materials', function(err, results) {
    if (err) throw err;
    console.log(results);

    results.forEach(path => {
        fsImpl.writeFile(path, fs.readFileSync(path), (err) => {
            if (err) throw err;
            console.log(`The file ${file} has been saved!`);
        });
    });
});