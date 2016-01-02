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

module.exports = {

    sendGraphRequest: function(usersFollowingsData, startingUser, callback) {

        var postData = {
            starting: startingUser,
            vertices: {}
        };

        for (var i = usersFollowingsData.length - 1; i >= 0; i--) {
            var followingsArray = usersFollowingsData[i].following || [];
            var followingsFormated = followingsArray.map(function(following){
                return {
                    neighbourKey: following,
                    distance: 10
                };
            });
            postData.vertices[usersFollowingsData[i].userName] = followingsFormated;
        };

        postData = JSON.stringify(postData);

        console.log(postData);

        var req = http.request({
            hostname: '',
            port: '',
            path: '/',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': postData.length
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