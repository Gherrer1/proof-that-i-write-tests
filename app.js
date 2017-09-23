const express		= require('express');
const bodyParser 	= require('body-parser');
const logger		= require('morgan');
const mongoose		= require('mongoose');
const config		= require('./config'),
	  DB_URL		= config.DB_URL;

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

const app = express();
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/', function(req, res) {
	res.send('hey');
});


module.exports = app;