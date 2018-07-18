var S3FS = require('s3fs'),
    Promise = require("bluebird"),
    fs = Promise.promisifyAll(require("fs")),
    path = require('path'),
    baseDir = path.join('mobile-materials'),
    dirs = [];

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
const exampleResponse = {
    AcceptRanges: "bytes",
    LastModified: "Tue, 17 Jul 2018 12:59:21 GMT",
    ContentLength: "326682",
    ETag: "d98bba2a9a71958f0499afb85aba868e",
    ContentType: "application/octet-stream",
    WebsiteRedirectLocation: "",
    Metadata: {},
    Body: "<Buffer 7b 0a 20 20 20 22 6e 61 6d 65 22 3a 20... >"
};
const lastUpdatedTime = fs.readFileSync('last-updated-time.txt','utf8');
const fsImpl = new S3FS('test-bucket', config);

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

                    fsImpl.readdir(dir, async (err, files) => {
                        if (!files) {
                            console.log('dir is empty');
                            return;
                        }
                        console.log('start dir', dir);

                        await files.forEach(async file => {
                            let headFile = await fsImpl.headObject(path.join(dir, file));
                            if (lastUpdatedTime < (new Date(headFile.LastModified)).getTime()) {
                                let dataFile = await fsImpl.readFile(path.join(dir, file));
                                console.log('        Downloading.....    ', path.join(dir, file));
                                await fs.writeFileSync(path.join(dir, file), dataFile.Body);
                            }
                        });

                        resolve();
                    })
                })

            }, {concurrency: 1}).then(() => {
                console.log('FINALLL');
                fs.writeFileSync('last-updated-time.txt', Date.now());
            });
        });
}, function (reason) {
    console.log('something went wrong', reason);
});