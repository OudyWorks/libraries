'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _amqplib = require('amqplib');

let connections = {};

class RabbitMQ {
    static configure(url, name = 'default') {
        return (0, _amqplib.connect)(url).then(connection => connections[name] = connection);
    }
    static getConnection(name = 'default') {
        return connections[name];
    }
    static get connection() {
        return this.getConnection();
    }
}
exports.default = RabbitMQ;