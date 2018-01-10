'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _Entity = require('../Entity');

var _Entity2 = _interopRequireDefault(_Entity);

var _Batch = require('./Batch');

var _Batch2 = _interopRequireDefault(_Batch);

var _Redis = require('../Redis');

var _Redis2 = _interopRequireDefault(_Redis);

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
    static count(query, collection, database) {
        database = this.getDatabase(database);
        collection = this.getCollection(collection);
        return _Batch2.default.count(query, collection, database);
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
        return _Batch2.default.update(update.id, update.payload, this.getCollection(update.collection), this.getDatabase(update.database)).then(() => {
            this.emit('update', Object.assign({}, update));
            this.emit('save', Object.assign({}, update, {
                update: false
            }));
            return this.clear(update.id, update.collection, update.database);
        });
    }
}

MongoDBEntity.__defineSetter__('collection', function (collection) {
    this._collection = collection;
});

MongoDBEntity.__defineGetter__('collection', function (collection) {
    return this._collection || this.pluralName.toLowerCase();
});

MongoDBEntity.getRedisKey = function (key, collection = '') {
    return `${this.getCollection(collection)}` + (key == 'id' ? '' : `:${key}`);
};

MongoDBEntity.isExistInRedis = function (id, ref = '', collection = '') {
    return ref ? _Redis2.default.batch.hget(this.getRedisKey(ref, collection), `${id}`) : _Redis2.default.batch.sismember(this.getRedisKey(ref, collection), `${id}`);
};

exports.default = MongoDBEntity;