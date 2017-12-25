import Entity from '../Entity'
import Batch from './Batch'
import Redis from '../Redis'

class MongoDBEntity extends Entity {
    static getCollection(collection) {
        return collection || this.collection
    }
    static getDatabase(database) {
        return database || this.database || 'default'
    }
    static load(id, collection, database) {
        database = this.getDatabase(database)
        collection = this.getCollection(collection)
        return Batch.load(id, collection, database)
    }
    static loadMany(ids, collection, database) {
        database = this.getDatabase(database)
        collection = this.getCollection(collection)
        return Batch.loadMany(ids, collection, database)
    }
    static clear(id, collection, database) {
        database = this.getDatabase(database)
        collection = this.getCollection(collection)
        return Batch.clear(id, collection, database)
    }
    static query(query, collection, database) {
        database = this.getDatabase(database)
        collection = this.getCollection(collection)
        return Batch.query(query, collection, database)
    }
    static insert(insert) {
        insert.database = this.getDatabase(insert.database)
        insert.collection = this.getCollection(insert.collection)
        return Batch.insert(insert.payload, insert.collection, insert.database).then(
            _id  => {
                this.emit(
                    'new',
                    Object.assign(
                        {},
                        insert,
                        {
                            id: `${_id}`
                        }
                    )
                )
                this.emit(
                    'save',
                    Object.assign(
                        {},
                        insert,
                        {
                            id: `${_id}`,
                            isNew: true
                        }
                    )
                )
                return `${_id}`
            }
        )
    }
    static update(update) {
        update.database = this.getDatabase(update.database)
        update.collection = this.getCollection(update.collection)
        return Batch.update(update.id, update.payload, update.collection, update.database).then(
            () => {
                this.emit(
                    'update',
                    Object.assign(
                        {},
                        update
                    )
                )
                this.emit(
                    'save',
                    Object.assign(
                        {},
                        update,
                        {
                            update: false
                        }
                    )
                )
                return this.clear(update.id)
            }
        )
    }
}

MongoDBEntity.__defineSetter__(
    'collection',
    function(collection) {
        this._collection = collection
    }
)

MongoDBEntity.__defineGetter__(
    'collection',
    function(collection) {
        return this._collection || this.pluralName.toLowerCase()
    }
)

MongoDBEntity.getRedisKey = function(key, collection = '') {
    return `${this.getCollection(collection)}`+(key == 'id' ? '' : `:${key}`)
}

MongoDBEntity.isExistInRedis = function(id, ref = '', collection = '') {
    return ref ?
        Redis.batch.hget(this.getRedisKey(ref, collection), `${id}`)
        :
        Redis.batch.sismember(this.getRedisKey(ref, collection), `${id}`)
}

export default MongoDBEntity