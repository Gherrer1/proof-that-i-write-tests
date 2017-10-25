const express								= require('express');
const bodyParser 						= require('body-parser');
const cookieParser					= require('cookie-parser');
const logger								= require('morgan');
const mongoose							= require('mongoose');
const config								= require('./config');
const { DB_URL, COOKIE_NAME }							= config;
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
app.use(cookieParser());

app.use(function cookiePrinter(req, res, next) {
	console.log('Cookies:', req.cookies);
	next();
});

app.get('/', function(req, res) {
	res.send('hey');
});

app.get('/login', function(req, res) {
	res.render('login', { errors: [] });
});

app.get('/signup', function(req, res) {
	// if request has session cookie, redirect to /dashboard. On the way, it'll encounter authorization middleware
	if(req.cookies[COOKIE_NAME])
		return res.redirect('/dashboard');
	res.render('signup', { errors: [] })
	// res.send('pong');
});


app.post('/signup', signupValidators, function(req, res) {
	const errors = validationResult(req);
	const validData = matchedData(req);
	const errorsToString = { haveErrors: !errors.isEmpty(), errors: errors.mapped(), validData };
	if(!errors.isEmpty()) {
		// rerender /signup with error message and with prefilled elements
		errorsToString.msg = 'fail lol';
		// return res.status(400).json(errorsToString);
		return res.redirect('/signup');
	}

	const requiredFields = require('../helpers/requiredFields').createUser;
	// const uniquenessVerifier = require()
	// const passwordHasher = require(bcrypt)
	userController.createUser(validData, requiredFields)
		.then(user => res.send(user))
		.catch(err => {
			errorsToString.haveErrors = true;
			errorsToString.errors = [err];
			errorsToString.msg = err.message;
			res.json(errorsToString);
		});
});

app.get('/dashboard', function(req, res) {
	res.sendStatus(200);
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
