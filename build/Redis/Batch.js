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
    static hdel(key, field, client = 'default') {
        if (!batchs.hdel) batchs.hdel = {};
        if (!batchs.hdel[key]) batchs.hdel[key] = new _dataloader2.default(keys => new Promise(resolve => {
            _Redis2.default.getClient(client).hdel(key, keys, () => resolve(keys));
        }), {
            cache: false
        });
        return batchs.hdel[key].load(field);
    }
    static sadd(key, value, client = 'default') {
        if (!batchs.sadd) batchs.sadd = {};
        if (!batchs.sadd[key]) batchs.sadd[key] = new _dataloader2.default(keys => new Promise(resolve => {
            _Redis2.default.getClient(client).sadd(key, keys, () => resolve(keys));
        }), {
            cache: false
        });
        return batchs.sadd[key].load(value);
    }
    static srem(key, value, client = 'default') {
        if (!batchs.srem) batchs.srem = {};
        if (!batchs.srem[key]) batchs.srem[key] = new _dataloader2.default(keys => new Promise(resolve => {
            _Redis2.default.getClient(client).srem(key, keys, () => resolve(keys));
        }), {
            cache: false
        });
        return batchs.srem[key].load(value);
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
exports.default = Batch;