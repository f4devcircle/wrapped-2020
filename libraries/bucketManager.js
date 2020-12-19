const { Storage } = require('@google-cloud/storage');
const storage = new Storage();
const bucket = storage.bucket('2020.ngidol.club');

module.exports.uploadFile = (filename, contentType, buffer) => {
  const file = bucket.file(filename);
  return file.save(buffer, {
    metadata: {
      contentType: contentType
    },
    resumable: false
  })
}