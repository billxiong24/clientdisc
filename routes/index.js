var express = require('express');
var redis = require("redis");
var bluebird = require("bluebird");
var http = require('http');

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
    console.log(port, host);

    if(!serviceName || !host || !port) {
        res.send({
            err: "Malformed parameters."
        });
        return;
    }

    redisClient.getAsync(serviceName).then(function(resultKey) {
        let interval = 6;
        let heartBeatCheck = 5;
        //key does not exist
        if(resultKey == null) {
            console.log("inserting service");
            //isnert new service into database
            setExpiringKey(serviceName, interval);
            //start sending heartbeat messages
            startHeartBeat(serviceName, heartBeatCheck);
            sendHeartBeat(res, host, port, serviceName);
        }
        else {
            //refresh expiring key
            console.log("got a heartbeat, refreshing");
            setExpiringKey(serviceName, interval);
            //send back heartbeat
            sendHeartBeat(res, host, port, serviceName);
        }
    });
});

function sendHeartBeat(res, host, port, serviceName) {
    //delay sending heartbeat response to avoid flooding network 
    setTimeout(function() {
        var postData = {
            name: serviceName,
            host: host,
            port: port
        };

        const options = {
            hostname: host,
            port: port,
            path: '/heartbeat',
            method: 'POST',
            headers: {
                    'content-type': 'application/json',
                    'accept': 'application/json'
                }
        };
        const req = http.request(options, (res) => {
            res.setEncoding('utf8');
        });

        req.on('error', (e) => {
            console.error('problem with request: ', e.message);
        });

        // write data to request body
        console.log("pinging service");
        req.write(JSON.stringify(postData));
        req.end();
    }, 1000);
}

function setExpiringKey(key, time) {
    redisClient.setAsync(key, true, 'EX', time);
}

function startHeartBeat(key, interval) {
    let intervalID = setInterval(function() {
        redisClient.getAsync(key).then(function(res) {
            //key does not exist, that means that client failed
            //to ping server in time
            if(res == null) {
                console.log("expired key:", key);
                clearInterval(intervalID);
            }
        });
    }, interval);
}

module.exports = router;
