'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (GraphQLEntity) {
    return class GraphQLMongoDBEntity extends (0, _mixin2.default)(_Entity2.default, GraphQLEntity) {
        static getRedisKey(key = 'id', context) {
            let collection;
            if (this.context[0]) collection = context[this.context[0]];
            return `${this.getCollection(collection)}` + (key == 'id' ? '' : `:${key}`);
        }
        static isExistInRedis(id, ref = 'id', context) {
            return ref != 'id' ? _Redis2.default.batch.hget(this.getRedisKey(ref, context), `${id}`) : _Redis2.default.batch.sismember(this.getRedisKey(ref, context), `${id}`);
        }
        static resolveLoad(id, context) {
            let collection;
            if (this.context[0]) collection = context[this.context[0]];
            return this.load(id, collection);
        }
        static resolveQuery(query, context) {
            let collection;
            if (this.context[0]) collection = context[this.context[0]];
            return this.query(query, collection);
        }
        static resolveUpdate(update, context) {
            if (this.context[0]) update.collection = context[this.context[0]];
            return this.update(update);
        }
        static resolveInsert(insert, context) {
            if (this.context[0]) insert.collection = context[this.context[0]];
            return this.insert(insert);
        }
        static async buildPayload({ added, updated, deleted, object, state }) {
            if (object._id) {

                let $set = (0, _deepmerge2.default)(added, updated, { arrayMerge }),
                    $unset = {},
                    $pullAll = {};

                Object.keys(deleted).forEach(key => {
                    if (deleted[key] == undefined) {
                        if (key.match(/\.\d+$/)) {
                            if (!$pullAll[key.replace(/\.\d+$/, '')]) $pullAll[key.replace(/\.\d+$/, '')] = [];
                            $pullAll[key.replace(/\.\d+$/, '')].push(_objectPath2.default.get(object, key));
                        } else $unset[key] = true;
                    }
                });

                $set = Object.keys($set).length ? $set : undefined, $unset = Object.keys($unset).length ? $unset : undefined;
                $pullAll = Object.keys($pullAll).length ? $pullAll : undefined;

                return [{ $set }, { $unset }, { $pullAll }];
            } else return (0, _deepObjectDiff.diff)(object, state);
        }
    };
};

var _Entity = require('../../MongoDB/Entity');

var _Entity2 = _interopRequireDefault(_Entity);

var _mixin = require('mixin');

var _mixin2 = _interopRequireDefault(_mixin);

var _deepmerge = require('deepmerge');

var _deepmerge2 = _interopRequireDefault(_deepmerge);

var _deepObjectDiff = require('deep-object-diff');

var _objectPath = require('object-path');

var _objectPath2 = _interopRequireDefault(_objectPath);

var _Redis = require('../../Redis');

var _Redis2 = _interopRequireDefault(_Redis);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const arrayMerge = (target, source, optionsArgument) => {
    return source;
};