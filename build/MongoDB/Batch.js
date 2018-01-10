'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _MongoDB = require('../MongoDB');

var _MongoDB2 = _interopRequireDefault(_MongoDB);

var _dataloader = require('dataloader');

var _dataloader2 = _interopRequireDefault(_dataloader);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let loaders = {};

class Batch {
    static async loader(key, collection, database = 'default') {
        if (!loaders[key]) loaders[key] = {};

        if (!loaders[key][database]) loaders[key][database] = {};

        if (!loaders[key][database][collection]) switch (key) {

            case 'load':
                loaders[key][database][collection] = new _dataloader2.default(async keys => {
                    let result = {};
                    await _MongoDB2.default.getDatabase(database).collection(collection).find({
                        _id: {
                            $in: keys.map(key => _MongoDB2.default.IDRegex.test(key) ? _MongoDB2.default.ObjectID(key) : key)
                        }
                    }).toArray().then(documents => {
                        documents.forEach((document, i) => result[`${document._id}`] = document);
                    });
                    return keys.map((key, i) => result[key] || null);
                });
                break;

            case 'query':
                loaders[key][database][collection] = new _dataloader2.default(keys => {
                    return Promise.all(keys.map(async key => {
                        let {
                            query = {},
                            page = 1,
                            limit = 20
                        } = key,
                            cursor = _MongoDB2.default.getDatabase(database).collection(collection).find(query, { _id: 1 });

                        return {
                            list: await cursor.limit(limit).skip(limit * (page - 1)).toArray().then(documents => Batch.loadMany(documents.map(document => `${document._id}`), collection, database)),
                            total: await cursor.count(),
                            page,
                            limit
                        };
                    }));
                }, {
                    cache: false
                });
                break;

            case 'count':
                loaders[key][database][collection] = new _dataloader2.default(keys => {
                    return Promise.all(keys.map(async query => _MongoDB2.default.getDatabase(database).collection(collection).count(query)));
                }, {
                    cache: false
                });
                break;

            case 'insert':

                loaders[key][database][collection] = new _dataloader2.default(async keys => {
                    let bulk = _MongoDB2.default.getDatabase(database).collection(collection).initializeUnorderedBulkOp();
                    keys.forEach(object => bulk.insert(object));
                    return (await bulk.execute()).getInsertedIds().map(id => id._id);
                }, {
                    cache: false
                });

                break;

            case 'update':

                loaders[key][database][collection] = new _dataloader2.default(async keys => {
                    let bulk = _MongoDB2.default.getDatabase(database).collection(collection).initializeUnorderedBulkOp();
                    keys.forEach(([id, payload]) => {

                        if (!Array.isArray(payload)) payload = [payload];

                        payload.filter(payload => Object.values(payload).filter(value => value).length).forEach(payload => bulk.find({
                            _id: _MongoDB2.default.IDRegex.test(id) ? _MongoDB2.default.ObjectID(id) : id
                        }).updateOne(payload));
                    });
                    await bulk.execute();
                    return keys.map(a => true);
                }, {
                    cache: false
                });

                break;

        }

        return loaders[key][database][collection];
    }
    static load(id, collection, database = 'default') {

        return this.loader('load', collection, database).then(loader => loader.load(`${id}`));
    }
    static loadMany(ids, collection, database = 'default') {

        return this.loader('load', collection, database).then(loader => loader.loadMany(ids || []));
    }
    static clear(id, collection, database = 'default') {

        return this.loader('load', collection, database).then(loader => loader.clear(`${id}`));
    }
    static query(query, collection, database = 'default') {

        return this.loader('query', collection, database).then(loader => loader.load(query || {}));
    }
    static count(query, collection, database = 'default') {

        return this.loader('count', collection, database).then(loader => loader.load(query || {}));
    }
    static insert(object, collection, database = 'default') {

        return this.loader('insert', collection, database).then(loader => loader.load(object));
    }
    static update(id, payload, collection, database = 'default') {

        return this.loader('update', collection, database).then(loader => loader.load([id, payload]));
    }
}
exports.default = Batch;