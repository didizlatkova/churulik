var express = require('express'),
	app = express(),
	path = require('path'),
	bodyParser = require('body-parser'),
	MongoClient = require('mongodb').MongoClient,
	routes = require('./routes/routes'),
	templates = require('./bl/templates'),
	passport = require('passport'),
	session = require('express-session');

function setup_express(routes) {
	app.use(session({ secret: 'nodejsisreallyawesome' })); // session secret
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use('/public', express.static(path.join(__dirname, 'public')));
	app.use('/img', express.static(path.join(__dirname, 'views/img')));
	app.use('/', routes);
	
	// catch 404 and forward to error handler
	app.use(function(req, res, next) {
		var err = new Error('Not Found');
		err.status = 404;
		res.send('404 Page Not Found');
	});

	// error handler
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		console.log('error');
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

MongoClient.connect('mongodb://localhost/tvityr', function(err, db) {
	if (err) {
		console.error('Cannot connect to the database', err);
		return;
	}

	require('./bl/passport')(db, templates.setup(), passport);

	setup_express(routes(db, templates.setup(), passport));

	app.listen(3000, function() {
		console.log('The magic happens on port 3000');
	});
});