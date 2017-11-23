const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const options = {
	name: 'sidthekid', // factor
	secret: 'keyboard cizzat', // factor
	store: new MongoDBStore({
		uri: require('./index.js').DB_URL, 
		collection: 'sessions'
	}),
	cookie: { maxAge: 1000 * 30 }, // TODO: add more secure options too
	saveUninitialized: false,
	resave: false,
	// rolling: true
};

module.exports = options;