require('dotenv').config();

var host = process.env.DISC_HOST;
var port = process.env.DISC_PORT;

let rl = require('readline');
let readline = rl.createInterface(process.stdin, process.stdout);
readline.setPrompt('registry_server ' + host + ":" + port + ">>> ");
readline.prompt();

var Client = require('../modules/client/client.js');


function parse(command) {
    var client = new Client();

    if(command.startsWith("get machines")) {
        return client.retrieveServicesLocations(host, port)
        .then(function(data) {
        
            if(!data) {
                console.log("No machines registered");
            }
            else {
                printAddresses(data);
            }

            readline.prompt();
        });
    }

    else if(command.startsWith("count machines")) {

        var line = "machines registered.";

        return client.retrieveServicesLocations(host, port).then(function(data) {
            if(!data) {
                console.log("0", line);
            }
            else {
                console.log(data.length.toString(), line);
            }

            readline.prompt();
        });
    }

    else if(command.startsWith("register machine")) {
        let arr = command.split(" ");
        //requires register machine host port
        if(arr.length < 4) {
            console.log("Wrong syntax.");
            readline.prompt();
        }
    
    }
}

function printAddresses(address_arr) {

    for(let i = 0; i < address_arr.length; i++) {

        console.log("host:", address_arr[i].host);
        console.log("port:", address_arr[i].port);
        console.log("------------------------------");
    }
}


//var parser = require('./parser.js');

readline.on('line', function(line) {
    var promise = parse(line, readline);
});

readline.on('close', function() {
    console.log("\n");
    process.exit(0);

});
