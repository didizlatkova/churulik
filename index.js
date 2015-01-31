var express = require('express'),
	app = express(),
	path = require('path'),
	bodyParser = require('body-parser'),
	MongoClient = require('mongodb').MongoClient,
	routes = require('./routes/routes');

function setup_express(routes) {
	app.use(bodyParser.json());
	// app.use(bodyParser.urlencoded({ extended: false }));
	app.use(express.static(path.join(__dirname, 'node_modules/bootstrap')));
	app.use('/', routes);

	// catch 404 and forward to error handler
	app.use(function(req, res, next) {
		var err = new Error('Not Found');
		err.status = 404;
		res.send('404 Page Not Found');
		//next(err);
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

	setup_express(routes(db));

	app.listen(3000, function() {
		console.log('listening on port 3000');
	});
});