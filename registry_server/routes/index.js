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

//client sends request here to inquire about network addresses available to
//service a specific request.
router.get('/service', function(req, res, next) {

    redisClient.scanAsync(0, 'MATCH', '*').then(function(val) {
        let locations = val[1];

        if(!locations || locations.length == 0) {
            //no machines avaiable to service the request
            return;
        }
        //locations contains all host and ports of machines able to service requests
        return locations;

    })
    .then(function(locations) {
        //send back the service locations to the client
        console.log("Sending server locations:", locations);

        res.send({
            locations: locations
        });
    });
});

//service sends request to here if want to register itself with a heartbeat,
//or if reminding us that it is stll up
router.post('/heartbeat', function(req, res, next) {

    let host = req.body.host;
    let port = req.body.port;

    if(!host || !port) {
        res.send({
            err: "Malformed parameters."
        });
        return;
    }

    let key = getDBKey(host, port);

    redisClient.getAsync(key).then(function(resultKey) {

        //load from configuration file
        let expire = process.env.HEARTBEAT_EXPIRE;

        let heartBeatCheck = expire - 1;

        //key does not exist
        if(resultKey == null) {
            console.log("Service not found, inserting", host, port, "into database.");
            //isnert new service into database
            setExpiringKey(host, port, expire);
            //start sending heartbeat messages
            startHeartBeat(key, heartBeatCheck);
            //send first heartbeat
            sendHeartBeat(res, host, port);
        }
        else {
            //refresh expiring key
            console.log("Received heartbeat from existing service", host, port);
            setExpiringKey(host, port, expire);

            //send back heartbeat
            sendHeartBeat(res, host, port);
        }
    });
});

router.delete('/service', function(req, res, next) {
    let host = req.body.host;
    let port = req.body.port;

    let obj = {

        host: host,
        port: port
    };

    if(!host || !port) {
        res.send(obj);
        return;
    }

    let key = getDBKey(host, port);

    redisClient.delAsync(key).then(function(result) {
        console.log("Deleted", key, "from registry");
        res.send(obj);
    });
});

function sendHeartBeat(res, host, port) {

    //load interval from config file and convert to milliseconds
    let interval = parseInt(process.env.HEARTBEAT_INTERVAL) * 1000;

    //delay sending heartbeat response to avoid flooding network 
    setTimeout(function() {
        var postData = {
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

        // write data to request body
        console.log("Sending heartbeat to", host, port);
        req.write(JSON.stringify(postData));

        //service is down or unresponsive
        req.on('error', function(error) {
            //console.log("Error sending heartbeat request - service unresponsive");
        });

        req.end();
    }, interval);
}

function getDBKey(host, port) {
    return host+ ":" + port;
}

function setExpiringKey(host, port, time) {
    let obj = {
        host: host,
        port: port
    };
    redisClient.setAsync(getDBKey(host, port), JSON.stringify(obj), 'EX', time);
}

function startHeartBeat(key, interval) {
    let intervalID = setInterval(function() {
        redisClient.getAsync(key).then(function(res) {
            //key does not exist, that means that client failed
            //to ping server in time
            if(res == null) {
                console.log("Expired key:", key);
                clearInterval(intervalID);
            }
        });
    }, interval);
}

module.exports = router;
