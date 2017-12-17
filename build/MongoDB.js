'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _mongodb = require('mongodb');

var _Batch = require('./MongoDB/Batch');

var _Batch2 = _interopRequireDefault(_Batch);

var _Entity = require('./MongoDB/Entity');

var _Entity2 = _interopRequireDefault(_Entity);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let databases = {};

class MongoDB {
    static configure(url, options, name = 'default') {
        return new Promise((resolve, reject) => {
            _mongodb.MongoClient.connect(url, options, (error, db) => {
                if (error) reject(error);else {
                    databases[name] = db;
                    resolve(db);
                }
            });
        });
    }
    static getDatabase(name = 'default') {
        return databases[name];
    }
    static get database() {
        return this.getDatabase();
    }
    static get ObjectID() {
        return _mongodb.ObjectID;
    }
    static get IDRegex() {
        return (/^[0-9a-fA-F]{24}$/
        );
    }
    static get batch() {
        return _Batch2.default;
    }
    static get entity() {
        return _Entity2.default;
    }
}
exports.default = MongoDB;