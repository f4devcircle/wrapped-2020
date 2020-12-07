const ejs = require('ejs');

/**
 * Generate html share page 
 *
 * @param {Object} data Information that would be generated on html page
 * @param {string} data.slug
 * @param {string} data.name
 * @param {string} data.hsCountText
 * @param {string} data.setlistCountText
 * @param {Array} data.hsImages
 * @param {Array} data.hsTexts
 * @param {Array} data.setlistImages
 * @param {Array} data.setlistTexts
 *
 * @returns {string} html
 */
const generateHTML = async (data) => {
  const html = await ejs.renderFile('./assets/share.ejs', {
    data
  });
  return html;
};

module.exports = generateHTML;