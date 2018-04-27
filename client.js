var Machine = require('./machine.js');
var http = require('http');

class Client extends Machine {

    constructor(host, port) {
        super(host, port);
        this._service_route = '/service';
    }

    retrieveServices(disc_host, disc_port, callback) {

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

                data = JSON.parse(data.join(''));

                callback(null, data.locations);
            });
        });

        request.on('error', (e) => {

            console.error('problem with request: ', e.message);
            callback(e, null);
        });

        request.end();
    }
}


module.exports = Client;
