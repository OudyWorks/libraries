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
        return Batch.update(update.id, update.payload, this.getCollection(update.collection), this.getDatabase(update.database)).then(
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
                return this.clear(update.id, update.collection, update.database)
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