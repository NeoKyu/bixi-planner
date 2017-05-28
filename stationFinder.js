"use strict";

var fs = require("fs");
var request = require("request");
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var assert = require('assert');

var current_location = [ -73.57685, 45.498964 ];
var url_mongo = 'mongodb://localhost:27017/test';
var api_key = fs.readFileSync('../directionsapikey.txt').toString();

var findClosestStations = function(location, db) {

    // Find 5 closest non-empty stations within 1km
    db.collection('stations').find({
                                    "ba": { $ne: 0 },
                                    "loc": {
                                        $near: {
                                            $geometry: {
                                                type: "Point" ,
                                                coordinates: location
                                            },
                                            $maxDistance: 1000,
                                            }
                                        }
                                    }).limit(5).toArray(function(err, stations_list) {
                                        if(err) {
                                            console.log('Error:', err);
                                            return [];
                                        }
                                        else  {
                                            db.close();
                                            getTravelTimes(stations_list);
                                        }
                                    });
};

var getTravelTimes = function(locations) {
    var travel_times = [];
    locations.forEach(function(location) {
        var url_JSON = "https://maps.googleapis.com/maps/api/directions/json?origin="
                        +current_location[1]+","
                        +current_location[0]+"&destination="
                        +location["loc"][1]+","
                        +location["loc"][0]+"&departure_time=now&mode=walking&key="
                        +api_key;
        request.get({
            url: url_JSON,
            json: true,
        }, (err, res, data) => {
            if (err) {
            console.log('Error:', err);
            } else if (res.statusCode !== 200) {
            console.log('Status:', res.statusCode);
        } else {
            console.log(data["routes"][0]["legs"][0]["distance"]["value"] + " meters");
            console.log(data["routes"][0]["legs"][0]["duration"]["value"] + " seconds");

            //replace console.log with actual function or TODO here
            console.log( {
                "loc":location,
                "time":data["routes"][0]["legs"][0]["duration"]["value"],
                "distance":data["routes"][0]["legs"][0]["distance"]["value"]
                });
            }
        });
    });
}

MongoClient.connect(url_mongo, function(err, db) {
    assert.equal(null, err);
    findClosestStations(current_location, db);
});