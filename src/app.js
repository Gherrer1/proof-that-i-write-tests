const express								= require('express');
const {ensureLoggedOut}			= require('./middleware/connect-ensure-login');
const {ensureLoggedIn}			= require('./middleware/connect-ensure-login');
const mongoose							= require('mongoose');
const passport							= require('passport');
const session								= require('express-session');
const config								= require('./config');
const {signupValidators}		= require('./validators');
const {loginValidators}			= require('./validators');
const {listingValidators}	 	= require('./validators');
const userController 				= require('./controllers/user');
const listingController = require('./controllers/listing');
const signupRouteHandlers 	= require('./routeHandlers/signup');
const loginRouteHandlers		= require('./routeHandlers/login');
const logoutRouteHandler 		= require('./routeHandlers/logout');
const listingRouteHandlers 	= require('./routeHandlers/listings');

userController.setModel( require('./models/User') );
listingController.setModel( require('./models/Listing') );

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
if(process.env.NODE_ENV !== 'test')
	app.use(require('morgan')('dev')); // logger
app.use(require('cookie-parser')(config.COOKIE_SECRET));
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('body-parser').json());
app.use(require('./middleware/cookie-flash-messages'));
app.use(require('express-session')(require('./config/express-session-config')));
app.use(require('./config/passport-configured').initialize());
app.use(require('./config/passport-configured').session());

// Routes
app.get('/login', function(req, res) {
	loginRouteHandlers.getLogin(req, res);
});

app.post('/login', ensureLoggedOut('/dashboard'), loginValidators,
	function redirectIfErrors(req, res, next) {
		const {matchedData} = require('express-validator/filter');
		const {validationResult} = require('express-validator/check');
		loginRouteHandlers.ensureNoValidationErrs(req, res, next, matchedData, validationResult);
	},
			function authenticate(req, res) {
				passport.authenticate('local', function(err, user, info) {
					loginRouteHandlers.handleAuthenticationResult(req, res, err, user, info);
				})(req, res);
			}
);

app.get('/logout', function(req, res) {
	logoutRouteHandler.logout(req, res);
});

app.get('/signup', ensureLoggedOut('/dashboard'), function(req, res) {
	signupRouteHandlers.getSignup(req, res);
});

app.post('/signup', ensureLoggedOut('/dashboard'), signupValidators, function(req, res) {
	const {matchedData} = require('express-validator/filter');
	const {validationResult} = require('express-validator/check');
	const errors = validationResult(req);
	const validData = matchedData(req);
	signupRouteHandlers.postSignup(req, res, errors, validData, userController, require('bcrypt'));
});

app.get('/dashboard', ensureLoggedIn('/login'), function(req, res) {
	listingController.findBelongsTo(req.user._id)
	.then(listings => {
		res.render('dashboard', { listings });
	})
	.catch(err => {
		// cant do flash message because we go straight to render, dont redirect
		res.locals.flashMessage = {
			type: 'server_error',
			text: 'Something went wrong. Please try again'
		};
		res.render('dashboard');
	});
});

app.get('/listings/new', ensureLoggedIn({ redirectTo: '/login', setReturnTo: '/listings/new' }), function(req, res) {
	/* the MOMENT this changes, strongly consider writing unit tests for this route */
	res.render('newListing');
});

app.get('/listings/:id',
	ensureLoggedIn({ redirectTo: '/login'}),
	function(req, res) {
		listingRouteHandlers.getById(req, res, listingController);
	}
);

app.post('/listings',
	ensureLoggedIn({ redirectTo: '/login' }),
	listingValidators,
	function redirectIfErrors(req, res, next) {
		const {matchedData} = require('express-validator/filter');
		const {validationResult} = require('express-validator/check');
		listingRouteHandlers.ensureNoValidationErrs(req, res, next, validationResult);
	},
	function ensureLTE10ActiveListings(req, res, next) {
		let user_id = req.user._id;
		listingRouteHandlers.ensureLTE10ActiveListings(req, res, next, listingController, user_id);
	},
	function createListing(req, res, next) {
		const {matchedData} = require('express-validator/filter');
		const validData = matchedData(req);
		listingRouteHandlers.postListing(req, res, listingController, validData);
	}
);

app.delete('/listings/:id',
	ensureLoggedIn({ redirectTo: null }),
	function(req, res) {
		listingRouteHandlers.deleteById(req, res, listingController);
	}
);

app.get('/listings/:id/edit',
	ensureLoggedIn({ redirectTo: '/login' }),
	function getUpdateForm(req, res) {
		listingRouteHandlers.getUpdateForm(req, res, listingController);
	}
);

module.exports = app;
