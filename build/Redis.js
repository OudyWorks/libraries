'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _redis = require('redis');

var _Batch = require('./Redis/Batch');

var _Batch2 = _interopRequireDefault(_Batch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let clients = {};

class Redis {
    static configure(options, name = 'default') {
        return new Promise((resolve, reject) => {
            clients[name] = (0, _redis.createClient)(options);
            clients[name].on('connect', () => {
                resolve(clients[name]);
            });
            clients[name].on('error', error => {
                reject(error);
            });
        });
    }
    static get client() {
        return this.getClient();
    }
    static getClient(name = 'default') {
        return clients[name];
    }
    static get batch() {
        return _Batch2.default;
    }
}
exports.default = Redis;