const mongoose  = require('mongoose');
mongoose.Promise = global.Promise;
const { DB_URL } = require('./config');

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


function seed() {
  const User = require('./models/User');
  const Listing = require('./models/Listing');
  var fakeUsers = ['Jiro', 'Todoroki', 'Midoriya', 'Mineta', 'Uraraka', 'Momo', 'Tsu', 'Tokoyami', 'Koda', 'Kaminari',
                    'Iida', 'Bakugo', 'Sero', 'Kirishima', 'Hagakure', 'Auyoma', 'Ashido', 'Sato', 'Shoji', 'Ojiro'];
  var fakeEmails = fakeUsers.map( userFName => userFName + '@email.com');
  const fakePassword = '1111111111';

  var user1 = new User()
  user1.save()
    .then((msg) => console.log('Success message!: ', msg))
    .catch(err => console.log(err));

  mongoose.connection.close();
}
