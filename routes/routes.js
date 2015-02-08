var express = require('express'),
	router = express.Router(),
	handlebars = require("handlebars");

module.exports = function(database, templates) {
	var usersDb = database.collection('users'),
		messagesDb = database.collection('messages'),
		users = require('../db/users')(usersDb),
		messages = require('../db/messages')(messagesDb, usersDb),
		manager = require('../bl/manager')(database);

	router.get('/', function(req, res) {
		if (req.user) {
			res.redirect('/feed');
		} else {
			res.send(templates.homeTemplate({}));
		}
	});

	router.get('/feed', function(req, res) {
		// tvyter feed
		// 	- profile preview : # of tvyts, followers, following
		//	- popular tags
		//	- last 20 tvyts of following users (endless scrolling), update in 20s
		// VIEW: main.html, PARTIALS: profile.html (without description), popular.html, addMessage.html, messages.html
		if (req.user) {
			users.getUserByUserName(req.user.userName, function(user, err) {
				if (err) {
					return res.status(err.status).send(templates.errorTemplate({
						message: err.message,
						loggedUser: req.user ? req.user.userName : 'None'
					}));
				}
				var model = manager.getUserFeedModel(user);
				res.send(templates.mainTemplate(model));
			});
		} else {
			res.redirect('/');
		}
	});

	router.get('/edit', function(req, res) {
		if (req.user) {
			users.getUserByUserName(req.user.userName, function(user, err) {
				if (err) {
					return res.status(err.status).send(templates.errorTemplate({
						message: err.message,
						loggedUser: req.user ? req.user.userName : 'None'
					}));
				}
				var model = manager.getUserEditModel(user);
				res.send(templates.editTemplate(model));
			});
		} else {
			res.redirect('/');
		}
	});

	router.post('/edit', function(req, res) {
		manager.validateEditModel(req.body, function(model, valid) {
			if (valid) {
				req.body.userName = req.user.userName;
				users.updateUser(req.body, function(user, err) {
					if (err) {
						res.status(err.status).write(templates.errorTemplate({
							message: err.message,
							loggedUser: req.user ? req.user.userName : ''
						}));
					} else if (!user) {
						res.redirect('/');
					} else {
						res.redirect('/' + user.userName);
					}
					res.end();
				});
			} else {
				res.send(templates.editTemplate(model));
				res.end();
			}
		});
	});

	router.get('/followers', function(req, res) {
		// profile previews for all followers + description + follow/unfollow link
		// VIEW: main.html, PARTIALS: people.html (followers or following)
	});

	router.get('/following', function(req, res) {
		// profile previews for all following + description + follow/unfollow link
		// VIEW: main.html, PARTIALS: people.html (followers or following)
	});

	router.post('/login', function(req, res) {
		manager.validateLoginModel(req.body, function(user, valid) {
			if (valid) {
				var publicUser = {
					userName: user.userNameLogin
				};
				req.login(publicUser, function(err) {
					if (err) {
						res.status(err.status).write(templates.errorTemplate({
							message: err.message,
							loggedUser: req.user ? req.user.userName : ''
						}));
					} else {
						res.redirect('/feed');
					}
					res.end();
				});
			} else {
				res.send(templates.homeTemplate(user));
				res.end();
			}
		});
	});

	router.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	router.post('/register', function(req, res) {
		manager.validateRegisterModel(req.body, function(model, valid) {
			if (valid) {
				req.body.password = manager.generateHash(req.body.password);
				users.createUser(req.body, function(user, err) {
					if (err) {
						res.status(err.status).write(templates.errorTemplate({
							message: err.message,
							loggedUser: req.user ? req.user.userName : ''
						}));
					} else if (!user) {
						res.redirect('/');
					} else {
						var publicUser = {
							userName: user.userName
						}
						req.login(publicUser, function(err) {
							if (err) {
								res.status(err.status).write(templates.errorTemplate({
									message: err.message,
									loggedUser: req.user ? req.user.userName : ''
								}));
							} else {
								res.redirect('/feed');
							}
						});
					}
					res.end();
				});
			} else {
				res.send(templates.homeTemplate(model));
				res.end();
			}
		});
	});

	router.post('/post', function(req, res) {
		if (req.user) {
			users.getUserByUserName(req.user.userName, function(user, err) {
				if (err) {
					return res.status(err.status).send(templates.errorTemplate({
						message: err.message,
						loggedUser: req.user.userName
					}));
				}

				var author = manager.getAuthorModel(user);
				messages.createMessage(req.body, author, function(message, err) {
					if (err) {
						return res.status(err.status).write(templates.errorTemplate({
							message: err.message,
							loggedUser: req.user.userName
						}));
					}

					res.redirect('/feed');
				});
			});
		} else {
			res.redirect('/');
		}
	});

	router.post('/search/:query', function(req, res) {
		// searches tvyts by hashtags
	});

	router.get('/:userName', function(req, res) {
		users.getUserByUserName(req.params.userName, function(user, err) {
			if (err) {
				return res.status(err.status).send(templates.errorTemplate({
					message: err.message,
					loggedUser: req.user ? req.user.userName : 'None'
				}));
			}
			var model = manager.getUserProfileModel(user);
			model.loggedUser = req.user ? req.user.userName : 'None';
			res.send(templates.mainTemplate(model));
		});
	});

	return router;
};