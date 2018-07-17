const { S3 } = require('aws-sdk');
var S3FS = require('s3fs');
var fs = require('fs');

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
const s3Client = new S3(config);

const encodedSearch =
    encodeURIComponent('x-amz-meta-color="blue"');


var fsImpl = new S3FS('test-bucket', config);

// fsImpl.create().then(function() {
//     const req = s3Client.listObjects({ Bucket: 'test-bucket' });

//     req.on('build', () => {
//         req.httpRequest.path = `${req.httpRequest.path}?search=${encodedSearch}`;
//     });
//     req.on('success', res => {
//         process.stdout.write(`Result ${res.data}`);
//     });
//     req.on('error', err => {
//         process.stdout.write(`Error ${err}`);
//     });
//     req.send();

// }, function(reason) {
//     // Something went wrong
// });

fsImpl.mkdirp('mobile-materials').then(function(data) {
    console.log('mobile-materials Created');
}, function(reason) {
    console.log('something went wrong', reason);
});

// fsImpl.copyDir('mobile-materials', 'mobile-materials').then(function() {
//     console.log('ok');
// }, function(reason) {
//     console.log('something went wrong', reason);
// });

// fsImpl.mkdirp('mobile-materials/com.yclients.mobile.g10011').then(function(data) {
//     console.log('ok');
//     console.log(data);
// }, function(reason) {
//     console.log('something went wrong', reason);
// });

fsImpl.readdirp('/mobile-materials').then(function(files) {
    //console.log(files);
    fsImpl.listContents(`/mobile-materials/${files[0]}`).then(function(files) {
        // console.log(files);
        // Files contains a list of all of the files similar to [`fs.readdir(path, callback)`](http://nodejs.org/api/fs.html#fs_fs_readdir_path_callback) but with recursive contents
    }, function(reason) {
        // Something went wrong
    });
        
}, function(reason) {
    // Something went wrong
});

fsImpl.listContents('mobile-materials/com.yclients.mobile.g10011/').then(function(files) {
    // console.log(files);
    files.forEach((file) => {
        console.log(file.LastModified);
    })
    // Files contains a list of all of the files similar to [`fs.readdir(path, callback)`](http://nodejs.org/api/fs.html#fs_fs_readdir_path_callback) but with recursive contents
}, function(reason) {
    // Something went wrong
});

// fs.readdir('mobile-materials/com.yclients.mobile.g10011', (err, files) => {
//     if (!files) {
//         console.log('dir is empty');
//         return;
//     }
//     files.forEach(file => {
//       console.log(file);
//       let dataFile = fs.readFileSync(`mobile-materials/com.yclients.mobile.g10011/${file}`);
//       fsImpl.writeFile(`mobile-materials/com.yclients.mobile.g10011/${file}`, dataFile, (err) => {
//         if (err) throw err;
//         console.log('The file has been saved!');
//       });
//     });
//   })


// fsImpl.writeFile('/mobile-materials/com.yclients.mobile.g10011/', 'Hello Node.js', (err) => {
//     if (err) throw err;
//     console.log('The file has been saved!');
//   });

fsImpl.readdir('mobile-materials/com.yclients.mobile.g10011', (err, files) => {
    return 0;
    if (err) throw err;
    if (!files) {
        console.log('dir is empty');
        return;
    }
    if (!fs.existsSync(`mobile-materials/com.yclients.mobile.g10011`)){
        fs.mkdirSync(`mobile-materials/com.yclients.mobile.g10011`);
    }

    files.forEach(file => {
      console.log(file);
      fsImpl.readFile(`mobile-materials/com.yclients.mobile.g10011/${file}`, (err, data) => {
          if(err) throw err;
          if(!data) throw err;
        fs.writeFileSync(`mobile-materials/com.yclients.mobile.g10011/${file}`, data, (err) => {
            if (err) throw err;
            console.log('The file has been saved!');
          });
      })
    });
});
