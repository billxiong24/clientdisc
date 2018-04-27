var redis = require("redis");
var bluebird = require("bluebird");



class RegistryTable {

    constructor(redis_host, redis_port) {
        bluebird.promisifyAll(redis.RedisClient.prototype);
        this._redisClient = redis.createClient(redis_port, redis_host);
    }

    registerDiscoveryService(name, host, port) {
    
    }

    retrieveDiscoveryService(name) {
    
    }


}


module.exports = RegistryTable;
