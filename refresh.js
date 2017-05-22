'use strict';

var request = require("request");
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var url_mongo = 'mongodb://localhost:27017/test';
var url_JSON = 'https://secure.bixi.com/data/stations.json';

var getJSON = function(db,callback) {
    request.get({
        url: url_JSON,
        json: true,
    }, (err, res, data) => {
        if (err) {
        console.log('Error:', err);
        } else if (res.statusCode !== 200) {
        console.log('Status:', res.statusCode);
        } else {
        // data is already parsed as JSON:
        console.log("new data is being loaded... " + new Date(Date.now()));
        callback(db, data);
        }
    });
}

var updateStations = function(db, stationJSON) {
    var nstation = stationJSON["stations"].length;
    for(var i = 0; i < nstation; i++) {
        db.collection('stations').updateOne({"_id":stationJSON["stations"][i]["id"]},
                                            {
                                                "_id":stationJSON["stations"][i]["id"],
                                                "s":stationJSON["stations"][i]["s"],
                                                "la":stationJSON["stations"][i]["la"],
                                                "lo":stationJSON["stations"][i]["lo"],
                                                "da":stationJSON["stations"][i]["da"],
                                                "ba":stationJSON["stations"][i]["ba"],
                                                "lc":stationJSON["stations"][i]["lc"]
                                            },
                                            {upsert:true});
    }
};

MongoClient.connect(url_mongo, function(err, db) {
    assert.equal(null, err);
    getJSON(db,updateStations);
    setInterval(function() {
        getJSON(db, updateStations);
    }, 30000);
});