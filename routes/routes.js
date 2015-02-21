var express = require('express'),
    router = express.Router(),
    handlebars = require("handlebars"),
    path = require('path');

module.exports = function(database, templates) {
    var usersDb = database.collection('users'),
        messagesDb = database.collection('messages'),
        users = require('../db/users')(usersDb),
        messages = require('../db/messages')(messagesDb, usersDb),
        messagesManager = require('../bl/messages-manager')(),
        usersManager = require('../bl/users-manager')(database),
        validator = require('../bl/validator')(database);

    router.get('/', function(req, res) {
        if (req.user) {
            res.redirect('/feed');
        } else {
            res.send(templates.homeTemplate({}));
        }
    });

    router.get('/feed', function(req, res) {
        if (req.user) {
            users.getByUserName(req.user.userName, function(user, err) {
                if (err) {
                    return res.status(err.status).send(templates.errorTemplate({
                        message: err.message
                    }));
                }

                usersManager.getUserFeedModel(user, function(model) {
                    res.send(templates.mainTemplate(model));
                });
            });
        } else {
            res.redirect('/');
        }
    });

    router.get('/edit', function(req, res) {
        if (req.user) {
            users.getByUserName(req.user.userName, function(user, err) {
                if (err) {
                    return res.status(err.status).send(templates.errorTemplate({
                        message: err.message
                    }));
                }

                var model = usersManager.getUserEditModel(user);
                res.send(templates.editTemplate(model));
            });
        } else {
            res.redirect('/');
        }
    });

    router.post('/edit', function(req, res) {
        if (req.user) {
            validator.validateEditModel(req.body, function(model, valid) {
                if (valid) {
                    usersManager.getEditPostModel(req.body, req.user.userName, function(model) {
                        users.update(model, function(user, err) {
                            if (err) {
                                return res.status(err.status).write(templates.errorTemplate({
                                    message: err.message
                                }));
                            }
                            if (!user) {
                                return res.redirect('/');
                            }
                            res.redirect('/' + user.userName);
                        });
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
                var model = usersManager.getUsersModel(users, req.user.userName, 'Следват те');
                res.send(templates.usersTemplate(model));
            });
        } else {
            res.redirect('/');
        }
    });

    router.get('/following', function(req, res) {
        if (req.user) {
            users.getFollowing(req.user.userName, function(users) {
                var model = usersManager.getUsersModel(users, req.user.userName, 'Следваш');
                res.send(templates.usersTemplate(model));
            });
        } else {
            res.redirect('/');
        }
    });

    router.get('/users', function(req, res) {
        if (req.user) {
            users.getAll(function(users) {
                var model = usersManager.getUsersModel(users, req.user.userName, 'Потребители');
                res.send(templates.usersTemplate(model));
            });
        } else {
            res.redirect('/');
        }
    });

    router.post('/login', function(req, res) {
        validator.validateLoginModel(req.body, function(user, valid) {
            if (valid) {
                var publicUser = {
                    userName: user.userNameLogin
                };
                req.login(publicUser, function(err) {
                    if (err) {
                        user.generalError = err.message;
                        return res.send(templates.homeTemplate(user));
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
        validator.validateRegisterModel(req.body, function(model, valid) {
            if (valid) {
                req.body.password = validator.generateHash(req.body.password);
                users.create(req.body, function(user, err) {
                    if (err) {
                        user.generalError = err.message;
                        return res.send(templates.homeTemplate(user));
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
                                return res.send(templates.homeTemplate(user));
                            }

                            res.redirect('/feed');
                        });
                    }
                });
            } else {
                return res.send(templates.homeTemplate(model));
            }
        });
    });

    router.post('/post', function(req, res) {
        if (req.user && req.body.content) {
            users.getByUserName(req.user.userName, function(user, err) {
                if (err) {
                    return res.status(err.status).send(templates.errorTemplate({
                        message: err.message
                    }));
                }

                var author = usersManager.getAuthorModel(user);
                req.body.hashtags = messagesManager.getMessageHashtags(req.body.content);
                messages.create(req.body, author, function(err) {
                    if (err) {
                        return res.status(err.status).write(templates.errorTemplate({
                            message: err.message
                        }));
                    }

                    var suffix = '://' + req.header('host') + '/feed';
                    if (req.header('referer').toString().indexOf(suffix, this.length - suffix.length) !== -1) {
                        usersManager.getUserFeedModel(user, function(model) {
                            res.send(templates.messagesTemplate(model));
                        });
                    } else {
                        usersManager.getUserProfileModel(user, req.user.userName, function(model) {
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
            messages.delete(req.body.id, req.user.userName, function() {
                users.getByUserName(req.user.userName, function(user, err) {
                    if (err) {
                        return res.status(err.status).send(templates.errorTemplate({
                            message: err.message
                        }));
                    }

                    var suffix = '://' + req.header('host') + '/feed';
                    if (req.header('referer').toString().indexOf(suffix, this.length - suffix.length) !== -1) {
                        usersManager.getUserFeedModel(user, function(model) {
                            res.send(templates.messagesTemplate(model));
                        });
                    } else {
                        usersManager.getUserProfileModel(user, req.user.userName, function(model) {
                            res.send(templates.messagesTemplate(model));
                        });
                    }
                });
            });
        } else {
            res.send(undefined);
        }
    });

    router.post('/follow', function(req, res) {
        if (req.user) {
            users.follow(req.user.userName, req.body.user, function(success) {
                var model = {
                    userName: req.body.user,
                    loggedUser: req.user.userName,
                    isFollowedByLoggedUser: success
                };

                res.send(templates.followTemplate(model));
            });
        } else {
            res.send(undefined);
        }
    });

    router.post('/unfollow', function(req, res) {
        if (req.user) {
            users.unfollow(req.user.userName, req.body.user, function(success) {
                var model = {
                    userName: req.body.user,
                    loggedUser: req.user.userName,
                    isFollowedByLoggedUser: !success
                };

                res.send(templates.followTemplate(model));
            });
        } else {
            res.send(undefined);
        }
    });

    router.get('/messages', function(req, res) {
        if (req.user) {
            users.getByUserName(req.user.userName, function(user, err) {
                if (err) {
                    return res.status(err.status).send(templates.errorTemplate({
                        message: err.message
                    }));
                }

                usersManager.getUserFeedModel(user, function(model) {
                    res.send(templates.messagesTemplate(model));
                });
            });
        } else {
            res.send(undefined);
        }
    });

    router.get('/search', function(req, res) {
        if (req.user) {
            messages.findByHashtags(req.query.query.split(' '), function(messages) {
                var model = {
                    messageContents: messagesManager.getMessagesModel(messages),
                    query: req.query.query,
                    loggedUser: req.user.userName
                };

                res.send(templates.searchTemplate(model));
            });
        } else {
            res.redirect('/');
        }
    });

    router.get('/:userName', function(req, res) {
        if (req.user) {
            users.getByUserName(req.params.userName, function(user, err) {
                if (err) {
                    return res.status(err.status).send(templates.errorTemplate({
                        message: err.message
                    }));
                }

                usersManager.getUserProfileModel(user, req.user.userName, function(model) {
                    res.send(templates.mainTemplate(model));
                });
            });
        } else {
            res.redirect('/');
        }
    });

    return router;
};
