"use strict";

var fs = require("fs");
var request = require("request");

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url_mongo = 'mongodb://localhost:27017/test';

var location = [-73.576856,45.498964];

var findStations = function(location, db, callback) {
   var cursor =db.stations.find({
                                "ba": { $ne: 0},
                                "loc": {
                                    $near: {
                                        $geometry: {
                                            type: "Point" ,
                                            coordinates: [ -73.57685, 45.498964 ]
                                        },
                                        $maxDistance: 1000,
                                        }
                                    }
                                }).limit(10);
   cursor.each(function(err, doc) {
      assert.equal(err, null);
      if (doc != null) {
         console.dir(doc);
      } else {
         callback();
      }
   });
};

var getJSON = function(api_key) {
    var url_JSON = "https://maps.googleapis.com/maps/api/directions/json?origin=45.498964,-73.576856&destination=45.49947,-73.57591&departure_time=now&mode=walking&key=" + api_key;
    request.get({
        url: url_JSON,
        json: true,
    }, (err, res, data) => {
        if (err) {
        console.log('Error:', err);
        } else if (res.statusCode !== 200) {
        console.log('Status:', res.statusCode);
        } else {
        console.log(data["routes"][0]["legs"][0]["duration"]["value"]);
        }
    });
}

var api_key = fs.readFileSync('../directionsapikey.txt').toString();
getJSON(api_key);

MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  findStations(location, db, function() {
      db.close();
  });
});