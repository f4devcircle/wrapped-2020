const uuid = require('uuid').v4;
const limitCharacters = require('limit-characters');

const createSlug = (name) => {
  const randomString = (uuid().split('-'))[4];
  const slug = `${name.toLowerCase().replace(/ /g,'-').replace(/[^\w-]+/g,'')}-${randomString}`;
  return slug;
};

const limitText = (originalText, length = 20) => limitCharacters.default({
  text: originalText,
  breakWord: false,
  length,
  more: ''
});

module.exports = {
  createSlug,
  limitText,
};
