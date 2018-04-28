var redis = require("redis");
var bluebird = require("bluebird");


class RegistryTable {

    constructor(redis_host, redis_port) {
        bluebird.promisifyAll(redis.RedisClient.prototype);
        this._redisClient = redis.createClient(redis_port, redis_host);

        this._DELIM = ":";
    }

    registerDiscoveryService(name, host, port) {
        //returns promise to client
        return this._redisClient.setAsync(name, this._concatValue(host, port));
    }

    retrieveDiscoveryService(name) {
        let that = this;
        return this._redisClient.getAsync(name)
        .then(function(res) {

            if(!res) {
                return null;
            }


            let arr = res.split(that._DELIM);

            return {
                host: arr[0],
                port: arr[1]
            
            };
        });
    }

    _concatValue(host, port) {
        return host + this._DELIM + port;
    }
}

//var reg = new RegistryTable('localhost', 4343);

//reg.registerDiscoveryService('users', 'localhost', 6767);

//reg.retrieveDiscoveryService('asdf').then(function(res) {
    //console.log(res);
//});

module.exports = RegistryTable;
