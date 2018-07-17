var S3FS = require('s3fs');
var fs = require('fs');
var path = require('path');

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

fsImpl.mkdirp('mobile-materials').then(function(data) {
    console.log('mobile-materials Created');

    fs.readdir('mobile-materials', (err, dirs) => {
        if (err) return;

        if (!dirs) {
            console.log('dir is empty');
            return;
        }
        console.log(dirs.length);

        dirs.forEach((dir,tick)=>{
            let stats = fs.statSync(`mobile-materials/${dir}`);
            if (stats.isDirectory()) {
                let files = fs.readdirSync(`mobile-materials/${dir}`);

                if (err) throw err;
                if (!files) {
                    console.log(files,' - erorr dir is empty');
                    return;
                }
                files.forEach(async file => {
                    await fsImpl.writeFile(path.join('mobile-materials', dir, file), fs.readFileSync(path.join('mobile-materials', dir, file)), (err) => {
                        if (err) throw err;
                        // console.log('The file has been saved!');
                    });
                });
            }
            // global.gc();
            // console.log('Memory usage:', process.memoryUsage());
        });
    });

    // fsImpl.readdir('mobile-materials').then(function(files) {
    //     console.log(files);
    //     // Files contains a list of all of the files similar to [`fs.readdir(path, callback)`](http://nodejs.org/api/fs.html#fs_fs_readdir_path_callback) but with recursive contents
    // }, function(reason) {
    //     // Something went wrong
    // });
}, function(reason) {
    console.log('something went wrong', reason);
});
