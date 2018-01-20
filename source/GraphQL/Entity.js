import Entity from '../Entity'
import GraphQL from '../GraphQL'
import MongoDB from './Entity/MongoDB'
import deepmerge from 'deepmerge'
import {
    updatedDiff,
    addedDiff,
    deletedDiff
} from 'deep-object-diff'
import flatten from '../flatten'

const arrayMerge = (target, source, optionsArgument) => source

class GraphQLEntity extends Entity {
    static queries() {
        return {
            [this.caseName('camel')]: Object.assign(
                GraphQL.queryType(this.type, this.context),
                {
                    resolve: (source, args, context) => {
                        this.context.forEach(
                            key =>
                                context[key] = args[key]
                        )
                        return this.resolveLoad(args.id, context)
                    }
                }
            ),
            [this.casePluralName('camel')]: Object.assign(
                GraphQL.queryListType(this.type, this.pluralName, this.context),
                {
                    resolve: (source, args, context) => {
                        this.context.forEach(
                            key =>
                                context[key] = args[key]
                        )
                        return this.resolveQuery(args, context)
                    }
                }
            )
        }
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
            _id = ''

        if(this.validateContext)
            await this.validateContext(context, errors)
            
        let object = await this.resolveLoad(id, context) || {}

        if(this.validate)
            await this.validate(state, object, errors, context)

        let added = flatten(addedDiff(object, state)),
            updated = flatten(updatedDiff(object, state)),
            deleted = Object.keys(state).length ? flatten(deletedDiff(object, deepmerge(object, state, {arrayMerge}))) : {}

        delete deleted._id

        changes = Object.keys(Object.assign({}, added, updated, deleted))

        erred = !!Object.values(flatten(errors)).filter(e => e).length
        changed = !!changes.length

        if(changed && !erred) {

            payload = await this.buildPayload(
                    {
                        added,
                        updated,
                        deleted,
                        object,
                        state
                    }
                )

            if(object._id) {
                await this.resolveUpdate(
                    {
                        id: object._id,
                        payload,
                        [name]: state,
                        object,
                        context,
                        changes
                    },
                    context
                )
            } else
                _id = await this.resolveInsert(
                    {
                        payload,
                        [name]: state,
                        object,
                        context,
                        changes
                    },
                    context
                )

        }

        return {
            [name]: Object.assign(
                deepmerge(
                    object,
                    state,
                    {arrayMerge}
                ),
                {
                    _id: `${object._id || _id}`
                }
            ),
            erred,
            errors,
            changed,
            changes
        }
    }
    static mutations() {
        return {
            [this.caseName('camel')]: Object.assign(
                GraphQL.mutationType(this.type, this.context),
                {
                    resolve: (source, args, context) => {
                        this.context.forEach(
                            key =>
                                context[key] = args[key]
                        )
                        return this.resolveMutation(args, context)
                    }
                }
            )
        }
    }
    static get MongoDB() {
        return MongoDB(this)
    }
    static async validateContext(args, errors) {
        
    }
}

GraphQLEntity.context = []

export default GraphQLEntity