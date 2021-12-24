require('dotenv').config();
const got = require('got');
const {
  CookieJar
} = require('tough-cookie');
const {
  JSDOM
} = require('jsdom');

const fs = require('fs');

const handshakeUrl = 'mypage/handshake-session?lang=id'

const setlist = ['Cara Meminum Ramune', 'Fly! Team T', 'Aturan Anti Cinta', 'Gadis Gadis Remaja', 'Tunas di Balik Seragam', 'Fajar Sang Idola', 'Pajama Drive'];
const YEAR = process.env.YEAR;
const isSetlistName = text => setlist.some(setlistTitle => text ? text.includes(setlistTitle) : '');
const getSetlistName = text => setlist.find(setlistTitle => text.includes(setlistTitle));
const sanitizeName = name => name.split('<')[1].split(',')[1].trim();

class Login {
  constructor() {
    const cookieJar = new CookieJar();
    this.req = got.extend({
      prefixUrl: 'https://jkt48.com',
      cookieJar
    })
    this.username = '';
  }

  hasNextPage = page => {
    try {
      const {
        document
      } = (new JSDOM(page)).window;
    
      const nextElement = document.querySelector('.next');
      const nextLink = nextElement.querySelector('a');
    
      if (nextLink) return true;
      return false;
    } catch (e) {
      return false;
    }
  }

  async login(email, password) {
    try {
      const resp = await this.req.post('login', {
        form: {
          login_id: email,
          login_password: password
        },
      });

      if (resp.body.includes('salah')) {
        throw new Error("Alamat email atau Kata kunci salah");
      }

      fs.writeFileSync('./response.html', resp.body);

      const {
        document
      } = (new JSDOM(resp.body)).window;
      const usernameElement = document.querySelector('.header-global__sp--header').innerHTML
      this.username = sanitizeName(usernameElement);

    } catch (e) {
      if (e && e.options) {
        console.error(e.options);
      } else {
        throw e;
      }
    }
  }

  async getPage(link) {
    try {
      return await this.req.get(link, {
        resolveBodyOnly: true
      });
    } catch (error) {
      if (error && error.options) {
        console.error(error.options);
      } else {
        throw error;
      }
    }
  }

  async getHandshakeList() {
    try {
      return await this.req(handshakeUrl, {
        resolveBodyOnly: true
      });
    } catch (error) {
      if (error && error.options) {
        console.error(error.options);
      } else {
        throw error;
      }
    }
  }

  parseShowTickets(page) {
    try {
      const watchedShows = {};
      const {
        document
      } = (new JSDOM(page)).window;

      fs.writeFileSync('./shows.html', page);

      const rows = Array.from(document.querySelectorAll('tr'));
      rows.shift();

      rows.forEach(row => {
        const datas = Array.from(row.querySelectorAll('td'));
        const date = datas[1].innerHTML;
        const year = date.split(' ')[2];
        const showName = datas[2].innerHTML;
        if (year == YEAR) {
          if (watchedShows[showName]) {
            watchedShows[showName] += 1;
          } else if (isSetlistName(showName)) {
            watchedShows[showName] = 1;
          }
        }
      })

      return watchedShows;
    } catch (error) {
      console.error(error);
    }
  }

  parseEvents(page) {
    try {
      const watchedShows = {};
      const {
        document
      } = (new JSDOM(page)).window;
      const rows = Array.from(document.querySelectorAll('tr'));
      rows.shift();

      rows.forEach(row => {
        const datas = Array.from(row.querySelectorAll('td'));
        const date = datas[2].innerHTML;
        const year = date.split(' ')[2];
        if (year == YEAR) {
          const showName = getSetlistName(datas[1].innerHTML);
          if (watchedShows[showName]) {
            watchedShows[showName] += 1;
          } else if (isSetlistName(showName)) {
            watchedShows[showName] = 1;
          }
        }
      })

      return watchedShows;
    } catch (error) {
      console.error(error);
    }
  }

  parsePoints(page) {
    const {
      document
    } = (new JSDOM(page)).window;

    const rows = Array.from(document.querySelectorAll('tr'));
    rows.shift();

    const pointHistory = rows.map(row => {
      const datas = Array.from(row.querySelectorAll('td'));
      const date = datas[2].innerHTML;
      const year = date.split(' ')[2];
      const changes = datas[5].innerHTML;
      const processedText = changes.split('<br>');
      const bonusPoint = processedText[0].split('Bonus:')[1].trim();
      const bonusPointClean = bonusPoint.substring(1).split('P')[0].trim().replace(/,/g, '');
      const point = processedText[1].split('Buy:')[1].trim();
      const pointOperation = isNaN(point.split('').shift()) ? point.split('').shift() : '';
      const bonusPointOperation = isNaN(bonusPoint.split('').shift()) ? bonusPoint.split('').shift() : '';
      const pointClean = point.substring(1).split('P')[0].trim().replace(/,/g, '');

      const bonusPointNumber = Number(bonusPointClean);
      const pointNumber = Number(pointClean);
      
      return {
        year,
        pointOperation,
        bonusPointOperation,
        bonusPointAmount: bonusPointNumber,
        pointAmount: pointNumber
      }
    })
    
    return pointHistory;
  }

  calculatePoints(points) {
    const totalPoints = points.reduce((prev, cur) => {
      if (cur.pointOperation === '-') {
        return prev;
      } else if (cur.pointOperation === '+') {
        return prev + cur.pointAmount;
      } else {
        return prev;
      }
    }, 0);

    const totalBonusPoints = points.reduce((prev, cur) => {
      if (cur.bonusPointOperation === '-') {
        return prev;
      } else if (cur.bonusPointOperation === '+') {
        return prev + cur.bonusPointAmount;
      } else {
        return prev;
      }
    }, 0);

    return {
      totalPoints,
      totalBonusPoints
    }
  }

  combineShows(shows, events) {
    let combinedShows = [];
    shows.forEach(show => {
      combinedShows = combinedShows.concat(Object.keys(show));
    })
    const showSummary = {};
    const summary = [];
    shows.forEach(show => {
      for(const key in show) {
        showSummary[key] ? showSummary[key] += show[key] : showSummary[key] = show[key];
      }
    });

    for (const key in showSummary) {
      summary.push({
        showName: key,
        sum: showSummary[key]
      });
    };

    summary.sort((a, b) => b.sum - a.sum);
    return summary;
  }

  parseHandshake(page) {
    try {
      const {
        document
      } = (new JSDOM(page)).window;
      const members = {};
      const membersArr = [];

      const elements = document.querySelectorAll('h4');

      elements.forEach(elem => {

        if (elem.innerHTML.includes(YEAR) || (elem.innerHTML.includes("Rapsodi Handshake Event") && YEAR === "2020")) {
          const processYear = elem.innerHTML.split('handshake');
          const year = processYear[1].split("'");
          const id = year[0];
      
          const table = document.querySelector(`#handshake${id}`);
          if (table) {
            const rows = table ? Array.from(table.querySelectorAll('tr')) : null;
            rows.shift();
            rows.forEach(row => {
              const tableDatas = row.querySelectorAll('td');
              if (tableDatas.length > 1) {
                const memberName = tableDatas[tableDatas.length - 3].innerHTML;
                const amount = tableDatas[tableDatas.length - 2].innerHTML;
                if (members[memberName]) {
                  members[memberName] += Number(amount);
                } else if (memberName === '-') {} else {
                  members[memberName] = Number(amount);
                }
              }
            })
          }
        }
      
      })

      for (let key in members) {
        membersArr.push({
          name: key,
          sum: members[key]
        });
      }

      membersArr.sort((a, b) => b.sum - a.sum);

      return membersArr;
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = Login;
