const puppeteer = require('puppeteer');
const seed = require('../../seed');
const app = require('../../src/app');
const assert = require('chai').assert;
const sinon = require('sinon');


describe('#Flows', function() {
    var server = app.listen(3000);
    let page, browser;
    const width = 1920;
    const height = 1080;
    /* before ALL tests*/
    before(async function() {
      this.timeout(15000);
      const browserConfig = { headless: false };
      if(!browserConfig.headless) {
        browserConfig.slowMo = 30;
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
    it('should NOT redirect to /dashboard with over_limit flash if user has 10 active listings when we GET /listings/new', async function() {
      // the reason for this is probably the same reason craigslist doesnt check if you're over the limit:
      // why hit the DB every time the user wants the form to post something? unneccessary calories burned
      const belongsToStub = sinon.stub( require('../../src/controllers/listing'), 'countBelongsTo').resolves(10);
      await login(page);
      await page.goto('http://localhost:3000/listings/new');
      await page.waitForSelector('#titleInput', { timeout: 1500 });
      belongsToStub.restore();
    });
    it('should redirect to /dashboard with over_limit flash if user has 10 active listings when we POST /listings', async function() {
      this.timeout(60000);
      const belongsToStub = sinon.stub( require('../../src/controllers/listing'), 'countBelongsTo').resolves(10);
      await login(page);
      // for(let i = 0; i < 10; i++) {
      //   await createListing(page);
      // }
      // 11th post, when we're done we'll be at /dashboard and we can search for flash message there
      await createListing(page);
      const over_limit_flashMessage = await page.$('#over_limit');
      assert.exists(over_limit_flashMessage);
      belongsToStub.restore();
    });
    it('should show post_success flash message at /dashboard after successful listing post', async function() {
      await login(page);
      await createListing(page);
      await page.waitForSelector('#post_success', { timeout: 2000 });
    });
    it('should navigate to update page of listing w/ title A, change to title B, hit update, get redirected back to /dashboard and see change reflected', async function() {
      this.timeout(30000);
      await login(page);
      const OGListingID = await page.$eval('li.listing_li', li => li.id);
      await page.click(`a[href="/listings/${OGListingID}/edit"]`);
      await page.waitForSelector(`form[action="/listings/${OGListingID}?_method=PUT"]`, { timeout: 1500 });
      await page.type('#titleInput', 'New title biznatch');
      await page.click('button[type="submit"]');
      await page.waitForSelector('#welcome', { timeout: 1456 })
      await page.waitForSelector('#update_success', { timeout: 1567 });
      const innerText = await page.$eval('#update_success', p => p.textContent);
      assert.equal(innerText, 'Changes saved!');
    });
    it('should navigate to update page of listing w/ title A, make no change, hit update, get redirected back to /dashboard and see Note: no changes Message', async function() {
      this.timeout(30000);
      await login(page);
      const OGListingID = await page.$eval('li.listing_li', li => li.id);
      await page.click(`a[href="/listings/${OGListingID}/edit"]`);
      await page.waitForSelector(`form[action="/listings/${OGListingID}?_method=PUT"]`, { timeout: 1500 });
      await page.click('button[type="submit"]');
      await page.waitForSelector('#welcome', { timeout: 1456 })
      await page.waitForSelector('#no_update', { timeout: 1567 });
      const innerText = await page.$eval('#no_update', p => p.textContent);
      assert.equal(innerText, 'Note: No changes made');
    });
    it('should navigate to update page of listing w/ type A, change to type B, hit update, navigate to /listings/:id, and see updated type reflected');
    it('should not allow post_listing form to submit until a) Title has 1+ non space char b) description has 1+ non space char', async function() {
      this.timeout(30000);
      await login(page);
      await goToCreateListing(page);
      // try to submit w/ title AND desc empty
      await page.click('button[type="submit"]');
      // await sleep(); - dont need to sleep - i guess it runs waitForSelector after whatever's supposed to happen when you click submit
      await page.waitForSelector('#titleInput', { timeout: 1234 }); // html required will prevent it - title
      // try to submit w/ title w/ whitespace and desc empty
      await page.type('#titleInput', ' ');
      await page.click('button[type="submit"]');
      await page.waitForSelector('#titleInput', { timeout: 1534 }); // html required will prevent it - desc
      // try to submit w/ title and w/ desc having whitespace
      await page.type('#descInput', ' ');
      await page.click('button[type="submit"]');
      await page.waitForSelector('#titleInput.is-invalid', { timeout: 700 }); // clientside validation messages
      await page.waitForSelector('#descInput.is-invalid', { timeout: 701 });
      // now add value to title but leave desc w/ whitespace
      await page.type('#titleInput', 'a');
      await page.click('button[type="submit"]');
      await page.waitForSelector('#descInput.is-invalid', { timeout: 702 });
      // now add value to desc and we should actually submit
      await page.type('#descInput', 'a');
      await page.click('button[type="submit"]');
      await page.waitForSelector('#welcome', { timeout: 703 });
    });
    it.only('should not allow update_listing form to submit until a) Title has 1+ non space char b) Description has 1+ non space char', async function() {
      this.timeout(30000);
      await login(page);
      await goToUpdateListing(page);

      // try to submit w/ title AND desc empty
      await fillListingInputs(page, { title: '', description: '' });
      await page.click('button[type="submit"]');
      await page.waitForSelector('#titleInput', { timeout: 1234 }); // html required will prevent it - title
      // try to submit w/ title w/ whitespace and desc empty
      await fillListingInputs(page, { title: ' ', description: '' });
      await page.click('button[type="submit"]');
      await page.waitForSelector('#titleInput', { timeout: 1534 }); // html required will prevent it - desc
      // try to submit w/ title and w/ desc having whitespace
      await fillListingInputs(page, { title: ' ', description: ' ' });
      await page.click('button[type="submit"]');
      await page.waitForSelector('#titleInput.is-invalid', { timeout: 700 }); // clientside validation messages
      await page.waitForSelector('#descInput.is-invalid', { timeout: 701 });
      // now add value to title but leave desc w/ whitespace
      await fillListingInputs(page, { title: 'a', description: ' ' });
      await page.click('button[type="submit"]');
      await page.waitForSelector('#descInput.is-invalid', { timeout: 702 });
      // now add value to desc and we should actually submit
      await fillListingInputs(page, { title: 'a', description: 'a' });
      await page.click('button[type="submit"]');
      await page.waitForSelector('#welcome', { timeout: 703 });
    });
    it('should not allow user to submit post_listing with more than 75 chars for title and 1000 chars for description', async function() {
      this.timeout(30000);
      await login(page);
      await goToCreateListing(page);
      const tooLongTitle = 'sdgsdhsdjhsdjhljshlkjeslkfdhjdkflbmlksdbsdnbjksdgnsgjdlfjsldjhkdjsfhjdfjhjld';
      assert.equal(tooLongTitle.length, 76);
      // title should be too long but description not - expecting is-invalid tag
      await fillListingInputs(page, { title: tooLongTitle, description: 'a' });
      await page.click('button[type="submit"]');
      await page.waitForSelector('#titleInput.is-invalid', { timeout: 2000 });
      // description should be too long but title not - expecting is-invalid tag
      const tooLongDescription = 'sdgsdhsdjhsdjhljshlkjeslkfdhjdkflbmlksdbsdnbjksdgnsgjdlfjsldjhkdjsfhjdfjhjldjfshfglkahgkajhgadfkjghagha;dfhjgadf;gj;lafgjl;ajgl;kdjfglkdjfkjbvzkjbaerhgfjvndfkjgkjehgjsvljksndbajkhfdguharnvfsdjgdl;sjldsdgsdhsdjhsdjhljshlkjeslkfdhjdkflbmlksdbsdnbjksdgnsgjdlfjsldjhkdjsfhjdfjhjldjfshfglkahgkajhgadfkjghagha;dfhjgadf;gj;lafgjl;ajgl;kdjfglkdjfkjbvzkjbaerhgfjvndfkjgkjehgjsvljksndbajkhfdguharnvfsdjgdl;sjldsdgsdhsdjhsdjhljshlkjeslkfdhjdkflbmlksdbsdnbjksdgnsgjdlfjsldjhkdjsfhjdfjhjldjfshfglkahgkajhgadfkjghagha;dfhjgadf;gj;lafgjl;ajgl;kdjfglkdjfkjbvzkjbaerhgfjvndfkjgkjehgjsvljksndbajkhfdguharnvfsdjgdl;sjldsdgsdhsdjhsdjhljshlkjeslkfdhjdkflbmlksdbsdnbjksdgnsgjdlfjsldjhkdjsfhjdfjhjldjfshfglkahgkajhgadfkjghagha;dfhjgadf;gj;lafgjl;ajgl;kdjfglkdjfkjbvzkjbaerhgfjvndfkjgkjehgjsvljksndbajkhfdguharnvfsdjgdl;sjldsdgsdhsdjhsdjhljshlkjeslkfdhjdkflbmlksdbsdnbjksdgnsgjdlfjsldjhkdjsfhjdfjhjldjfshfglkahgkajhgadfkjghagha;dfhjgadf;gj;lafgjl;ajgl;kdjfglkdjfkjbvzkjbaerhgfjvndfkjgkjehgjsvljksndbajkhfdguharnvfsdjgdl;sjldj';
      assert.equal(tooLongDescription.length, 1001);
      await fillListingInputs(page, { title: 'a', description: tooLongDescription });
      await page.click('button[type="submit"]');
      await page.waitForSelector('#descInput.is-invalid', { timeout: 1999 });
      // now they should both be below the max
      const okTitle = 'sdgsdhsdjhsdjhljshlkjeslkfdhjdkflbmlksdbsdnbjksdgnsgjdlfjsldjhkdjsfhjdfjhjl';
      const okDesc = 'sdgsdhsdjhsdjhljshlkjeslkfdhjdkflbmlksdbsdnbjksdgnsgjdlfjsldjhkdjsfhjdfjhjldjfshfglkahgkajhgadfkjghagha;dfhjgadf;gj;lafgjl;ajgl;kdjfglkdjfkjbvzkjbaerhgfjvndfkjgkjehgjsvljksndbajkhfdguharnvfsdjgdl;sjldsdgsdhsdjhsdjhljshlkjeslkfdhjdkflbmlksdbsdnbjksdgnsgjdlfjsldjhkdjsfhjdfjhjldjfshfglkahgkajhgadfkjghagha;dfhjgadf;gj;lafgjl;ajgl;kdjfglkdjfkjbvzkjbaerhgfjvndfkjgkjehgjsvljksndbajkhfdguharnvfsdjgdl;sjldsdgsdhsdjhsdjhljshlkjeslkfdhjdkflbmlksdbsdnbjksdgnsgjdlfjsldjhkdjsfhjdfjhjldjfshfglkahgkajhgadfkjghagha;dfhjgadf;gj;lafgjl;ajgl;kdjfglkdjfkjbvzkjbaerhgfjvndfkjgkjehgjsvljksndbajkhfdguharnvfsdjgdl;sjldsdgsdhsdjhsdjhljshlkjeslkfdhjdkflbmlksdbsdnbjksdgnsgjdlfjsldjhkdjsfhjdfjhjldjfshfglkahgkajhgadfkjghagha;dfhjgadf;gj;lafgjl;ajgl;kdjfglkdjfkjbvzkjbaerhgfjvndfkjgkjehgjsvljksndbajkhfdguharnvfsdjgdl;sjldsdgsdhsdjhsdjhljshlkjeslkfdhjdkflbmlksdbsdnbjksdgnsgjdlfjsldjhkdjsfhjdfjhjldjfshfglkahgkajhgadfkjghagha;dfhjgadf;gj;lafgjl;ajgl;kdjfglkdjfkjbvzkjbaerhgfjvndfkjgkjehgjsvljksndbajkhfdguharnvfsdjgdl;sjld';
      await fillListingInputs(page, { title: okTitle, description: okDesc });
      await page.click('button[type="submit"]');
      await page.waitForSelector('#welcome', { timeout: 1998 });
    });
    it.only('should not allow user to submit update_listing form with more than 75 chars for title and 1000 chars for description', async function() {
      this.timeout(30000);
      await login(page);
      await goToUpdateListing(page);
      const tooLongTitle = 'sdgsdhsdjhsdjhljshlkjeslkfdhjdkflbmlksdbsdnbjksdgnsgjdlfjsldjhkdjsfhjdfjhjld';
      assert.equal(tooLongTitle.length, 76);
      // title should be too long but description not - expecting is-invalid tag
      await fillListingInputs(page, { title: tooLongTitle, description: 'a' });
      await page.click('button[type="submit"]');
      await page.waitForSelector('#titleInput.is-invalid', { timeout: 2000 });
      // description should be too long but title not - expecting is-invalid tag
      const tooLongDescription = 'sdgsdhsdjhsdjhljshlkjeslkfdhjdkflbmlksdbsdnbjksdgnsgjdlfjsldjhkdjsfhjdfjhjldjfshfglkahgkajhgadfkjghagha;dfhjgadf;gj;lafgjl;ajgl;kdjfglkdjfkjbvzkjbaerhgfjvndfkjgkjehgjsvljksndbajkhfdguharnvfsdjgdl;sjldsdgsdhsdjhsdjhljshlkjeslkfdhjdkflbmlksdbsdnbjksdgnsgjdlfjsldjhkdjsfhjdfjhjldjfshfglkahgkajhgadfkjghagha;dfhjgadf;gj;lafgjl;ajgl;kdjfglkdjfkjbvzkjbaerhgfjvndfkjgkjehgjsvljksndbajkhfdguharnvfsdjgdl;sjldsdgsdhsdjhsdjhljshlkjeslkfdhjdkflbmlksdbsdnbjksdgnsgjdlfjsldjhkdjsfhjdfjhjldjfshfglkahgkajhgadfkjghagha;dfhjgadf;gj;lafgjl;ajgl;kdjfglkdjfkjbvzkjbaerhgfjvndfkjgkjehgjsvljksndbajkhfdguharnvfsdjgdl;sjldsdgsdhsdjhsdjhljshlkjeslkfdhjdkflbmlksdbsdnbjksdgnsgjdlfjsldjhkdjsfhjdfjhjldjfshfglkahgkajhgadfkjghagha;dfhjgadf;gj;lafgjl;ajgl;kdjfglkdjfkjbvzkjbaerhgfjvndfkjgkjehgjsvljksndbajkhfdguharnvfsdjgdl;sjldsdgsdhsdjhsdjhljshlkjeslkfdhjdkflbmlksdbsdnbjksdgnsgjdlfjsldjhkdjsfhjdfjhjldjfshfglkahgkajhgadfkjghagha;dfhjgadf;gj;lafgjl;ajgl;kdjfglkdjfkjbvzkjbaerhgfjvndfkjgkjehgjsvljksndbajkhfdguharnvfsdjgdl;sjldj';
      assert.equal(tooLongDescription.length, 1001);
      await fillListingInputs(page, { title: 'a', description: tooLongDescription });
      await page.click('button[type="submit"]');
      await page.waitForSelector('#descInput.is-invalid', { timeout: 1999 });
      // now they should both be below the max
      const okTitle = 'sdgsdhsdjhsdjhljshlkjeslkfdhjdkflbmlksdbsdnbjksdgnsgjdlfjsldjhkdjsfhjdfjhjl';
      const okDesc = 'sdgsdhsdjhsdjhljshlkjeslkfdhjdkflbmlksdbsdnbjksdgnsgjdlfjsldjhkdjsfhjdfjhjldjfshfglkahgkajhgadfkjghagha;dfhjgadf;gj;lafgjl;ajgl;kdjfglkdjfkjbvzkjbaerhgfjvndfkjgkjehgjsvljksndbajkhfdguharnvfsdjgdl;sjldsdgsdhsdjhsdjhljshlkjeslkfdhjdkflbmlksdbsdnbjksdgnsgjdlfjsldjhkdjsfhjdfjhjldjfshfglkahgkajhgadfkjghagha;dfhjgadf;gj;lafgjl;ajgl;kdjfglkdjfkjbvzkjbaerhgfjvndfkjgkjehgjsvljksndbajkhfdguharnvfsdjgdl;sjldsdgsdhsdjhsdjhljshlkjeslkfdhjdkflbmlksdbsdnbjksdgnsgjdlfjsldjhkdjsfhjdfjhjldjfshfglkahgkajhgadfkjghagha;dfhjgadf;gj;lafgjl;ajgl;kdjfglkdjfkjbvzkjbaerhgfjvndfkjgkjehgjsvljksndbajkhfdguharnvfsdjgdl;sjldsdgsdhsdjhsdjhljshlkjeslkfdhjdkflbmlksdbsdnbjksdgnsgjdlfjsldjhkdjsfhjdfjhjldjfshfglkahgkajhgadfkjghagha;dfhjgadf;gj;lafgjl;ajgl;kdjfglkdjfkjbvzkjbaerhgfjvndfkjgkjehgjsvljksndbajkhfdguharnvfsdjgdl;sjldsdgsdhsdjhsdjhljshlkjeslkfdhjdkflbmlksdbsdnbjksdgnsgjdlfjsldjhkdjsfhjdfjhjldjfshfglkahgkajhgadfkjghagha;dfhjgadf;gj;lafgjl;ajgl;kdjfglkdjfkjbvzkjbaerhgfjvndfkjgkjehgjsvljksndbajkhfdguharnvfsdjgdl;sjld';
      await fillListingInputs(page, { title: okTitle, description: okDesc });
      await page.click('button[type="submit"]');
      await page.waitForSelector('#welcome', { timeout: 1998 });
    });
});

async function fillListingInputs(page, { title, description }) {
  await page.evaluate((tit, desc) => {
    document.querySelector('#titleInput').value = tit;
    document.querySelector('#descInput').value = desc;
  }, title, description);
}

function sleep(time = 250) {
  return new Promise(function(resolve, reject) {
    setTimeout(resolve, time);
  });
}

async function clickLink(page, selector, waitForSelector) {
  await page.click(selector);
  await page.waitForSelector(waitForSelector, { timeout: 2103 });
}

async function goToCreateListing(page) {
  await clickLink(page, 'a[href="/listings/new"]', '#titleInput');
}

async function goToUpdateListing(page) {
	const OGListingID = await page.$eval('li.listing_li', li => li.id);
	await clickLink(page, `a[href="/listings/${OGListingID}/edit"]`, '#titleInput');
}

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
  await page.waitForSelector('#welcome', { timeout: 1459 });
}
