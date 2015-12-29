var FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || "id",
    FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || "secret",
    FacebookStrategy = require('passport-facebook').Strategy;


module.exports = function(passport, database) {
    var usersDb = database.collection('users'),
        users = require('../db/users')(usersDb);

    var registerFacebookUser = function(profile, callback) {
        var user = {
            names: profile.name,
            userName: profile.id,
            birthdate: profile.birthday,
            email: profile.email
        };

        if (profile.gender === 'male') {
            user.gender = 'мъж';
        } else if (profile.gender === 'female') {
            user.gender = 'жена';
        }

        if (profile.picture && profile.picture.data && profile.picture.data.url) {
            user.picture = profile.picture.data.url;
        }

        users.create(user, function(user, err) {
            callback(user);
        });
    };

    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(user, done) {
        done(null, user);
    });
    passport.use(new FacebookStrategy({
            clientID: FACEBOOK_APP_ID,
            clientSecret: FACEBOOK_APP_SECRET,
            callbackURL: "/auth/facebook/callback",
            profileFields: ['id', 'displayName', 'emails', 'gender', 'birthday', 'photos']
        },
        function(accessToken, refreshToken, profile, done) {
            profile = profile._json;
            users.getByUserName(profile.id, function(user) {
                if (user) {
                    return done(null, user);
                }

                if (!profile.email) {
                    registerFacebookUser(profile, function(user) {
                        return done(null, user);
                    });
                } else {
                    users.getByEmail(profile.email, function(user, err) {
                        if (user) {
                            return done(null, user);
                        }
                        registerFacebookUser(profile, function(user) {
                            return done(null, user);
                        });
                    });
                }
            });
        }
    ));
};