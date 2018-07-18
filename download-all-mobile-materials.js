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
    fsImpl = new S3FS('test-bucket', config),
    Promise = require("bluebird"),
    fs = Promise.promisifyAll(require("fs")),
    path = require('path'),
    baseDir = path.join('mobile-materials'),
    dirs = [];

fs.mkdir('mobile-materials', async function (data) {
    console.log('mobile-materials Created');
    await fsImpl.readdir(baseDir).map(function (filename) {
        dirs.push(path.join(baseDir, filename));
    })
        .then(function () {
            Promise.map(dirs, function (dir) {
                return new Promise((resolve, reject) => {

                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir);
                    }

                    fsImpl.readdir(dir, (err, files) => {
                        if (!files) {
                            console.log('dir is empty');
                            return;
                        }
                        console.log('start dir', dir);

                        files.forEach(async file => {
                            let dataFile = await fsImpl.readFile(path.join(dir, file));
                            console.log('        Downloading.....    ', path.join(dir, file));
                            fs.writeFileSync(path.join(dir, file), dataFile.Body);
                        });

                        resolve();
                    })
                })

            }, {concurrency: 1});
        });
}, function (reason) {
    console.log('something went wrong', reason);
});