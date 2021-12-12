require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const Login = require('./libraries/loginPage');
const app = express();
const fs = require('fs');
const flatten = require('lodash.flatten');
const {
  createSlug,
  limitText
} = require('./libraries/helpers');
const generateHTML = require('./libraries/html-generator');
const {
  uploadFile
} = require('./libraries/bucketManager');
const generateImage = require('./libraries/image-generator');
const uuid = require('uuid').v4;


const membersJSON = JSON.parse(fs.readFileSync('./members.json', 'utf-8'));
const setlistJSON = JSON.parse(fs.readFileSync('./setlists.json', 'utf-8'));

const ticketListUrl = 'mypage/ticket-list?';
const eventListUrl = 'mypage/event-list?';
const pointHistoryUrl = 'mypage/point-history?';

const YEAR = process.env.YEAR;

app.use(cors());
app.use(helmet());
app.use(compression());

app.enable('trust proxy');

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}))

app.use((req, res, next) => {
  req.uuid = uuid();
  next();
})

app.post('/', async (req, res, next) => {
  const handshakeRanks = [];
  const setlistRanks = [];
  const login = new Login();
  try {
    const {
      email,
      password,
      displayPoints,
    } = req.body;

    await login.login(email, password);
    const pages = await Promise.all([login.getPage(ticketListUrl), login.getPage(eventListUrl), login.getHandshakeList(), login.getPage(pointHistoryUrl)]);
    const showTickets = [pages[0]];
    const events = [pages[1]];
    const points = [pages[3]];
    let ticketListNextPage;
    let eventNextPage;
    let pointsNextPage;
    let i = 0;
    do {
      ticketListNextPage = login.hasNextPage(showTickets[i]);
      eventNextPage = login.hasNextPage(events[i]);
      pointsNextPage = login.hasNextPage(points[i]);
      if (ticketListNextPage) showTickets.push(await login.getPage(`${ticketListUrl}page=${i+2}`));
      if (eventNextPage) events.push(await login.getPage(`${eventListUrl}page=${i+2}`));
      if (pointsNextPage) points.push(await login.getPage(`${pointHistoryUrl}page=${i+2}`));
      i++;
    } while (ticketListNextPage || eventNextPage || pointsNextPage);

    const watchedShows = showTickets.map(show => {
      return login.parseShowTickets(show);
    })

    const watchedEvents = events.map(event => {
      return login.parseEvents(event);
    })

    const point = points.map(point => {
      return login.parsePoints(point);
    })

    const attendance = login.combineShows(watchedShows, watchedEvents);
    const handshakes = login.parseHandshake(pages[2]);
    const pointsThisYearArr = flatten(point).filter( elem => elem.year === YEAR);
    const totalPointsThisYear = login.calculatePoints(pointsThisYearArr);
    const totalPointsAllTime = login.calculatePoints(flatten(point));
    const username = login.username;


    const totalAttendance = `${attendance.reduce((cur, val) => cur + val.sum, 0)} kali`;
    const totalHS = `${handshakes.reduce((cur, val) => cur + val.sum, 0)} tiket`;
    const memberImagebuffers = [];
    const setlistImageBuffers = [];

    if (handshakes.length > 0) {
      const length = handshakes.length > 3 ? 3 : handshakes.length;
      for (let i = 0; i < length; i++) {
        const memberName = handshakes[i].name.split(' ').slice(0, 3).join(' ');
        memberImagebuffers.push(membersJSON[memberName]);
        handshakeRanks.push(`${limitText(memberName)} - ${handshakes[i].sum} kali` || null);
      }
    }

    if (handshakes.length === 0) {
      handshakeRanks.push('Tidak tersedia');
      memberImagebuffers.push(membersJSON.Empty);
    }

    if (attendance.length === 0) {
      setlistRanks.push('Tidak tersedia');
      setlistImageBuffers.push(setlistJSON.Empty);
    }

    if (attendance.length > 0) {
      const length = attendance.length > 3 ? 3 : attendance.length;
      for (let i = 0; i < length; i++) {
        setlistImageBuffers.push(setlistJSON[attendance[i].showName] || null);
        setlistRanks.push(`${attendance[i].showName} - ${attendance[i].sum} kali` || null);
      }
    }

    const slug = createSlug(username);
    const html = await generateHTML({
      slug,
      name: username,
      hsCountText: totalHS,
      setlistCountText: totalAttendance,
      hsImages: memberImagebuffers,
      hsTexts: handshakeRanks,
      setlistImages: setlistImageBuffers,
      setlistTexts: setlistRanks,
      totalPoints: displayPoints ? totalPointsThisYear.totalPoints : null,
    });

    let hsDetailText = handshakeRanks.join('\n');
    let setlistDetailText = setlistRanks.join('\n');

    const image = await generateImage({
      hsDetailText,
      hsImage: memberImagebuffers[0] || membersJSON["Empty"],
      setlistDetailText,
      setlistImage: setlistImageBuffers[0],
      theaterCountText: totalAttendance.toString(),
      hsCountText: totalHS.toString(),
      userNameText: username,
      totalPointsThisYear: displayPoints ? totalPointsThisYear.totalPoints : null,
    });

    fs.writeFileSync(`./share/${slug}.html`, html);
    fs.writeFileSync(`./share/${slug}.png`, image);
    const results = await Promise.all([uploadFile(`share/${slug}.png`, 'image/png', Buffer.from(image)), uploadFile(`share/${slug}.html`, 'text/html', Buffer.from(html))]);
    if (results) {
      res.send({
        resultUrl: `https://${YEAR}.ngidol.club/share/${slug}.html`
      });
    } else {
      res.status(500).send();
      console.error(results);
    }
  } catch (error) {
    console.log(`${req.uuid}: ${login.username}`);
    console.error(error);
    if (error.message === "Alamat email atau Kata kunci salah") {
      error.status = 400;
      next(error);
    }
  }
});

app.use(function (req, res, next) {
  const err = new Error('not found');
  console.log(`${req.uuid}: request url '${req.originalUrl}' not found`)
  err.status = 404;
  next(err);
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  console.log(`${req.uuid}: ${err}`);
  res.status(err.status || 500);
  res.json({
    msg: err.message,
  });
});

module.exports = app;
