describe("messages crud", function() {
    var mongoFunction = require('../mongo.js'),
        database,
        users,
        usersDb,
        messages,
        messagesDb,
        author = {
            userName: 'diditests',
            picture: 'some/path'
        };

    beforeEach(function(done) {
        mongoFunction(function(db) {
            database = db;
            usersDb = database.collection('users');
            messagesDb = database.collection('messages');
            users = require('../../db/users')(usersDb);
            messages = require('../../db/messages')(messagesDb, usersDb);

            done();
        });
    });

    it("find by one hashtag", function(done) {
        var userToCreate = {
            userName: 'diditests',
            picture: 'some/path'
        };
        users.create(userToCreate, function() {
            var messageToCreate = {
                content: 'testing is great! #test',
                location: 'in the office',
                hashtags: ['test']
            };

            messages.create(messageToCreate, author, function(err, message) {
                expect(message).toBeDefined();
                expect(message.hashtags).toBeDefined();
                expect(message.hashtags.length).toBe(1);

                messages.findByHashtags(['test'], function(found, err) {
                    expect(found).toBeDefined();
                    expect(err).toBeUndefined();
                    expect(found.length).toBe(1);
                    expect(found[0].content.indexOf('test') !== -1);
                    done();
                });
            });
        });
    });

    it("find by two hashtags", function(done) {
        var messageToCreate = {
            content: 'testing is great! #test #awesome',
            location: 'in the office',
            hashtags: ['test', 'awesome']
        };

        messages.create(messageToCreate, author, function() {
            messages.findByHashtags(['test', 'awesome'], function(found, err) {
                expect(found).toBeDefined();
                expect(err).toBeUndefined();
                expect(found.length).toBe(1);
                expect(found[0].content.indexOf('test') !== -1);
                expect(found[0].content.indexOf('awesome') !== -1);

                done();
            });
        });
    });

    it("find n popular hashtags", function(done) {
        var messageToCreate = {
            content: 'testing is great! #test #awesome #yeah',
            location: 'in the office',
            hashtags: ['test', 'awesome', 'yeah']
        };

        messages.create(messageToCreate, author, function() {
            messages.getNPopularHashtags(2, function(hashtags) {
                expect(hashtags).toBeDefined();
                expect(hashtags.length).toBe(2);
                expect(hashtags[0]._id).toBe('test');
                expect(hashtags[1]._id).toBe('awesome');

                usersDb.drop(function() {
                    messagesDb.drop(function() {
                        done();
                    });
                });
            });
        });
    });
});
