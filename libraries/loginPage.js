require('dotenv').config();
const got = require('got');
const {
  CookieJar
} = require('tough-cookie');
const {
  JSDOM
} = require('jsdom');

const ticketListUrl = 'mypage/ticket-list?lang=id';
const eventList = 'mypage/event-list?lang=id';

const {
  bootstrap
} = require('global-agent');
bootstrap();


class Login {
  constructor() {
    const cookieJar = new CookieJar();
    this.req = got.extend({
      prefixUrl: 'https://jkt48.com',
      cookieJar
    })
  }

  async login(email, password) {
    try {
      return await this.req.post('login', {
        form: {
          login_id: email,
          login_password: password
        },
      });
    } catch (e) {
      if (e && e.options) {
        console.error(e.options);
      } else {
        console.error(e);
      }
    }
  }

  async getTicketList() {
    try {
      return await this.req.get(ticketListUrl, {
        resolveBodyOnly: true
      });
    } catch (error) {}
  }

  parseMyPage(page) {
    try {
      const {
        document
      } = (new JSDOM(page)).window;

      const validTransactions = [];

      const rows = Array.from(document.querySelectorAll('tr'));
      rows.shift();

      rows.forEach(row => {
        const datas = Array.from(row.querySelectorAll('td'));
        const date = datas[2].innerHTML;
        const year = date.split(' ')[2];
        if (year == 2020) {
          validTransactions.push(row);
        }
      })
      // use .innerHTML to view inner data
      console.log(validTransactions);
    } catch (e) {
      console.error(e);
    }
  }
}