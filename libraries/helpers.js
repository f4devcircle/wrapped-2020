const uuid = require('uuid').v4;

const createSlug = (name) => {
	const randomString = (uuid().split('-'))[4];
	const slug = `${name.toLowerCase().replace(/ /g,'-').replace(/[^\w-]+/g,'')}-${randomString}`;
	return slug;
}

module.exports = {
	createSlug,
};
