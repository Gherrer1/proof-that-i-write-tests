const DB_URL = (process.env.NODE_ENV === 'prod') ? process.env.DB_URL : 'mongodb://localhost:27017/proof';
if(!DB_URL) {
	console.log('Exiting because no DB_URL env var provided in production mode');
	process.exit(1);
}

const SESSION_COOKIE_NAME = 's.id';
const SALT_ROUNDS = 10;


module.exports = {
	DB_URL,
	SESSION_COOKIE_NAME,
	SALT_ROUNDS
};