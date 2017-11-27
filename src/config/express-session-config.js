const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const config = require('./index');

const options = {
	name: config.SESION_COOKIE_NAME,
	secret: config.COOKIE_SECRET,
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