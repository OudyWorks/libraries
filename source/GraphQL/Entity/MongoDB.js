import MongoDBEntity from '../../MongoDB/Entity'
import mixin from 'mixin'
import deepmerge from 'deepmerge'
import {
    diff
} from 'deep-object-diff'
import objectPath from 'object-path'
import Redis from '../../Redis'

const arrayMerge = (target, source, optionsArgument) => {
    return source
}

export default function(GraphQLEntity) {
    return class GraphQLMongoDBEntity extends mixin(MongoDBEntity, GraphQLEntity) {
        static getRedisKey(key = 'id', context) {
            let collection
            if(this.context[0])
                collection = context[this.context[0]]
            return `${this.getCollection(collection)}`+(key == 'id' ? '' : `:${key}`)
        }
        static isExistInRedis(id, ref = 'id', context) {
            return ref != 'id' ?
                Redis.batch.hget(this.getRedisKey(ref, context), `${id}`)
                :
                Redis.batch.sismember(this.getRedisKey(ref, context), `${id}`)
        }
        static resolveLoad(id, context) {
            let collection
            if(this.context[0])
                collection = context[this.context[0]]
            return this.load(id, collection)
        }
        static resolveQuery(query, context) {
            let collection
            if(this.context[0])
                collection = context[this.context[0]]
            return this.query(query, collection)
        }
        static resolveUpdate(update, context) {
            if(this.context[0])
                update.collection = context[this.context[0]]
            return this.update(update)
        }
        static resolveInsert(insert, context) {
            if(this.context[0])
                insert.collection = context[this.context[0]]
            return this.insert(insert)
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