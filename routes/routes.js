var express = require('express'),
	router = express.Router();

module.exports = function(database) {
	var users = database.collection('users');
	var messages = database.collection('messages');

	router.get('/', function(req, res) {
		// tvyter homepage
		// 1. if logged in user - show feed
		// 	- profile preview : # of tvyts, followers, following
		//	- popular tags
		//	- last 20 tvyts of following users (endless scrolling), update in 20s
		// 2. if new user - show login/register home page    
		res.send('Hello World!');  
	});

	router.get('/feed', function(req, res) {
		// tvyter feed
		// 	- profile preview : # of tvyts, followers, following
		//	- popular tags
		//	- last 20 tvyts of following users (endless scrolling), update in 20s
		res.send('feed'); 
	});

	router.get('/profile', function(req, res) {
		// profile page + description
		// show the profile of currently logged user
		// 	- profile preview : # of tvyts (with delete button), followers, following
		//	- popular tags
		//	- last 20 tvyts (endless scrolling)
	});

	router.get('/edit', function(req, res) {
		// edit profile page
		// show the profile of currently logged user 
		// input fields for name, description and picture      
	});

	router.get('/followers', function(req, res) {
		// profile previews for all followers + description + follow/unfollow link
	});

	router.get('/following', function(req, res) {
		// profile previews for all following + description + follow/unfollow link
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

	router.post('/search', function(req, res) {
		// searches tvyts by hashtags
	});

	return router;
};