'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (GraphQLEntity) {
    return class GraphQLMongoDBEntity extends (0, _mixin2.default)(_Entity2.default, GraphQLEntity) {
        static async buildPayload({ added, updated, deleted, object, state }) {
            if (object._id) {

                let $set = deepmerge(added, updated, { arrayMerge }),
                    $unset = {},
                    $pullAll = {};

                Object.keys(deleted).forEach(key => {
                    if (deleted[key] == undefined) {
                        if (key.match(/\.\d+$/)) {
                            if (!$pullAll[key.replace(/\.\d+$/, '')]) $pullAll[key.replace(/\.\d+$/, '')] = [];
                            $pullAll[key.replace(/\.\d+$/, '')].push(objectPath.get(object, key));
                        } else $unset[key] = true;
                    }
                });

                $set = Object.keys($set).length ? $set : undefined, $unset = Object.keys($unset).length ? $unset : undefined;
                $pullAll = Object.keys($pullAll).length ? $pullAll : undefined;

                return [{ $set }, { $unset }, { $pullAll }];
            } else return diff(object, state);
        }
    };
};

var _Entity = require('../../MongoDB/Entity');

var _Entity2 = _interopRequireDefault(_Entity);

var _Entity3 = require('../Entity');

var _Entity4 = _interopRequireDefault(_Entity3);

var _mixin = require('mixin');

var _mixin2 = _interopRequireDefault(_mixin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }