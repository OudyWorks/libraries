import {
    GraphQLInputObjectType,
    GraphQLObjectType,
    GraphQLString,
    GraphQLID,
    GraphQLList,
    GraphQLBoolean,
    GraphQLNonNull,
    GraphQLInt
} from 'graphql'
import Case from 'case'

import Entity from './GraphQL/Entity'

export default class GraphQL {
    static configFields(Config) {
        return typeof Config.fields == 'function' ? Config.fields() : Config.fields
    }
    static inputType(Type) {
        let Config = Type._typeConfig

        let fields = {},
            _fields = this.configFields(Config)

        Object.keys(_fields).forEach(
            key => {

                if(key == 'id')
                    return

                let type = _fields[key].type,
                    isList = type.constructor.name == 'GraphQLList'
                
                if(isList)
                    type = type.ofType

                switch(type.constructor.name) {
                    case 'GraphQLScalarType':
                        fields[key] = {
                            type
                        }
                        break
                    case 'GraphQLEnumType':
                    case 'GraphQLUnionType':
                        fields[key] = {
                            type: GraphQLString
                        }
                        break
                    case 'GraphQLObjectType':
                        let __fields = this.configFields(type._typeConfig)
                        fields[key] = {
                            type:
                                __fields.id ?
                                    GraphQLID :
                                    this.inputType(type)
                        }
                        break
                }

                if(isList)
                    fields[key] = {
                        type: new GraphQLList(
                            fields[key].type
                        )
                    }
            }
        )
            
        return new GraphQLInputObjectType({
            name: `${Config.name}Input`,
            fields
        })
    }
    static errorType(Type, context = []) {
        let Config = Type._typeConfig

        let fields = {},
            _fields = this.configFields(Config)

        context.forEach(
            key =>
                fields[key] = {
                    type: GraphQLString
                }
        )

        Object.keys(_fields).forEach(
            key => {

                if(key == 'id')
                    return

                let type = _fields[key].type,
                    isList = type.constructor.name == 'GraphQLList'
                
                if(isList)
                    type = type.ofType

                switch(type.constructor.name) {
                    case 'GraphQLScalarType':
                    case 'GraphQLEnumType':
                    case 'GraphQLUnionType':
                        fields[key] = {
                            type: GraphQLString
                        }
                        break
                    case 'GraphQLObjectType':
                        let __fields = this.configFields(type._typeConfig)
                        fields[key] = {
                            type:
                                __fields.id ?
                                    GraphQLString :
                                    this.errorType(type)
                        }
                        break
                }
            }
        )
            
        return new GraphQLObjectType({
            name: `${Config.name}Error`,
            fields
        })
    }
    static mutationType(Type, context = []) {
        let Config = Type._typeConfig,
            args = {}
        context.forEach(
            key =>
                args[key] = {
                    type: new GraphQLNonNull(GraphQLID)
                }
        )
        return {
            type: new GraphQLObjectType({
                name: `${Config.name}Mutation`,
                fields: {
                    [Case.camel(Config.name)]: {
                        type: Type
                    },
                    erred: {
                        type: GraphQLBoolean
                    },
                    errors: {
                        type: this.errorType(Type, context)
                    },
                    changed: {
                        type: GraphQLBoolean
                    },
                    changes: {
                        type: new GraphQLList(GraphQLString)
                    }
                }
            }),
            args: Object.assign(
                args,
                {
                    [Case.camel(Config.name)]: {
                        type: new GraphQLNonNull(
                            this.inputType(Type)
                        )
                    },
                    id: {
                        type: GraphQLID,
                        defaultValue: ''
                    }
                }
            )
        }
    }
    static queryType(Type, context = []) {
        let args = {}
        context.forEach(
            key =>
                args[key] = {
                    type: new GraphQLNonNull(GraphQLID)
                }
        )
        return {
            type: Type,
            args: Object.assign(
                args,
                {
                    id: {
                        type: new GraphQLNonNull(GraphQLID)
                    }
                }
            )
        }
    }
    static queryListType(Type, name, context = []) {
        let args = {}
        context.forEach(
            key =>
                args[key] = {
                    type: new GraphQLNonNull(GraphQLID)
                }
        )
        return {
            type: new GraphQLObjectType({
                name,
                fields: {
                    list: {
                        type: new GraphQLList(Type)
                    },
                    total: {
                        type: GraphQLInt
                    },
                    page: {
                        type: GraphQLInt
                    },
                    limit: {
                        type: GraphQLInt
                    }
                }
            }),
            args: Object.assign(
                args,
                {
                    page: {
                        type: GraphQLInt,
                        defaultValue: 1
                    },
                    limit: {
                        type: GraphQLInt,
                        defaultValue: 20
                    }
                }
            )
        }
    }
    static get entity() {
        return Entity
    }
}