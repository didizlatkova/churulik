describe("users all", function() {
    var mongoFunction = require('../mongo.js'),
        database,
        usersDb,
        users,
        allUsers = [];

    beforeEach(function(done) {
        mongoFunction(function(db) {
            database = db;
            usersDb = database.collection('users');
            users = require('../../db/users')(usersDb);

            // create dummy users
            var user1 = {
                userName: 'didi123',
                names: 'Didi Tests',
                password: 'nothashed'
            };

            var user2 = {
                userName: 'ivan123',
                names: 'Ivan Tests',
                password: 'nothashed'
            };

            var user3 = {
                userName: 'petar123',
                names: 'Petar Tests',
                password: 'nothashed'
            };

            allUsers.push(user1);
            allUsers.push(user2);
            allUsers.push(user3);

            users.create(user1, function(user) {
                users.create(user2, function(user) {
                    users.create(user3, function(user) {
                        done();
                    });
                });
            });
        });
    });

    it("get all", function(done) {
        users.getAll(function(users, err) {
            expect(err).toBeUndefined();
            expect(users).toBeDefined();
            expect(users.length).toBe(3);
            done();
        });
    });

    it("follow", function(done) {
        users.follow(allUsers[0].userName, allUsers[1].userName, function(success, err) {
            expect(success).toBeTruthy();
            expect(err).toBeUndefined();

            users.getFollowing(allUsers[0].userName, function(following, err) {
                expect(following).toBeDefined();
                expect(err).toBeUndefined();
                expect(following.indexOf(allUsers[1]) !== -1);

                users.getFollowers(allUsers[1].userName, function(followers, err) {
                    expect(followers).toBeDefined();
                    expect(err).toBeUndefined();
                    expect(followers.indexOf(allUsers[0]) !== -1);

                    done();
                });
            });
        });
    });

    it("unfollow", function(done) {
        users.follow(allUsers[0].userName, allUsers[1].userName, function(success, err) {
            users.unfollow(allUsers[0].userName, allUsers[1].userName, function(success, err) {
                expect(success).toBeTruthy();
                expect(err).toBeUndefined();

                users.getFollowing(allUsers[0].userName, function(following, err) {
                    expect(following).toBeDefined();
                    expect(err).toBeUndefined();
                    expect(following.indexOf(allUsers[1]) === -1);

                    users.getFollowers(allUsers[1].userName, function(followers, err) {
                        expect(followers).toBeDefined();
                        expect(err).toBeUndefined();
                        expect(followers.indexOf(allUsers[0]) === -1);

                        done();
                    });
                });
            });
        });
    });

    afterEach(function(done) {
        usersDb.drop(function() {
            done();
        });
    });
});
