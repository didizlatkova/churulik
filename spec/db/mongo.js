var MongoClient = require('mongodb').MongoClient,
    mongo,
    callback;

MongoClient.connect('mongodb://didizlatkova:Didi123@ds045511.mongolab.com:45511/tvityr-test', function(err, db) {
	if (err) {
		console.error('Cannot connect to the database', err);
		return;
	}

    if (db) {
        mongo = db;
    }

    if (typeof callback === 'function') {
        callback(db);
    }
});

module.exports = function(cb) {
    if (mongo) {
        cb(mongo);
    } else {
        callback = cb;
    }
};