import MongoDBEntity from '../../MongoDB/Entity'
import GraphQLEntity from '../Entity'
import mixin from 'mixin'

export default function(GraphQLEntity) {
    return class GraphQLMongoDBEntity extends mixin(MongoDBEntity, GraphQLEntity) {
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