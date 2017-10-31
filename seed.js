const mongoose  = require('mongoose');
mongoose.Promise = global.Promise;
const { DB_URL } = require('./src/config');
const Listing = require('./src/models/Listing');
const User = require('./src/models/User');

const env = process.env.NODE_ENV || 'test';

// mongoose.connect(DB_URL, { useMongoClient: true })
//   .then(
//     /* Success */ () => {
//       console.log(`Connected to ${DB_URL}`);
//       seed();
//     },
//     /* Fail */ (err) => {
//       console.log('Failed to connect:\n', err);
//       process.exit(1);
//     }
//   )
//   .catch(
//     (err) => {
//       console.log(err);
//       process.exit(1);
//     }
//   );

module.exports = {
  seed,
  // connect(cb) {
  //   mongoose.connect(DB_URL, { useMongoClient: true })
  //   .then(() => cb())
  //   .catch(err => { throw err });
  // },
  // disconnect(cb) {
  //   mongoose.disconnect()
  //   .then(() => cb())
  //   .catch(err => { throw err });
  // }
}

// tear down listings
// tear down users
// add new users
// add new listings
function seed() {
  return new Promise(function(resolve, reject) {
    Promise.resolve()
    .then(clearListings)
    .then(clearUsers)
    .then(addUsers)
    .then(ids => createListings(ids))
    .then(() => resolve())
    .catch(err => reject(err));
  });
}

function clearListings() {
  return new Promise(function(resolve, reject) {
    Listing.deleteMany({})
      .then(msg => {
        if(env !== 'test')
          console.log(`deleted ${msg.result.n} listings`);
        return resolve();
      })
      .catch(err => reject(err));
  });
}

function clearUsers() {
  return new Promise(function(resolve, reject) {
    User.deleteMany({})
      .then(msg => {
        if(env !== 'test')
          console.log(`deleted ${msg.result.n} users`);
        return resolve();
      })
      .catch(err => reject(err));
  });
}

/**
 * Maps each fake user name to a promise of saving a user, return promise once it's all done
 */
function addUsers() {
  return new Promise(function(resolve, reject) {
    var fakeUsers = ['Jiro', 'Todoroki', 'Midoriya', 'Mineta', 'Uraraka', 'Momo', 'Tsu', 'Tokoyami', 'Koda', 'Kaminari',
                      'Iida', 'Bakugo', 'Sero', 'Kirishima', 'Hagakure', 'Auyoma', 'Ashido', 'Sato', 'Shoji', 'Ojiro'];
    var fakeEmails = fakeUsers.map( userFName => userFName + '@email.com');
    const fakePassword = '1111111111';

    let savePromises = fakeUsers.map(fUser => {
      const usernamePaddingLength = 7 - fUser.length;
      let username = fUser;
      if(usernamePaddingLength > 0) {
        let padding = (new Array(usernamePaddingLength));
        padding = padding.fill('_').join('');
        username = username + padding;
      }
      const fields = {
        fname: fUser,
        email: fUser + '@email.com',
        password: fakePassword,
        username: username
      }
      let user = new User(fields);
      return user.save()
    });

    Promise.all(savePromises)
      .then(res => {
        var ids = res.map(user => user._id);
        if(env !== 'test')
          console.log(`created ${ids.length} users`);
        return resolve(ids);
      })
      .catch(err => {
        return reject(err);
      })
  });
}

function createListings(ids) {
  return new Promise(function(resolve, reject) {
    const fakeTypes = ['long_term', 'short_term', 'full_time'];
    const fakeLangs = ['Python', 'Javascript', 'C++', 'elm', 'C', 'ruby', 'gO'];
    const fakeTitlePostfixes = [' Website', ' Mobile App', ' Utility', ' Script'];
    const fakeDescriptions = ['Need experienced developer', 'Entry level devs welcome'];

    const numFakeListings = 67;
    var today = new Date();
    var tomorrow = today.setDate(today.getDate() + 1);
    const fakeDueDate = tomorrow;

    let savePromises = [];

    let id_index = 0;
    let fakeTypes_i = 0;
    let fakeLangs_i = 0;
    let fakeDesc_i = 0;
    let fakeTitlePostfixes_i = 0;

    for(let i = 0; i < numFakeListings; i++, id_index++, fakeTypes_i++, fakeLangs_i++, fakeDesc_i++, fakeTitlePostfixes_i++) {
      // circle back if necessary
      id_index = (id_index >= ids.length ? 0 : id_index);
      fakeTypes_i = (fakeTypes_i >= fakeTypes.length ? 0 : fakeTypes_i);
      fakeLangs_i = (fakeLangs_i >= fakeLangs.length ? 0 : fakeLangs_i);
      fakeDesc_i = (fakeDesc_i >= fakeDescriptions.length ? 0 : fakeDesc_i);
      fakeTitlePostfixes_i = (fakeTitlePostfixes_i >= fakeTitlePostfixes.length ? 0 : fakeTitlePostfixes_i);

      const fields = {
        title: fakeLangs[fakeLangs_i] + fakeTitlePostfixes[fakeTitlePostfixes_i],
        type: fakeTypes[fakeTypes_i],
        description: fakeDescriptions[fakeDesc_i],
        lang: fakeLangs[fakeLangs_i],
        dueDate: getXDaysFromToday(Math.ceil(Math.random() * 30)),
        owner_id: ids[id_index]
      };
      if(Math.random() < .5) {
        fields.budget = Math.ceil(Math.random() * 2000);
      }
      const listing = new Listing(fields);
      savePromises.push(listing.save());
    }
    Promise.all(savePromises)
      .then(res => {
        if(env !== 'test')
          console.log(`Created ${res.length} listings`);
        resolve(res); })
      .catch(err => reject(err));
  });
}

// helpers
/* int --> Date */
function getXDaysFromToday(x) {
    let today = new Date();
    today.setDate(today.getDate() + x);
    return today;
  }
