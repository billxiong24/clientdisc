require('dotenv').config();

var Client = require('../modules/client/client.js');

var host = process.env.DISC_HOST;
var port = process.env.DISC_PORT;

function parse(command) {

    if(command.startsWith("get machines")) {
        var client = new Client();
        return client.retrieveServicesLocations(host, port);
    }
}

function printAddresses(address_arr) {

    for(let i = 0; i < address_arr.length; i++) {

        console.log("host:", address_arr[i].host);
        console.log("port:", address_arr[i].port);
        console.log("------------------------------");
    
    }


}


module.exports = {
    printAddresses: printAddresses,
    parse: parse
};
