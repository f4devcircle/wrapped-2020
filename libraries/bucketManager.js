const {
  Storage
} = require('@google-cloud/storage');
const storage = new Storage({
  keyFile: './keyfile.json'
});
const bucket = storage.bucket('2020.ngidol.club');
const {
  Readable
} = require('stream');

module.exports.uploadFile = (filename, contentType, buffer) => {
  const file = bucket.file(filename);
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  readable
    .pipe(file.createWriteStream({
      contentType
    }))
    .on('error', function (err) {
      console.error(err);
    })
    .on('finish', function () {
      console.log(`upload file ${filename} finished`);
    });
}