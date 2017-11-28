const puppeteer = require('puppeteer');
const seed = require('../../seed');
const app = require('../../src/app');


describe.only('#Flows', function() {
    let page, browser;
    const width = 1920;
    const height = 1080;
    /* before ALL tests*/
    before(async function() {
      this.timeout(10000);
      const browserConfig = { headless: true };
      if(!browserConfig.headless) {
        browserConfig.slowMo = 80;
        browserConfig.args = [`--window-size=${width},${height}`]
      }
      browser = await puppeteer.launch(browserConfig);
      page = await browser.newPage();
      await page.setViewport({ width, height });
    });
    /* after ALL test */
    after(async function() {
      await browser.close();
    });

    beforeEach(function(done) {
      seed.seed()
      .then(done, done);
    });

    it('successful POST /login -> GET /dashboard, then GET /login --redirect--> GET /dashboard because already signed in', async function() {
      this.timeout(17000);
      var server = app.listen(3000);
      await page.goto('http://localhost:3000/login');
      await page.waitForSelector('#emailInput');
      await page.type('#emailInput', 'sato@email.com');
      await page.type('#passwordInput', '1111111111');
      await page.click('#submitInput');
      await page.waitForSelector('#welcome');
      await page.goto('http://localhost:3000/login');
      // by waiting for #welcome, we're really expecting to be redirected back to /dashboard
      await page.waitForSelector('#welcome', { timeout: 2000 });
      server.close();
    });
    it('should allow me to go to /login from the start of this test (i know, testing a test, but its really for my confidence in the future)', async function() {
      this.timeout(5000);
      var server = app.listen(3000);
      await page.goto('http://localhost:3000/login');
      await page.waitForSelector('#emailInput', { timeout: 1500 });
      server.close();
    });
    it('should redirect from /signup to /dashboard if user is already logged in (we are gonna log in first)', async function() {

    });
});
