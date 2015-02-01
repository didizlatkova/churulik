var express = require('express'),
	router = express.Router(),
	handlebars = require("handlebars");

module.exports = function(database, templates) {
	var usersDb = database.collection('users'),
		messagesDb = database.collection('messages'),
		users = require('../db/users')(usersDb);

	router.get('/', function(req, res) {
		// tvyter homepage
		// 1. if logged in user - show feed
		// 	- profile preview : # of tvyts, followers, following
		//	- popular tags
		//	- last 20 tvyts of following users (endless scrolling), update in 20s
		// VIEW: main.html, PARTIALS: profile.html (without description), popular.html, addMessage.html, messages.html
		// 2. if new user - show login/register home page
		// VIEW: home.html, PARTIALS: login.html, register.html
		res.send('Hello World!');
	});

	router.get('/feed', function(req, res) {
		// tvyter feed
		// 	- profile preview : # of tvyts, followers, following
		//	- popular tags
		//	- last 20 tvyts of following users (endless scrolling), update in 20s
		// VIEW: main.html, PARTIALS: profile.html (without description), popular.html, addMessage.html, messages.html
		res.send('feed');
	});

	router.get('/profile', function(req, res) {
		// profile page + description
		// show the profile of currently logged user
		// 	- profile preview : # of tvyts (with delete button), followers, following
		//	- popular tags
		//	- last 20 tvyts (endless scrolling)
		// VIEW: main.html, PARTIALS: profile.html, messages.html
	});

	router.get('/edit', function(req, res) {
		// edit profile page
		// show the profile of currently logged user 
		// input fields for name, description and picture
		// VIEW: main.html, PARTIALS: edit.html
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
		// logs the user by username and password
	});

	router.post('/logout', function(req, res) {
		// logs out the user
	});

	router.post('/register', function(req, res) {
		// registers the user by name, username and password
	});

	router.post('/post', function(req, res) {
		// posts a tvyt
	});

	router.post('/search/:query', function(req, res) {
		// searches tvyts by hashtags
	});

	router.get('/:userName', function(req, res) {
		var userName = req.params.userName;
		try {
			users.getUserByUserName(userName, function(user) {
				user.messages = user.messages ? user.messages.length : 0;
				user.following = user.following ? user.following.length : 0;
				user.followers = user.followers ? user.followers.length : 0;
				res.send(templates.mainTemplate(user));
			});
		} catch (err) {
			return res.status(500).send();
		}
	});

	return router;
};