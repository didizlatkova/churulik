'use strict'

var http = require('http');

function resultPollingCallback(callback, res) {
    res.setEncoding('utf8');
    res.on('data', function(body) {
        pollData(body, callback);
    });
}

function pollDataCallback(idStr, callback, res) {
    res.setEncoding('utf8');
    res.on('data', function(body) {
        console.log("maybe null body", body);
        if (body === 'null') {
            setTimeout(pollData, 1000, idStr, callback);
        } else {
            callback(body);
        }
    });
}

function pollData(idStr, callback) {
    var req = http.request({
        hostname: 'localhost',
        port: '8080',
        path: '/receive?key=' + idStr.substring(1, 6),
        method: 'GET'
    },
    pollDataCallback.bind(null, idStr, callback));
    req.end();
}

var BASIC_DIRECT_DISTANCE = 10;

var BASIC_NON_DIRECT_DISTANCE = 20;

function byteCount(s) {
    return encodeURI(s).split(/%..|./).length - 1;
}

module.exports = {

    sendGraphRequest: function(usersFollowingsData, retvitedMessagesMetadata, startingUser, targetUser, userCallback) {

        var postData = {
            start: startingUser,
            target: targetUser,
            vertices: {}
        };

        for (var i = usersFollowingsData.length - 1; i >= 0; i--) {
            var followingsArray = usersFollowingsData[i].following || [];
            var followingsFormated = followingsArray.map(function(following) {
                return {
                    neighbourKey: following,
                    distance: BASIC_DIRECT_DISTANCE
                };
            });
            postData.vertices[usersFollowingsData[i].userName] = followingsFormated;
        };

        for (var i = retvitedMessagesMetadata.length - 1; i >= 0; i--) {
            var connected = postData.vertices[retvitedMessagesMetadata[i]._id.author];
            var found = false;
            for (var j = connected.length - 1; j >= 0; j--) {
                if (connected[j].neighbourKey === retvitedMessagesMetadata[i]._id.retvitedFrom) {
                    connected[j].distance -= retvitedMessagesMetadata[i].count;
                    if (connected[j].distance < 0) {
                        connected[j].distance = 0;
                    }
                    found = true;
                    break;
                }
            };
            // Adding indirect connection, the retvit was itself retvited from non-followed user
            if (found === false) {
                var distance = BASIC_NON_DIRECT_DISTANCE - retvitedMessagesMetadata[i].count;
                if (distance < 0) {
                    distance = 0;
                }
                connected.push({
                    neighbourKey: retvitedMessagesMetadata[i]._id.retvitedFrom,
                    distance: distance
                });
            }
        };

        var postDataStr = JSON.stringify(postData);

        var req = http.request({
            hostname: 'localhost',
            port: '8080',
            path: '/task?index=0',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': byteCount(postDataStr)
            }
        },
        resultPollingCallback.bind(null, function(path) {
            userCallback({graphConnection: postData, path: path});
        }));

        req.on('error', function(e) {
          console.log('problem with request: ' + e.message);
        });

        req.write(postDataStr);
        req.end();
    }

};