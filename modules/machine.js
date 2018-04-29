class Machine {
    constructor(host, port) {
        this._host = host;
        this._port = port;
    }

    get port() {
        return this._port;
    }

    get host() {
        return this._host;
    }
}

module.exports = Machine;
