const bodyParser 						= require('body-parser');
const express								= require('express');
const logger								= require('morgan');
const mongoose							= require('mongoose');
// const session								= require('express-session');
const config								= require('./config');
const {
				DB_URL,
				SESSION_COOKIE_NAME
			}											= config;
const { signupValidators }	= require('./validators');
const { matchedData } 			= require('express-validator/filter');
const { validationResult } 	= require('express-validator/check');
const userController 				= require('./controllers/user');
userController.setModel( require('./models/User') );
const signupRouteHandlers 	= require('./routeHandlers/signup');
const loginRouteHandlers		= require('./routeHandlers/login');
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
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

// Middleware
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// const sessionOptions = {
// 	// settings object for the sessionID cookie TODO: set more secure options too
// 	cookie: { maxAge: 1000 * 30 },
// 	// name of the cookie
// 	name: SESSION_COOKIE_NAME,
// 	// secret used for signing the sessionID
// 	secret: 'keyboard cat'
// };
// app.use(session(sessionOptions));


app.get('/login', function(req, res) {
	loginRouteHandlers.getLogin(req, res);
});

app.get('/signup', function(req, res) {
	signupRouteHandlers.getSignup(req, res);
});

app.post('/signup', signupValidators, function(req, res) {
	const errors = validationResult(req);
	const validData = matchedData(req);
	signupRouteHandlers.postSignup(req, res, errors, validData, userController, require('bcrypt'));
});

//
// app.get('/dashboard', function(req, res) {
// 	res.sendStatus(200);
// });
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
