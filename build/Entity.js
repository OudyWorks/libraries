'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _plural = require('plural');

var _plural2 = _interopRequireDefault(_plural);

var _case2 = require('case');

var _case3 = _interopRequireDefault(_case2);

var _Redis = require('./Redis');

var _Redis2 = _interopRequireDefault(_Redis);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const emitter = new _events2.default();

class Entity {
    // Events
    static on() {
        emitter.on.apply(this, arguments);
    }
    static once() {
        emitter.once.apply(this, arguments);
    }
    static emit() {
        emitter.emit.apply(this, arguments);
    }

    // name in plural
    static get pluralName() {
        return (0, _plural2.default)(this.name);
    }

    static caseName(_case) {
        return _case3.default[_case](this.name);
    }
    static casePluralName(_case) {
        return _case3.default[_case](this.pluralName);
    }
}

Entity.__defineSetter__('redisRefs', function (refs) {
    this._redisRefs = refs;
    this.redisRefs.forEach(key => {
        if (key == 'id') this.on('new', state => {
            _Redis2.default.batch.sadd(this.getRedisKey(key, state), `${state.id}`);
        });else this.on('save', async update => {
            if (update.changes && update.changes.includes(key)) {
                if (update.object && update.object[key]) await _Redis2.default.batch.hdel(this.getRedisKey(key, state), update.object[key]);
                if (update[this.caseName('lower')] && update[this.caseName('lower')][key]) await _Redis2.default.batch.hset(this.getRedisKey(key, state), update[this.caseName('lower')][key], `${update.id}`);
            }
        });
    });
});

Entity.__defineGetter__('redisRefs', function (refs) {
    return this._redisRefs;
});

exports.default = Entity;