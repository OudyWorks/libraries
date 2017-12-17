'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _graphql = require('graphql');

var _Entity = require('./GraphQL/Entity');

var _Entity2 = _interopRequireDefault(_Entity);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class GraphQL {
    static configFields(Config) {
        return typeof Config.fields == 'function' ? Config.fields() : Config.fields;
    }
    static inputType(Type) {
        let Config = Type._typeConfig;

        let fields = {},
            _fields = this.configFields(Config);

        Object.keys(_fields).forEach(key => {

            if (key == 'id') return;

            let type = _fields[key].type,
                isList = type.constructor.name == 'GraphQLList';

            if (isList) type = type.ofType;

            switch (type.constructor.name) {
                case 'GraphQLScalarType':
                    fields[key] = {
                        type
                    };
                    break;
                case 'GraphQLEnumType':
                    fields[key] = {
                        type: _graphql.GraphQLString
                    };
                    break;
                case 'GraphQLObjectType':
                    let __fields = this.configFields(type._typeConfig);
                    fields[key] = {
                        type: __fields.id ? _graphql.GraphQLID : this.inputType(type)
                    };
                    break;
            }

            if (isList) fields[key] = {
                type: new _graphql.GraphQLList(fields[key].type)
            };
        });

        return new _graphql.GraphQLInputObjectType({
            name: `${Config.name}Input`,
            fields
        });
    }
    static errorType(Type, context = []) {
        let Config = Type._typeConfig;

        let fields = {},
            _fields = this.configFields(Config);

        context.forEach(key => fields[key] = {
            type: _graphql.GraphQLString
        });

        Object.keys(_fields).forEach(key => {

            if (key == 'id') return;

            let type = _fields[key].type,
                isList = type.constructor.name == 'GraphQLList';

            if (isList) type = type.ofType;

            switch (type.constructor.name) {
                case 'GraphQLScalarType':
                case 'GraphQLEnumType':
                    fields[key] = {
                        type: _graphql.GraphQLString
                    };
                    break;
                case 'GraphQLObjectType':
                    let __fields = this.configFields(type._typeConfig);
                    fields[key] = {
                        type: __fields.id ? _graphql.GraphQLString : this.errorType(type)
                    };
                    break;
            }
        });

        return new _graphql.GraphQLObjectType({
            name: `${Config.name}Error`,
            fields
        });
    }
    static mutationType(Type, context = []) {
        let Config = Type._typeConfig,
            args = {};
        context.forEach(key => args[key] = {
            type: new _graphql.GraphQLNonNull(_graphql.GraphQLID)
        });
        return {
            type: new _graphql.GraphQLObjectType({
                name: `${Config.name}Mutation`,
                fields: {
                    [Config.name.toLowerCase()]: {
                        type: Type
                    },
                    erred: {
                        type: _graphql.GraphQLBoolean
                    },
                    errors: {
                        type: this.errorType(Type, context)
                    },
                    changed: {
                        type: _graphql.GraphQLBoolean
                    },
                    changes: {
                        type: new _graphql.GraphQLList(_graphql.GraphQLString)
                    }
                }
            }),
            args: Object.assign(args, {
                [Config.name.toLowerCase()]: {
                    type: new _graphql.GraphQLNonNull(this.inputType(Type))
                },
                id: {
                    type: _graphql.GraphQLID,
                    defaultValue: ''
                }
            })
        };
    }
    static queryType(Type, context = []) {
        let args = {};
        context.forEach(key => args[key] = {
            type: new _graphql.GraphQLNonNull(_graphql.GraphQLID)
        });
        return {
            type: Type,
            args: Object.assign(args, {
                id: {
                    type: new _graphql.GraphQLNonNull(_graphql.GraphQLID)
                }
            })
        };
    }
    static queryListType(Type, name, context = []) {
        let args = {};
        context.forEach(key => args[key] = {
            type: new _graphql.GraphQLNonNull(_graphql.GraphQLID)
        });
        return {
            type: new _graphql.GraphQLObjectType({
                name,
                fields: {
                    list: {
                        type: new _graphql.GraphQLList(Type)
                    },
                    total: {
                        type: _graphql.GraphQLInt
                    },
                    page: {
                        type: _graphql.GraphQLInt
                    },
                    limit: {
                        type: _graphql.GraphQLInt
                    }
                }
            }),
            args: Object.assign(args, {
                page: {
                    type: _graphql.GraphQLInt,
                    defaultValue: 1
                },
                limit: {
                    type: _graphql.GraphQLInt,
                    defaultValue: 20
                }
            })
        };
    }
    static get entity() {
        return _Entity2.default;
    }
}
exports.default = GraphQL;