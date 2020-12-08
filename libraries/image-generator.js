const textToImage = require('text-to-image');
const jimp = require('jimp');

/**
 * Generate image for og:image, and write image into folder outputs
 * 
 * @param {Object} data Information that would be generated on image
 * @param {string} data.hsDetailText
 * @param {string} data.setlistDetailText
 * @param {string} data.theaterCountText
 * @param {string} data.userNameText
 * @param {string} data.hsImage in base64
 * @param {string} data.setlistImage in base64
 * 
 * @returns {Buffer} image
 */
const generateImage = async (data) => {
  const hsDetail = await textToImage.generate(data.hsDetailText, {
    margin: 0,
    bgColor: '#ffffff00',
    fontSize: 22,
    fontFamily: 'Roboto',
    fontWeight: 'bold',
  });
  const setlistDetail = await textToImage.generate(data.setlistDetailText, {
    margin: 0,
    bgColor: '#ffffff00',
    fontSize: 22,
    fontFamily: 'Roboto',
    fontWeight: 'bold',
  });
  const hsCount = await textToImage.generate(data.hsCountText, {
    margin: 0,
    bgColor: '#ffffff00',
    fontSize: 58,
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    customHeight: '60',
  });
  const theaterCount = await textToImage.generate(data.theaterCountText, {
    margin: 0,
    bgColor: '#ffffff00',
    fontSize: 58,
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    customHeight: '60',
  });
  const userName = await textToImage.generate(data.userNameText, {
    margin: 0,
    bgColor: '#ffffff00',
    textColor: '#ffffff',
    fontSize: 30,
    fontFamily: 'Roboto',
    maxWidth: 700,
    customHeight: 40
  });

  const baseImage = await jimp.read('./assets/base.png');
  const hsImage = await jimp.read(Buffer.from(data.hsImage, 'base64'))
  const setlistImage = await jimp.read(Buffer.from(data.setlistImage, 'base64'))

  hsImage.crop(0, 0, hsImage.getWidth(), hsImage.getWidth())
    .circle();
  setlistImage.crop(0, 0, setlistImage.getWidth(), setlistImage.getWidth())
    .circle();

  const image = await baseImage
    .composite(hsImage.resize(270, 270), 70, 180)
    .composite(setlistImage.resize(270, 270), 460, 180)
    .composite(await jimp.read(Buffer.from((hsDetail.split(','))[1], 'base64')), 70, 465)
    .composite(await jimp.read(Buffer.from((setlistDetail.split(','))[1], 'base64')), 460, 465)
    .composite(await jimp.read(Buffer.from((hsCount.split(','))[1], 'base64')), 824, 135)
    .composite(await jimp.read(Buffer.from((theaterCount.split(','))[1], 'base64')), 824, 275)
    .composite(await jimp.read(Buffer.from((userName.split(','))[1], 'base64')), 145, 585)
    .getBufferAsync(jimp.MIME_PNG);

  return image;
};

module.exports = generateImage;