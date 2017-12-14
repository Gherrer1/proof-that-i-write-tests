const request = require('supertest');
const app = require('../../../src/app');

function simulateLogIn(fname = 'sato') {
  return new Promise(function(resolve, reject) {
    request(app).post('/login')
      .send({ email: `${fname}@email.com`, password: '1111111111' })
      .end(function(err, res) {
        if(err)
          return reject(err);
        const cookie = res.headers['set-cookie'][0];
        const cookieMainMeat = cookie.split(';')[0];
        resolve(cookieMainMeat);
      });
  });
}

module.exports = {
	simulateLogIn
};