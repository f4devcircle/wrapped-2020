require('dotenv').config();
const YEAR = process.env.YEAR;
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
const { main } = require('./image_generator');



// const membersJSON = JSON.parse(fs.readFileSync(`./members_${YEAR}.json`, 'utf-8'));
// const setlistJSON = JSON.parse(fs.readFileSync(`./setlists_${YEAR}.json`, 'utf-8'));

const ticketListUrl = 'mypage/ticket-list?';
const eventListUrl = 'mypage/event-list?';
const pointHistoryUrl = 'mypage/point-history?';
const mypageUrl = 'mypage?';


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
    const pages = await Promise.all([login.getPage(ticketListUrl), login.getPage(eventListUrl), login.getHandshakeList(), login.getPage(pointHistoryUrl), login.getPage(mypageUrl)]);
    const showTickets = [pages[0]];
    const events = [pages[1]];
    const points = [pages[3]];
    const oshi = pages[4];
    let ticketListNextPage;
    let eventNextPage;
    let pointsNextPage;
    const username = login.username;
    const slug = createSlug(username);


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

    const winnings = showTickets.map(show => {
      return login.parseWinnings(show);
    })

    const watchedEvents = events.map(event => {
      return login.parseEvents(event);
    })

    const point = points.map(point => {
      return login.parsePoints(point);
    })

    const oshiPhotoUrl = login.parseOshi(oshi);
    const attendance = login.combineShows(watchedShows, watchedEvents);
    const handshakes = login.parseHandshake(pages[2]);
    const pointsThisYearArr = flatten(point).filter( elem => elem.year === YEAR);
    const totalPointsThisYear = login.calculatePoints(pointsThisYearArr);
    const totalPointsAllTime = login.calculatePoints(flatten(point));
    const attendanceCount = attendance.reduce((prev, cur) => {
      return prev + cur.sum;
    }, 0);
    const totalVc = handshakes.reduce((prev, cur) => {
      return prev + cur.sum;
    }, 0);
    const winSummary = winnings.reduce((prev, cur) => {
      return { winCount: prev.winCount + cur.winCount, lostCount: prev.lostCount + cur.lostCount }
    }, {winCount: 0, lostCount: 0});

    const data = {
      username,
      setlistRanks: attendance,
      vcRanks: handshakes,
      vcAmount: totalVc,
      attendanceAmount: attendanceCount,
      winAmount: winSummary.winCount,
      lostAmount: winSummary.lostCount,
      totalTopup: totalPointsThisYear.totalPoints,
      generatePoints: displayPoints,
      oshi: oshiPhotoUrl,
      filename: slug,
    }

    main(data);

    console.log(username);
    console.log(`YEAR : ${YEAR} : ${req.uuid}: ${JSON.stringify(totalPointsThisYear)}`);

    const totalAttendance = `${attendance.reduce((cur, val) => cur + val.sum, 0)} kali`;
    const totalHS = `${handshakes.reduce((cur, val) => cur + val.sum, 0)} tiket`;
    const memberImagebuffers = [];
    const setlistImageBuffers = [];

    // if (handshakes.length > 0) {
    //   const length = handshakes.length > 3 ? 3 : handshakes.length;
    //   console.log(`YEAR : ${YEAR} : ${req.uuid}: ${JSON.stringify(handshakes)}`);
    //   for (let i = 0; i < length; i++) {
    //     const memberName = handshakes[i].name.split(' ').slice(0, 3).join(' ');
    //     memberImagebuffers.push(membersJSON[memberName]);
    //     handshakeRanks.push(`${limitText(memberName)} - ${handshakes[i].sum} kali` || null);
    //   }
    // }

    // if (handshakes.length === 0) {
    //   handshakeRanks.push('Tidak tersedia');
    //   memberImagebuffers.push(membersJSON.Empty);
    // }

    // if (attendance.length === 0) {
    //   setlistRanks.push('Tidak tersedia');
    //   setlistImageBuffers.push(setlistJSON.Empty);
    // }

    // if (attendance.length > 0) {
    //   console.log(`YEAR : ${YEAR} : ${req.uuid}: ${JSON.stringify(attendance)}`);
    //   const length = attendance.length > 3 ? 3 : attendance.length;
    //   for (let i = 0; i < length; i++) {
    //     setlistImageBuffers.push(setlistJSON[attendance[i].showName] || null);
    //     setlistRanks.push(`${attendance[i].showName} - ${attendance[i].sum} kali` || null);
    //   }
    // }

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

    // const image = await generateImage({
    //   hsDetailText,
    //   hsImage: memberImagebuffers[0] || membersJSON["Empty"],
    //   setlistDetailText,
    //   setlistImage: setlistImageBuffers[0],
    //   theaterCountText: totalAttendance.toString(),
    //   hsCountText: totalHS.toString(),
    //   userNameText: username,
    //   totalPointsThisYear: displayPoints ? totalPointsThisYear.totalPoints : null,
    // });

    fs.writeFileSync(`./share/${slug}.html`, html);
    const image = fs.readFileSync(`./share/${slug}.png`);

    const results = await Promise.all([uploadFile(`share/${slug}.png`, 'image/png', Buffer.from(image)), uploadFile(`share/${slug}.html`, 'text/html', Buffer.from(html))]);
    if (results) {
      res.send({
        resultUrl: `https://${YEAR}.ngidol.club/share/${slug}.html`
      });
    } else {
      res.status(500).send();
      console.error(results);
    }
    fs.unlinkSync(`./share/${slug}.html`, html);
    fs.unlinkSync(`./share/${slug}.png`);
  } catch (error) {
    console.log(`${req.uuid}: ${login.username}`);
    console.error(error);
    if (error.message === "Alamat email atau Kata kunci salah") {
      error.status = 400;
      next(error);
    }
    if (error.message === "Gagal karena OFC expired, mohon untuk memperbarui OFC terlebih dahulu") {
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
