var express = require('express');
var redis = require("redis");
var bluebird = require("bluebird");
var router = express.Router();


bluebird.promisifyAll(redis.RedisClient.prototype);
var redisClient = redis.createClient();


router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.post('/heartbeat', function(req, res, next) {

    let serviceName = req.body.name;
    let host = req.body.host;
    let port = req.body.port;

    if(!serviceName || !host || !port) {
        res.send({
            err: "Malformed parameters."
        });
        return;
    }

    redisClient.getAsync(serviceName).then(function(res) {
        let interval = 7;
        let heartBeatCheck = 12;
        //key does not exist
        if(res == null) {
            setExpiringKey(serviceName, interval);
            startHeartBeat(serviceName, heartBeatCheck);
        }
        else {
            setExpiringKey(serviceName, interval);
            //TODO send back heartbeat

        }

        res.send({
            result: "a response"
        });
    });
});

function setExpiringKey(key, time) {
    redisClient.setAsync(key, true, 'EX', time);
}

function startHeartBeat(key, interval) {
    let intervalID = setInterval(function() {
        redisClient.getAsync(key).then(function(res) {
            //key does not exist, that means that client failed
            //to ping server in time
            if(res == null) {
                clearInterval(intervalID);
            }
        });
    }, interval);
}

module.exports = router;
