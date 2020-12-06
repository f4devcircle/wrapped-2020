const textToImage = require('text-to-image');
const jimp = require('jimp');

const generateTexts = async (data) => {
	try {
		const hsDetail = await textToImage.generate('Marsha Lenathea - 18x\nIndah Cahya Nabilla - 10x\nAdzana Shaliha - 5x', {
			margin: 0,
			bgColor: '#ffffff00',
			fontSize: 22,
			fontFamily: 'Roboto',
			fontWeight: 'bold',
		});
		const setlistDetail = await textToImage.generate('Cara Meminum Ramune - 18x\nPajama Drive - 10x\n', {
			margin: 0,
			bgColor: '#ffffff00',
			fontSize: 22,
			fontFamily: 'Roboto',
			fontWeight: 'bold',
		});
		const hsCount = await textToImage.generate('120 TIKET', {
			margin: 0,
			bgColor: '#ffffff00',
			fontSize: 58,
			fontFamily: 'Roboto',
			fontWeight: 'bold',
			customHeight: '60',
		});
		const theaterCount = await textToImage.generate('8 KALI', {
			margin: 0,
			bgColor: '#ffffff00',
			fontSize: 58,
			fontFamily: 'Roboto',
			fontWeight: 'bold',
			customHeight: '60',
		});	
		const totalExpense = await textToImage.generate('Rp 18.000.000', {
			margin: 0,
			bgColor: '#ffffff00',
			fontSize: 50,
			fontFamily: 'Roboto',
			fontWeight: 'bold',
			customHeight: '50',
		});	
		const userName = await textToImage.generate('Cindy Hapsari Maharani Pujiantoro Putri', {
			margin: 0,
			bgColor: '#ffffff00',
			textColor: '#ffffff',
			fontSize: 30,
			fontFamily: 'Roboto',
			maxWidth: 700,
		});

		const baseImage = await jimp.read('base.png');
		const hsImage = await jimp.read('marsha.jpg');
		const setlistImage = await jimp.read('ramune.jpg');
		
		hsImage.crop(0, 0, hsImage.getWidth(), hsImage.getWidth())
			.circle();
		setlistImage.crop(0, 0, setlistImage.getWidth(), setlistImage.getWidth())
			.circle();

		await baseImage
			.composite(hsImage.resize(270, 270), 70, 180)
			.composite(setlistImage.resize(270, 270), 460, 180)
			.composite(await jimp.read(Buffer.from((hsDetail.split(','))[1], 'base64')), 70, 465)
			.composite(await jimp.read(Buffer.from((setlistDetail.split(','))[1], 'base64')), 460, 465)
			.composite(await jimp.read(Buffer.from((hsCount.split(','))[1], 'base64')), 824, 135)
			.composite(await jimp.read(Buffer.from((theaterCount.split(','))[1], 'base64')), 824, 275)
			.composite(await jimp.read(Buffer.from((totalExpense.split(','))[1], 'base64')), 824, 420)
			.composite(await jimp.read(Buffer.from((userName.split(','))[1], 'base64')), 145, 585)
			.write('modified-jimp.png');

	} catch (error) {
		console.log(error);
	}
};

generateTexts();
