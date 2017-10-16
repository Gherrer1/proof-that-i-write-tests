const express								= require('express');
const bodyParser 						= require('body-parser');
const logger								= require('morgan');
const mongoose							= require('mongoose');
const config								= require('./config');
const DB_URL								= config.DB_URL;
const { signupValidators }	= require('./validators');
const { matchedData } 			= require('express-validator/filter');
const { validationResult } 	= require('express-validator/check');
const userController 				= require('./controllers/user');
const app = express();

mongoose.Promise = global.Promise;

mongoose.connect(DB_URL, { useMongoClient: true })
.then(
	function connectSuccess() { console.log(`Connected to ${DB_URL}`) }
		,
	function connectFail(err) {
		console.log('Connection Error:\n', err);
		process.exit(1);
	}
);

// config
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Middleware
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/', function(req, res) {
	res.send('hey');
});

app.get('/signup', function(req, res) {
	// TODO: if not signed in
	res.render('signup', { errors: [] })
});

// app.post('/signup', signupValidators, userController.createUser);
app.post('/signup', signupValidators, function(req, res) {
	// dependency injection
	const errors = validationResult(req);
	const validData = matchedData(req);
	userController.createUser(req, res, errors, validData);
});

// app.get('/login', function(req, res) {
// 	// TODO: check if authorized first - no need for logged in user to go through TSA
//
// 	res.render('login', { errors: [] });
// });
// app.post('/login', function(req, res) {
// 	let { email, password } = req.body;
// 	res.send(`Heres your JWT: ${email + password}`);
// });


module.exports = app;
