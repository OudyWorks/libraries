'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _elasticsearch = require('elasticsearch');

let clients = {};

class ElasticSearch {
    static configure(options, name = 'default') {
        return new Promise(resolve => {
            clients[name] = new _elasticsearch.Client(options);
            resolve(clients[name]);
        });
    }
    static get client() {
        return this.getClient();
    }
    static getClient(name = 'default') {
        return clients[name];
    }
}
exports.default = ElasticSearch;