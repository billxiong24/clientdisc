var http = require('http');
var Machine = require('../machine.js');

class Service extends Machine {
    
    constructor(host, port) {
        super(host, port);
        this._route = '/heartbeat';
    }

    registerService(disc_host, disc_port) {
        this._makeRequest('POST', disc_host, disc_port);
    }

    //provide heartbeat function for services to put in their POST /heartbeat function
    heartbeat(disc_host, disc_port) {
        this._makeRequest('PUT', disc_host, disc_port);
    }

    _makeRequest(reqType, disc_host, disc_port) {
        var postData = {
            host: this.host,
            port: this.port
        };

        const options = {
            hostname: disc_host,
            port: disc_port,
            path: this._route,
            method: reqType,
            headers: {
                    'content-type': 'application/json',
                    'accept': 'application/json'
                }
        };
        const request = http.request(options, (res) => {
            res.setEncoding('utf8');
        });

        request.on('error', (e) => {
            console.error('problem with request: ', e.message);
        });
        // write data to request body
        request.write(JSON.stringify(postData));
        request.end();
    }
}

module.exports = Service;
