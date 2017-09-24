const mongoose  = require('mongoose');
mongoose.Promise = global.Promise;
const { DB_URL } = require('./config');
const Listing = require('./models/Listing');
const User = require('./models/User');

mongoose.connect(DB_URL, { useMongoClient: true })
  .then(
    /* Success */ () => {
      console.log(`Connected to ${DB_URL}`);
      seed();
    },
    /* Fail */ (err) => {
      console.log('Failed to connect:\n', err);
      process.exit(1);
    }
  )
  .catch(
    (err) => {
      console.log(err);
      process.exit(1);
    }
  );

// tear down listings
// tear down users
// add new users
// add new listings
function seed() {
  Promise.resolve()
  .then(clearListings)
  .then(clearUsers)
  .then(addUsers)
  .then(ids => createListings(ids))
  .then(() => mongoose.connection.close())
  .catch(err => console.log(err));
}

function clearListings() {
  return new Promise(function(resolve, reject) {
    Listing.deleteMany({})
      .then(msg => {
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
    const fakeLangs = ['Python', 'Javascript', 'C++', 'elm', 'C', 'ruby', 'oG'];
    const fakeTitlePostfixes = [' Website', ' Mobile App', ' Utility', ' Script'];
    const fakeDescriptions = ['Need experienced developer', 'Entry level devs welcome'];

    const numFakeListings = 67;

    // TODO: pick up from here. First need to add owner field to Listings
    let id_index = 0;
    for(let i = 0; i < numFakeListings; i++) {
      if(id_index >= ids.length) {
        id_index = 0;
      }
    }
  });
}
