const puppeteer = require('puppeteer');
const seed = require('../../seed');
const app = require('../../src/app');


describe.only('#Flows', function() {
    var server = app.listen(3000);
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
      server.close();
      await browser.close();
    });

    beforeEach(function(done) {
      seed.seed()
      .then(done, done);
    });

    it('successful POST /login -> GET /dashboard, then GET /login --redirect--> GET /dashboard because already signed in', async function() {
      this.timeout(17000);
      await page.goto('http://localhost:3000/login');
      await page.waitForSelector('#emailInput');
      await page.type('#emailInput', 'sato@email.com');
      await page.type('#passwordInput', '1111111111');
      await page.click('#submitInput');
      await page.waitForSelector('#welcome');
      await page.goto('http://localhost:3000/login');
      // by waiting for #welcome, we're really expecting to be redirected back to /dashboard
      await page.waitForSelector('#welcome', { timeout: 2000 });
    });
    it('should allow me to go to /login from the start of this test (i know, testing a test, but its really for my confidence in the future)', async function() {
      this.timeout(5000);
      await page.goto('http://localhost:3000/login');
      await page.waitForSelector('#emailInput', { timeout: 1500 });
    });
    it('should redirect from /signup to /dashboard if user is already logged in (we are gonna log in first)', async function() {
      this.timeout(10000);
      await page.goto('http://localhost:3000/login');
      await page.waitForSelector('#emailInput');
      await page.type('#emailInput', 'sato@email.com');
      await page.type('#passwordInput', '1111111111');
      await page.click('#submitInput');
      await page.waitForSelector('#welcome');
      await page.goto('http://localhost:3000/signup');
      // by waiting for #welcome, we're really expecting to be redirected back to /dashboard
      await page.waitForSelector('#welcome', { timeout: 3000 });
    });
    it.only('should redirect to /dashboard with over_limit flash if user has 10 active listings when we POST /listings or GET /listings/new', async function() {
      this.timeout(60000);
      await login(page);
      for(let i = 0; i < 10; i++) {
        await createListing(page);
      }
      // on the 11th, we should be directed to /dashboard on GET /lstings/new
      await page.click('a[href="/listings/new"]');
      await page.waitForSelector('#welcome', { timeout: 2000 });
      // on the 11th, we should be redirect to /dashboard on POST /listings (need to figure out how to do this w/ puppeteer)
    });
});

async function createListing(page) {
  await page.click('a[href="/listings/new"]');
  await page.waitForSelector('#titleInput');
  await page.type('#titleInput', 'Python Script');
  await page.type('#descInput', 'Need simple python script to run celery commands every x hours');
  await page.click('button[type="submit"]');
  await page.waitForSelector('#welcome');
}

async function login(page) {
  await page.goto('http://localhost:3000/login');
  await page.waitForSelector('#emailInput');
  await page.type('#emailInput', 'sato@email.com');
  await page.type('#passwordInput', '1111111111');
  await page.click('#submitInput');
  await page.waitForSelector('#welcome');
}
