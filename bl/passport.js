var LocalStrategy = require('passport-local').Strategy;

module.exports = function(database, templates, passport) {
    var usersDb = database.collection('users'),
        users = require('../db/users')(usersDb),
        manager = require('./manager')(database);

    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(user, done) {
        done(null, user);
    });

    passport.use('local-signup', new LocalStrategy({
            usernameField: 'userName',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },
        function(req, userName, password, done) {
            process.nextTick(function() {
                users.createUser(req.body, function(user, err) {
                    if (err) {
                        return done(err);
                    }
                    return done(null, user);
                });
            });
        }));
};