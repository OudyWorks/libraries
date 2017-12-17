'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _Entity = require('../Entity');

var _Entity2 = _interopRequireDefault(_Entity);

var _Redis = require('../Redis');

var _Redis2 = _interopRequireDefault(_Redis);

var _Batch = require('./Batch');

var _Batch2 = _interopRequireDefault(_Batch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class MongoDBEntity extends _Entity2.default {
    static getCollection(collection) {
        return collection || this.collection;
    }
    static getDatabase(database) {
        return database || this.database || 'default';
    }
    static load(id, collection, database) {
        database = this.getDatabase(database);
        collection = this.getCollection(collection);
        return _Batch2.default.load(id, collection, database);
    }
    static loadMany(ids, collection, database) {
        database = this.getDatabase(database);
        collection = this.getCollection(collection);
        return _Batch2.default.loadMany(ids, collection, database);
    }
    static clear(id, collection, database) {
        database = this.getDatabase(database);
        collection = this.getCollection(collection);
        return _Batch2.default.clear(id, collection, database);
    }
    static query(query, collection, database) {
        database = this.getDatabase(database);
        collection = this.getCollection(collection);
        return _Batch2.default.query(query, collection, database);
    }
    static insert(insert) {
        insert.database = this.getDatabase(insert.database);
        insert.collection = this.getCollection(insert.collection);
        return _Batch2.default.insert(insert.payload, insert.collection, insert.database).then(_id => {
            this.emit('new', Object.assign({}, insert, {
                id: `${_id}`
            }));
            this.emit('save', Object.assign({}, insert, {
                id: `${_id}`,
                isNew: true
            }));
            return `${_id}`;
        });
    }
    static update(update) {
        update.database = this.getDatabase(update.database);
        update.collection = this.getCollection(update.collection);
        return _Batch2.default.update(update.id, update.payload, update.collection, update.database).then(() => {
            this.emit('update', Object.assign({}, update));
            this.emit('save', Object.assign({}, insert, {
                update: false
            }));
            return this.clear(update.id);
        });
    }
}

MongoDBEntity.__defineSetter__('collection', function (collection) {
    this._collection = collection;
});

MongoDBEntity.__defineGetter__('collection', function (collection) {
    return this._collection || this.pluralName.toLowerCase();
});

MongoDBEntity.getRedisKey = function (key, state) {
    return `${state.collection}` + (key == 'id' ? '' : `:${key}`);
};

MongoDBEntity.__defineSetter__('redisRefs', function (refs) {
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

MongoDBEntity.__defineGetter__('redisRefs', function (refs) {
    return this._redisRefs;
});

exports.default = MongoDBEntity;