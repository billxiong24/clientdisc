require('dotenv').config();
var http = require('http');

var host = process.env.DISC_HOST;
var port = process.env.DISC_PORT;

const options = {
    host: process.env.DISC_HOST,
    port: process.env.DISC_PORT,
    path: '/ping',
    method: 'GET',
    headers: {
            'content-type': 'application/json',
            'accept': 'application/json'
        }
};

const request = http.request(options, (res) => {
    var data = [];
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
            //callback(err, null);
            request.end();
            return;
        }

        var parser = require('./parser.js');

    });
});

request.on('error', (e) => {
    console.error('problem with request: ', e.message);
    //callback(e, null);
});

request.end();
