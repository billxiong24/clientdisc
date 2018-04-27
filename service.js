var http = require('http');
var Machine = require('./machine.js');

class Service extends Machine {
    
    constructor(host, port) {
        super(host, port);
        this._route = '/heartbeat';
    }


    heartbeat(disc_host, disc_port) {
        var postData = {
            name: 'service',
            host: this.host,
            port: this.port
        };

        const options = {
            hostname: disc_host,
            port: disc_port,
            path: this._route,
            method: 'POST',
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
