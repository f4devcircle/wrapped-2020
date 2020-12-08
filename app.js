const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const Login = require('./libraries/loginPage');
const app = express();
const fs = require('fs');
const htmlGenerator = require('./libraries/html-generator');
const imageGenerator = require('./libraries/image-generator');
const {
  createSlug
} = require('./libraries/helpers');
const generateHTML = require('./libraries/html-generator');
const {
  uploadFile
} = require('./libraries/bucketManager');
const generateImage = require('./libraries/image-generator');

const membersJSON = JSON.parse(fs.readFileSync('./members.json', 'utf-8'));
const setlistJSON = JSON.parse(fs.readFileSync('./setlists.json', 'utf-8'));

app.use(cors());
app.use(helmet());
app.use(compression());

app.enable('trust proxy');

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}))

app.get('/', function (req, res) {
  const {
    body
  } = req;

  res.json({
    resultUrl: 'https://google.com',
  });
});

app.post('/login', async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body;

    const login = new Login();
    await login.login(email, password);
    const pages = await Promise.all([login.getTicketList(), login.getEventlist(), login.getHandshakeList()]);
    const attendance = login.combineShows(login.parseShowTickets(pages[0]), login.parseEvents(pages[1]));
    const handshakes = login.parseHandshake(pages[2]);


    const totalAttendance = attendance.reduce((cur, val) => cur + val.sum, 0);
    const totalHS = handshakes.reduce((cur, val) => cur + val.sum, 0);
    const memberImagebuffers = [];
    const setlistImageBuffers = [];
    const handshakeRanks = [];
    const setlistRanks = [];

    for (let i = 0; i < 3; i++) {
      const memberName = handshakes[i].name.split(' ').slice(0, 3).join(' ');
      memberImagebuffers.push(membersJSON[memberName]);
      setlistImageBuffers.push(setlistJSON[attendance[i].showName] || null);
      handshakeRanks.push(`${memberName} - ${handshakes[i].sum} kali` || null);
      setlistRanks.push(`${attendance[i].showName} - ${attendance[i].sum} kali` || null);
    }

    const slug = createSlug('naskapal');
    const html = await generateHTML({
      slug,
      name: 'naskapal',
      hsCountText: totalHS,
      setlistCountText: totalAttendance,
      hsImages: memberImagebuffers,
      hsTexts: handshakeRanks,
      setlistImages: setlistImageBuffers,
      setlistTexts: setlistRanks
    });

    let hsDetailText = handshakeRanks.join('\n');
    let setlistDetailText = setlistRanks.join('\n');

    const image = await generateImage({
      hsDetailText,
      hsImage: memberImagebuffers[0],
      setlistDetailText,
      setlistImage: setlistImageBuffers[0],
      theaterCountText: totalAttendance.toString(),
      hsCountText: totalHS.toString(),
      userNameText: 'naskapal'
    });

    const results = await Promise.all([uploadFile(`share/${slug}.png`, 'image/png', Buffer.from(image)), uploadFile(`share/${slug}.html`, 'text/html', Buffer.from(html))]);
    if (results) {
      res.send({
        resultUrl: `https://2020.ngidol.club/share/${slug}.html`
      });
    } else {
      console.error(result);
    }
  } catch (error) {
    console.error(error);
  }
});

app.use(function (req, res, next) {
  const err = new Error('not found');
  err.status = 404;
  next(err);
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  console.log(err);
  res.status(err.status || 500);
  res.json({
    error: err,
  });
});

module.exports = app;