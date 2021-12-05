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

const setlist = ['Cara Meminum Ramune', 'Fly! Team T', 'Aturan Anti Cinta', 'Gadis Gadis Remaja', 'Tunas di Balik Seragam'];
const CURRENT_YEAR = 2021;
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
      console.log('element not found for function hasNextPage, returning false')
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
        if (year == CURRENT_YEAR) {
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
        if (year == CURRENT_YEAR) {
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

  combineShows(shows, events) {
    const showNamesArr = shows.map(show => Object.keys(show)).reduce( (prev, cur) => cur ? prev.concat(cur) : prev, [] );
    // const showNamesArr = Object.keys(shows).concat(Object.keys(events));
    const showNames = new Set(shows);
    const summary = [];
    showNames.forEach(showName => {
      summary.push({
        showName,
        sum: (shows[showName] || null) + (events[showName] || null) // so that it not return undefined if not found
      })
    });

    summary.sort((a, b) => b.sum - a.sum);
    return summary;
  }

  parseHandshake(page) {
    try {
      const {
        document
      } = (new JSDOM(page)).window;
      // to get table id, because jeketi categorizes based on id, for VC, id is sepearated by day
      const firstHandshakeId = 150;
      const lastHandshakeId = 246;
      const members = {};
      const membersArr = [];

      fs.writeFileSync('./handshakes.html', page);

      for (let id = firstHandshakeId; id <= lastHandshakeId; id++) {
        const table = document.querySelector(`#handshake${id}`);
        if (table) {
          const rows = table ? Array.from(table.querySelectorAll('tr')) : null;
          rows.shift();
          rows.forEach(row => {
            const tableDatas = row.querySelectorAll('td');
            const memberName = tableDatas[tableDatas.length - 3].innerHTML;
            const amount = tableDatas[tableDatas.length - 2].innerHTML;
            if (members[memberName]) {
              members[memberName] += Number(amount);
            } else if (memberName === '-') {} else {
              members[memberName] = Number(amount);
            }
          })
        }
      }

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
