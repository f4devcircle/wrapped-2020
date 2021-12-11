require('dotenv').config;
const {
  Storage
} = require('@google-cloud/storage');
const storage = new Storage();
const bucket = storage.bucket(`${process.env.YEAR}.ngidol.club`);

module.exports.uploadFile = async (filename, contentType, buffer) => {
  const file = bucket.file(filename);
  return await file.save(buffer, {
    metadata: {
      contentType: contentType
    },
    resumable: false
  })
}
