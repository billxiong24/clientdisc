require('dotenv').config();

var host = process.env.DISC_HOST;
var port = process.env.DISC_PORT;

let rl = require('readline');
let readline = rl.createInterface(process.stdin, process.stdout);
readline.setPrompt('registry_server ' + host + ":" + port + ">>> ");
readline.prompt();

var Client = require('../modules/client/client.js');
var Service = require('../modules/service/service.js');


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
        let service = parseAddress(command);
        if(service) {
            service.registerService(host, port);
        }
        readline.prompt();
    }

    else if(command.startsWith("remove machine")) {
        let service = parseAddress(command);
        if(service) {
            service.removeService(host, port);
        }
        readline.prompt();
    }
}

function parseAddress(command) {

    let arr = command.split(" ");
    //requires register machine host port
    if(arr.length < 4) {
        console.log("Wrong syntax.");
        readline.prompt();
        return;
    }

    let comm_host = arr[2];
    let comm_port = arr[3];

    try {
        comm_port = parseInt(comm_port);
    }
    catch(err) {
        console.log("Malformed port.");
        readline.prompt();
        return null;
    }

    return new Service(comm_host, comm_port);
}

function printAddresses(address_arr) {

    for(let i = 0; i < address_arr.length; i++) {

        console.log("host:", address_arr[i].host);
        console.log("port:", address_arr[i].port);
        console.log("------------------------------");
    }
}


readline.on('line', function(line) {
    var promise = parse(line, readline);
});

readline.on('close', function() {
    console.log("\n");
    process.exit(0);

});
