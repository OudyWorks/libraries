import MongoDBEntity from '../../MongoDB/Entity'
import mixin from 'mixin'
import {
    diff
} from 'deep-object-diff'
import objectPath from 'object-path'

const arrayMerge = (target, source, optionsArgument) => {
    return source
}

export default function(GraphQLEntity) {
    return class GraphQLMongoDBEntity extends mixin(MongoDBEntity, GraphQLEntity) {
        static resolveLoad(args, context) {
            let collection
            if(this.context[0])
                collection = context[this.context[0]]
            return this.load(args.id, collection)
        }
        static resolveQuery(args, context) {
            let collection
            if(this.context[0])
                collection = context[this.context[0]]
            return this.query(args, collection)
        }
        static resolveUpdate(update, context) {
            let collection
            if(this.context[0])
                collection = context[this.context[0]]
            return this.update(update, collection)
        }
        static resolveInsert(insert, context) {
            let collection
            if(this.context[0])
                collection = context[this.context[0]]
            return this.insert(insert, collection)
        }
        static async buildPayload({added, updated, deleted, object, state}) {
            if(object._id) {
    
                let $set = deepmerge(
                        added,
                        updated,
                        {arrayMerge}
                    ),
                    $unset = {},
                    $pullAll = {}
    
                Object.keys(deleted).forEach(
                    key => {
                        if(deleted[key] == undefined) {
                            if(key.match(/\.\d+$/)) {
                                if(!$pullAll[key.replace(/\.\d+$/, '')])
                                    $pullAll[key.replace(/\.\d+$/, '')] = []
                                $pullAll[key.replace(/\.\d+$/, '')].push(
                                    objectPath.get(object, key)
                                )
                            } else
                                $unset[key] = true
                        }
                    }
                )
    
                $set = Object.keys($set).length ? $set : undefined,
                $unset = Object.keys($unset).length ? $unset : undefined
                $pullAll = Object.keys($pullAll).length ? $pullAll : undefined
    
                return [
                    {$set},
                    {$unset},
                    {$pullAll},
                ]
    
            } else
                return diff(object, state)
        }
    }
}