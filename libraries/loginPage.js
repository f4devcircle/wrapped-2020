const got = require('got');
const { CookieJar } = require('tough-cookie');
const { JSDOM } = require('jsdom');

const ticketListUrl = 'mypage/ticket-list?lang=id';
const eventListUrl = 'mypage/event-list?lang=id';
const handshakeUrl = 'mypage/handshake-session?lang=id'

const setlist = ['Saka Agari', 'Matahari Milikku', 'Pajama Drive', 'Fajar Sang Idola', 'Cara Meminum Ramune', 'Fly! Team T'];

const isSetlistName = text => setlist.some(setlistTitle => text ? text.includes(setlistTitle) : '');
const getSetlistName = text => setlist.find(setlistTitle => text.includes(setlistTitle));

class Login {
  constructor() {
    const cookieJar = new CookieJar();
    this.req = got.extend({
      prefixUrl: 'https://jkt48.com',
      cookieJar
    })
    this.username = '';
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

      const { document } = (new JSDOM(resp.body)).window;
      this.username = document.querySelector('.pinx').innerHTML;

    } catch (e) {
      if (e && e.options) {
        console.error(e.options);
      } else {
        throw e;
      }
    }
  }

  getTicketList() {
    try {
      return this.req.get(ticketListUrl, {
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

  getEventlist() {
    try {
      return this.req.get(eventListUrl, {
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

  getHandshakeList() {
    try {
      return this.req(handshakeUrl, {
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

      const rows = Array.from(document.querySelectorAll('tr'));
      rows.shift();

      rows.forEach(row => {
        const datas = Array.from(row.querySelectorAll('td'));
        const date = datas[2].innerHTML;
        const year = date.split(' ')[2];
        const showName = datas[1].innerHTML;
        if (year == 2020) {
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
        if (year == 2020) {
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
    const showNamesArr = Object.keys(shows).concat(Object.keys(events));
    const showNames = new Set(showNamesArr);
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
      const firstHandshakeId = 68;
      const lastHandshakeId = 147;
      const members = {};
      const membersArr = [];

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