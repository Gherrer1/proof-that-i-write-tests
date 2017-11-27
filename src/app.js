const express								= require('express');
const mongoose							= require('mongoose');
const passport							= require('passport');
const session								= require('express-session');
const config								= require('./config');
const {signupValidators}		= require('./validators');
const userController 				= require('./controllers/user');
const signupRouteHandlers 	= require('./routeHandlers/signup');
const loginRouteHandlers		= require('./routeHandlers/login');

userController.setModel( require('./models/User') );

const app = express();

mongoose.Promise = global.Promise;
mongoose.connect(config.DB_URL, { useMongoClient: true }).then(
	function connectSuccess() { console.log(`Connected to ${config.DB_URL}`) }
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
app.use(require('morgan')('dev')); // logger
app.use(require('cookie-parser')(config.COOKIE_SECRET));
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('body-parser').json());
app.use(require('cookie-flash-messages'));

// Routes
app.get('/login', function(req, res) {
	loginRouteHandlers.getLogin(req, res);
});

app.post('/login', function(req, res) {
});

app.get('/signup', function(req, res) {
	signupRouteHandlers.getSignup(req, res);
});

app.post('/signup', signupValidators, function(req, res) {
	const {matchedData} = require('express-validator/filter');
	const {validationResult} = require('express-validator/check');
	const errors = validationResult(req);
	const validData = matchedData(req);
	signupRouteHandlers.postSignup(req, res, errors, validData, userController, require('bcrypt'));
});

module.exports = app;
