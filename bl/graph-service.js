'use strict'

var http = require('http');
    //var _ = require('lodash');

function statusCallback(res) {
  console.log('STATUS: ' + res.statusCode);
  console.log('HEADERS: ' + JSON.stringify(res.headers));
  res.setEncoding('utf8');
  res.on('data', function (chunk) {
    console.log('BODY: ' + chunk);
  });
  res.on('end', function() {
    console.log('No more data in response.')
  })
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

        userCallback(postData);

        postData = JSON.stringify(postData);

        console.log(postData);

        var req = http.request({
            hostname: '94.236.137.234',
            port: '8080',
            path: '/task?index=0',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': byteCount(postData)
            }
        },
        statusCallback);

        req.on('error', function(e) {
          console.log('problem with request: ' + e.message);
        });

        req.write(postData);
        req.end();
    }

};