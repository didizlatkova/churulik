var express = require('express'),
	router = express.Router(),
	handlebars = require("handlebars"),
	path = require('path');

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
					res.status(err.status).send(templates.errorTemplate({
						message: err.message
					}));
				}

				manager.getUserFeedModel(user, function(model) {
					res.send(templates.mainTemplate(model));
				});
			});
		} else {
			res.redirect('/');
		}
	});

	router.get('/edit', function(req, res) {
		if (req.user) {
			users.getUserByUserName(req.user.userName, function(user, err) {
				if (err) {
					res.status(err.status).send(templates.errorTemplate({
						message: err.message
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
		if (req.user) {
			manager.validateEditModel(req.body, function(model, valid) {
				if (valid) {
					req.body.userName = req.user.userName;
					users.updateUser(req.body, function(user, err) {
						if (err) {
							res.status(err.status).write(templates.errorTemplate({
								message: err.message
							}));
						}
						if (!user) {
							res.redirect('/');
						}
						res.redirect('/' + user.userName);
					});
				} else {
					res.send(templates.editTemplate(model));
				}
			});
		} else {
			res.redirect('/');
		}
	});

	router.get('/followers', function(req, res) {
		if (req.user) {
			users.getFollowers(req.user.userName, function(users) {
				var model = {};
				model.title = 'Следват те';
				model.users = manager.getUsersModel(users, req.user.userName);
				res.send(templates.usersTemplate(model));
			});
		} else {
			res.redirect('/');
		}
	});

	router.get('/following', function(req, res) {
		if (req.user) {
			users.getFollowing(req.user.userName, function(users) {
				var model = {};
				model.title = 'Следваш';
				model.users = manager.getUsersModel(users, req.user.userName);
				res.send(templates.usersTemplate(model));
			});
		} else {
			res.redirect('/');
		}
	});

	router.get('/users', function(req, res) {
		if (req.user) {
			users.getAll(function(users) {
				var model = {};
				model.title = 'Потребители';
				model.users = manager.getUsersModel(users, req.user.userName);
				res.send(templates.usersTemplate(model));
			});
		} else {
			res.redirect('/');
		}
	});

	router.post('/login', function(req, res) {
		manager.validateLoginModel(req.body, function(user, valid) {
			if (valid) {
				var publicUser = {
					userName: user.userNameLogin
				};
				req.login(publicUser, function(err) {
					if (err) {
						user.generalError = err.message;
						res.send(templates.homeTemplate(user));
					}

					res.redirect('/feed');
				});
			} else {
				res.send(templates.homeTemplate(user));
			}
		});
	});

	router.get('/logout', function(req, res) {
		if (req.user) {
			req.logout();
		}
		res.redirect('/');
	});

	router.post('/register', function(req, res) {
		manager.validateRegisterModel(req.body, function(model, valid) {
			if (valid) {
				req.body.password = manager.generateHash(req.body.password);
				users.createUser(req.body, function(user, err) {
					if (err) {
						user.generalError = err.message;
						res.send(templates.homeTemplate(user));
					}
					if (!user) {
						res.redirect('/');
					} else {
						var publicUser = {
							userName: user.userName
						};
						req.login(publicUser, function(err) {
							if (err) {
								user.passwordError = err.message;
								res.send(templates.homeTemplate(user));
							}

							res.redirect('/feed');
						});
					}
				});
			} else {
				res.send(templates.homeTemplate(model));
			}
		});
	});

	router.post('/post', function(req, res) {
		if (req.user && req.body.content) {
			users.getUserByUserName(req.user.userName, function(user, err) {
				if (err) {
					res.status(err.status).send(templates.errorTemplate({
						message: err.message
					}));
				}

				var author = manager.getAuthorModel(user);
				req.body.hashtags = manager.getMessageHashtags(req.body.content);
				messages.createMessage(req.body, author, function(message, err) {
					if (err) {
						res.status(err.status).write(templates.errorTemplate({
							message: err.message
						}));
					}

					var loggedUser = req.user.userName;
					if (req.header('referer') === req.protocol + '://' + req.header('host') + '/feed') {
						users.getUserByUserName(req.user.userName, function(user, err) {
							if (err) {
								res.status(err.status).send(templates.errorTemplate({
									message: err.message
								}));
							}

							manager.getUserFeedModel(user, function(model) {
								res.send(templates.messagesTemplate(model));
							});
						});
					} else {
						manager.getUserProfileModel(req.user, loggedUser, function(model) {
							res.send(templates.messagesTemplate(model));
						});
					}
				});
			});
		} else {
			res.send(undefined);
		}
	});

	router.post('/delete', function(req, res) {
		if (req.user) {
			messages.deleteMessage(req.body.id, req.user.userName, function(success) {
				if (req.header('referer') === req.protocol + '://' + req.header('host') + '/feed') {
					users.getUserByUserName(req.user.userName, function(user, err) {
						if (err) {
							return res.status(err.status).send(templates.errorTemplate({
								message: err.message
							}));
						}

						manager.getUserFeedModel(user, function(model) {
							res.send(templates.messagesTemplate(model));
						});
					});
				} else {
					manager.getUserProfileModel(req.user, req.user.userName, function(model) {
						res.send(templates.messagesTemplate(model));
					});
				}
			});
		} else {
			res.redirect('/');
		}
	});

	router.post('/follow', function(req, res) {
		if (req.user) {
			users.followUser(req.user.userName, req.body.user, function(success) {
				var model = {
					userName: req.body.user,
					loggedUser: req.user.userName
				};
				if (success) {
					model.isFollowedByLoggedUser = true;
				} else {
					model.isFollowedByLoggedUser = false;
				}

				res.send(templates.followTemplate(model));
			});
		} else {
			res.send(undefined);
		}
	});

	router.post('/unfollow', function(req, res) {
		if (req.user) {
			users.unfollowUser(req.user.userName, req.body.user, function(success) {
				var model = {
					userName: req.body.user,
					loggedUser: req.user.userName
				};
				if (success) {
					model.isFollowedByLoggedUser = false;
				} else {
					model.isFollowedByLoggedUser = true;
				}

				res.send(templates.followTemplate(model));
			});
		} else {
			res.send(undefined);
		}
	});

	router.get('/search', function(req, res) {
		if (req.user) {
			messages.findMessagesByHashtags(req.query.query.split(' '), function(messages) {
				var model = {
					messageContents: manager.getMessagesModel(messages),
					query: req.query.query
				};

				res.send(templates.searchTemplate(model));
			});
		} else {
			res.redirect('/');
		}
	});

	router.get('/:userName', function(req, res) {
		if (req.user) {
			users.getUserByUserName(req.params.userName, function(user, err) {
				if (err) {
					res.status(err.status).send(templates.errorTemplate({
						message: err.message
					}));
				}

				manager.getUserProfileModel(user, req.user.userName, function(model) {
					res.send(templates.mainTemplate(model));
				});
			});
		} else {
			res.redirect('/');
		}
	});

	return router;
};