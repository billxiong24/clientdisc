var redis = require("redis");
var bluebird = require("bluebird");


class RegistryTable {

    constructor(redis_host, redis_port) {
        bluebird.promisifyAll(redis.RedisClient.prototype);
        this._redisClient = redis.createClient(redis_port, redis_host);

        this._DELIM = ":";
    }

    //given a service name, store its host and port in redis
    registerDiscoveryService(name, host, port) {
        //returns promise to client
        if(!name || !host || !port) {
            console.log("name or host or port malformed.");

            //return empty promise that returns null
            return new Promise(function(resolve, reject) {
                return resolve(null);
            });
        }

        return this._redisClient.setAsync(name, this._concatValue(host, port));
    }

    //given a service name, retrieve host and port of the corresponding registry
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

    //given a file path, load its content into the registry table
    loadConfigFile(file) {
        //load configuration file
        let config = null;
        try {
            config = require(file);
        }
        catch(err) {
            console.log("Configuration file could not be loaded. Check syntax.");
            return;
        }

        let resFunc = function(key, machine) {
            return function(res) {
                console.log("Added", key, "with address", machine.host + ":" + machine.port, "to registry table");
            };
        };

        for(let key in config) {
            let machine = config[key];
            if(machine.host && machine.port) {

                //this is to avoid error "Functions declared within loops referencing an outer scoped variable"
                var func = resFunc.bind(null, key, machine)();
                
                this.registerDiscoveryService(key, machine.host, machine.port)
                .then(func);

            }
            else {
                console.log('malformed entry', key,  'in registry config file:', file);
            }
        }

    }

    _concatValue(host, port) {
        return host + this._DELIM + port;
    }

}

//var reg = new RegistryTable('localhost', 4343);
//reg.loadConfigFile('./config.json');

module.exports = RegistryTable;
