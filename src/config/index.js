const DB_URL = (process.env.NODE_ENV === 'prod') ? process.env.DB_URL : 'mongodb://localhost:27017/proof';
if(!DB_URL) {
	console.log('Exiting because no DB_URL env var provided in production mode');
	process.exit(1);
}

const SESSION_COOKIE_NAME = 's.id';
const SERVER_ERROR_COOKIE_NAME = 's_error';
const CLIENT_ERROR_COOKIE_NAME = 'c_error';
const CLIENT_SUCCESS_COOKIE_NAME = 'c_success';
const COOKIE_SECRET	= 'keyboard cat'; // TODO: pull from env var
const SALT_ROUNDS = 10; // DO NOT CHANGE THIS LIGHTLY


module.exports = {
	DB_URL,
	SESSION_COOKIE_NAME,
	SALT_ROUNDS,
	// SERVER_ERROR_COOKIE_NAME,
	// CLIENT_ERROR_COOKIE_NAME,
	// CLIENT_SUCCESS_COOKIE_NAME
};