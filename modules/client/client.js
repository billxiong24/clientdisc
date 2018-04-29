var Machine = require('../machine.js');
var http = require('http');

class Client extends Machine {

    constructor(host, port) {
        super(host, port);
        this._service_route = '/service';

        //cache service locations in array so we dont have to query registry often
        //flush this cache every so often
        //set cache to null whenever it is invalid - don't set it to []!!!
        this._cache = null;

        //cache timeout (10 seconds)
        this._cache_timeout = 10000;
    }

    //query client discovery service for list of available machines that can service the request
    retrieveServices(disc_host, disc_port, callback) {

        var that = this;

        const options = {
            hostname: disc_host,
            port: disc_port,
            path: this._service_route,
            method: 'GET',
            headers: {
                    'content-type': 'application/json',
                    'accept': 'application/json'
                }
        };


        var data = [];
        const request = http.request(options, (res) => {
            res.setEncoding('utf8');

            //res.on(data) streams the data, so gotta concat everything together.
            //res.on(end) is when all data has been sent, so we can join everything together.
            res.on('data', function(bit) {
                data.push(bit);
            }).on('end', function() {

                //join the data together into a big string,
                //and parse into json
                try {
                    data = JSON.parse(data.join(''));
                }

                catch(err) {
                    console.log("Error parsing JSON response");
                    callback(err, null);
                    request.end();
                    return;
                }

                let dataLocs = that._parseLocs(data.locations);

                //data.locations is an array of host and ports of services up
                that._cache = dataLocs;

                _setCacheTimeout();
                callback(null, dataLocs);
            });
        });

        request.on('error', (e) => {

            console.error('problem with request: ', e.message);
            callback(e, null);
        });

        request.end();
    }

    _setCacheTimeout() {
        //flush cache after 10 seconds
        setTimeout(function() {
            that._cache = null;
        }, that._cache_timeout);
    }

    //given json data, translate it into array of objects of form {host, port}
    _parseLocs(locations) {
        let parsedLocs = [];

        for(let i = 0; i < locations.length; i++) {
            let res = locations[i].split(":");

            //res[0] is host, res[1] is port

            parsedLocs.push({
                host: res[0],
                port: res[1]
            });
        }

        return parsedLocs;
    }

    selectService(disc_host, disc_port, callback) {
        //check cache first 
        if(this._cache != null) {

            //some complicated selection algorithm here
            callback(this._pickBestService(this._cache));
        }

        else {
            retrieveServices(disc_host, disc_port, function(err, locs) {
                callback(this._pickBestService(locs));
            });
        }
    }

    //TODO picking random service right now, use a better selection algorithm in the future.
    _pickBestService(locs) {
        return locs[Math.floor(Math.random() * locs.length)];
    }
}

module.exports = Client;
