const config = {
    sslEnabled: false,
    endpoint: 'http://127.0.0.1:8001',
    signatureCache: false,
    signatureVersion: 'v4',
    region: 'us-east-1',
    s3ForcePathStyle: true,
    accessKeyId: 'accessKey1',
    secretAccessKey: 'verySecretKey1',
};

var S3FS = require('s3fs'),
    Promise = require("bluebird"),
    fs = Promise.promisifyAll(require("fs")),
    path = require('path'),
    fsImpl = new S3FS('test-bucket', config),
    baseDir = path.join('mobile-materials'),
    dirs = [];

fsImpl.mkdirp('mobile-materials').then(function (data) {
    console.log('mobile-materials Created');

    fs.readdirAsync(baseDir).map(function (filename) {
        let fileErr = path.resolve(baseDir, filename)
        let stat = fs.statSync(fileErr);
        if (!stat || !stat.isDirectory()) {
            return;
        }
        dirs.push(path.join(baseDir, filename));
    })
        .then(function () {
            Promise.map(dirs, function (dir) {
                return new Promise((resolve, reject) => {

                    fs.readdir(dir, (err, files) => {
                        if (!files) {
                            console.log('dir is empty');
                            return;
                        }
                        console.log('start dir', dir);

                        files.forEach(file => {
                            let dataFile = fs.readFileSync(path.join(dir, file));
                            console.log('        Uploading.....    ', path.join(dir, file));
                            fsImpl.writeFile(path.join(dir, file), dataFile, (err) => {
                                if (err) throw err;
                                // console.log('The file has been saved!');
                            });
                        });

                        resolve();
                    })
                })

            }, {concurrency: 1});
        });
}, function (reason) {
    console.log('something went wrong', reason);
});
