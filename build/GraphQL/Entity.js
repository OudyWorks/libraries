'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _Entity = require('../Entity');

var _Entity2 = _interopRequireDefault(_Entity);

var _GraphQL = require('../GraphQL');

var _GraphQL2 = _interopRequireDefault(_GraphQL);

var _MongoDB = require('./Entity/MongoDB');

var _MongoDB2 = _interopRequireDefault(_MongoDB);

var _deepmerge = require('deepmerge');

var _deepmerge2 = _interopRequireDefault(_deepmerge);

var _deepObjectDiff = require('deep-object-diff');

var _flatten = require('../flatten');

var _flatten2 = _interopRequireDefault(_flatten);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const arrayMerge = (target, source, optionsArgument) => {
    return source;
};

class GraphQLEntity extends _Entity2.default {
    static resolveLoad(args, context) {
        return this.load(args.id);
    }
    static resolveQuery(args, context) {
        return this.query(args);
    }
    static queries() {
        return {
            [this.caseName('camel')]: Object.assign(_GraphQL2.default.queryType(this.type, this.context), {
                resolve(source, args, context) {
                    this.context.forEach(key => context[key] = args[key]);
                    return this.resolveLoad(args, context);
                }
            }),
            [this.casePluralName('camel')]: Object.assign(_GraphQL2.default.queryListType(this.type, this.pluralName, this.context), {
                resolve(source, args, context) {
                    this.context.forEach(key => context[key] = args[key]);
                    return this.resolveQuery(args, context);
                }
            })
        };
    }
    static async resolveMutation(args, context) {
        let name = this.caseName('camel'),
            id = args.id || '',
            state = args[name],
            erred = false,
            errors = {},
            changed = false,
            changes = [],
            payload = {},
            _id;

        if (this.validateContext) await this.validateContext(context, errors);

        let object = await this.resolveLoad(args, context);

        if (this.validate) await this.validate(state, object, errors, context);

        added = (0, _flatten2.default)((0, _deepObjectDiff.addedDiff)(object, state));
        updated = (0, _flatten2.default)((0, _deepObjectDiff.updatedDiff)(object, state));
        deleted = Object.keys(state).length ? (0, _flatten2.default)((0, _deepObjectDiff.deletedDiff)(object, state)) : {};

        delete deleted._id;

        changes = Object.keys(Object.assign({}, added, updated, deleted));

        erred = !!Object.values((0, _flatten2.default)(errors)).filter(e => e).length;
        changed = !!changes.length;

        if (changed && !erred) {

            payload = await this.buildPayload({
                added,
                updated,
                deleted,
                object,
                state
            });

            if (object._id) {
                await this.update({
                    id: object._id,
                    payload,
                    [name]: state,
                    object,
                    context
                });
            } else _id = await this.insert({
                payload,
                collection: store,
                store,
                [name]: state,
                context
            });
        }

        return {
            [name]: Object.assign((0, _deepmerge2.default)(object, state, { arrayMerge }), {
                _id: `${object._id || _id}`
            }),
            erred,
            errors,
            changed,
            changes
        };
    }
    static mutations() {
        return {
            [this.caseName('camel')]: Object.assign(_GraphQL2.default.mutationType(this.type, this.context), {
                resolve(source, args, context) {
                    this.context.forEach(key => context[key] = args[key]);
                    return this.resolveMutation(args, context);
                }
            })
        };
    }
    static get MongoDB() {
        return (0, _MongoDB2.default)(this);
    }
    static async validateContext(args, errors) {}
}

GraphQLEntity.context = [];

exports.default = GraphQLEntity;