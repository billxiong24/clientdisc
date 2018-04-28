var redis = require("redis");
var bluebird = require("bluebird");


class RegistryTable {

    constructor(redis_host, redis_port) {
        bluebird.promisifyAll(redis.RedisClient.prototype);
        this._redisClient = redis.createClient(redis_port, redis_host);
    }

    registerDiscoveryService(name, host, port) {
        //returns promise to client
        return this._redisClient.setAsync(name, this._concatValue(host, port));
    }

    retrieveDiscoveryService(name) {

        return this._redisClient.getAsync(name);
    }

    _concatValue(host, port) {
        return host + ":" + port;
    }

}

module.exports = RegistryTable;
