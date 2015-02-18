describe("messages crud", function() {
    var mongoFunction = require('./mongo.js'),
        database,
        users,
        usersDb,
        messages,
        author,
        messageId;

    beforeEach(function(done) {
        mongoFunction(function(db) {
            database = db;
            usersDb = database.collection('users');
            var messagesDb = database.collection('messages');
            users = require('../../db/users')(usersDb);
            messages = require('../../db/messages')(messagesDb, usersDb);

            var userToCreate = {
                userName: 'diditests',
                picture: 'some/path'
            };
            users.create(userToCreate, function() {
                author = {
                    userName: 'diditests',
                    picture: 'some/path'
                };
                done();
            });
        });
    });

    it("create", function(done) {
        var messageToCreate = {
            content: 'testing is great!',
            location: 'in the office'
        };

        messages.create(messageToCreate, author, function(err, message) {
            expect(err).toBeNull();
            expect(message).toBeDefined();
            expect(message.content).toEqual(messageToCreate.content);
            expect(message.location).toEqual(messageToCreate.location);
            expect(message.author).toEqual(author);

            messageId = message._id;

            users.getByUserName(author.userName, function(user) {
                expect(user.messages).toBeDefined();
                expect(user.messages.indexOf(messageId) !== -1);

                done();
            });
        });
    });

    it("get latest n by one user", function(done) {
        messages.getLatestNByUsers([author.userName], 10, function(messages, err) {
            expect(messages).toBeDefined();
            expect(err).toBeUndefined();
            expect(messages.length).toEqual(1);
            expect(messages[0].author).toEqual(author);

            done();
        });
    });

    it("get latest n by two users", function(done) {
        var userToCreate = {
            userName: 'mimitests',
            picture: 'some/other/path'
        };
        users.create(userToCreate, function() {
            var author2 = {
                userName: 'mimitests',
                picture: 'some/other/path'
            };
            var messageToCreate1 = {
                content: 'testing1',
                location: 'in the office'
            };
            var messageToCreate2 = {
                content: 'testing2',
                location: 'in the office'
            };
            messages.create(messageToCreate1, author, function() {
                messages.create(messageToCreate2, author2, function() {
                    messages.getLatestNByUsers([author.userName, author2.userName], 2, function(messages, err) {
                        expect(messages).toBeDefined();
                        expect(err).toBeUndefined();
                        expect(messages.length).toEqual(2);
                        expect(messages[0].author).toEqual(author2);
                        expect(messages[1].author).toEqual(author);

                        done();
                    });
                });
            });
        });
    });

    it("delete", function(done) {
        messages.delete(messageId, author.userName, function(err) {
            expect(err).toBeUndefined();

            users.getByUserName(author.userName, function(user) {
                expect(user.messages).toBeDefined();
                expect(user.messages.indexOf(messageId) === -1);

                usersDb.drop(function() {
                    done();
                });
            });
        });
    });
});
