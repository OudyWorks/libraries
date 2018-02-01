'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _Redis = require('../Redis');

var _Redis2 = _interopRequireDefault(_Redis);

var _dataloader = require('dataloader');

var _dataloader2 = _interopRequireDefault(_dataloader);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let batchs = {};

class Batch {
    static hmget(key, fields, client = 'default') {
        return new Promise(resolve => {
            _Redis2.default.getClient(client).hmget(key, fields, (error, values) => {
                resolve(values || [null]);
            });
        });
    }
    static hget(key, field, client = 'default') {
        if (!batchs.hget) batchs.hget = {};
        if (!batchs.hget[key]) batchs.hget[key] = new _dataloader2.default(keys => {
            return new Promise(resolve => {
                _Redis2.default.getClient(client).hmget(key, keys, (error, values) => {
                    resolve(values || [null]);
                });
            });
        }, {
            cache: false
        });
        return batchs.hget[key].load(field);
    }
    static hset(key, field, value, client = 'default') {
        if (!batchs.hset) batchs.hset = {};
        if (!batchs.hset[key]) batchs.hset[key] = new _dataloader2.default(keys => {
            let values = [];
            keys.forEach(([field, value]) => values.push(field, value));
            return new Promise(resolve => {
                _Redis2.default.getClient(client).hmset(key, values, () => resolve(keys));
            });
        }, {
            cache: false
        });
        return batchs.hset[key].load([field, value]);
    }
    static sismember(key, value, client = 'default') {
        if (!batchs.sismember) batchs.sismember = {};
        if (!batchs.sismember[key]) batchs.sismember[key] = new _dataloader2.default(keys => new Promise(resolve => {
            _Redis2.default.getClient(client).multi(keys.map(value => ['sismember', key, value])).exec((error, replies) => resolve(replies));
        }), {
            cache: false
        });
        return batchs.sismember[key].load(value);
    }
}

// commands without reply
['hdel', 'sadd', 'srem', 'lpush', 'rpush'].forEach(command => {
    Batch[command] = function (key, value, client = 'default') {

        if (!batchs[command]) batchs[command] = {};

        if (!batchs[command][key]) batchs[command][key] = new _dataloader2.default(keys => new Promise(resolve => {
            _Redis2.default.getClient(client)[command](key, keys, () => resolve(keys));
        }), {
            cache: false
        });

        return batchs[command][key].load(value);
    };
});

exports.default = Batch;