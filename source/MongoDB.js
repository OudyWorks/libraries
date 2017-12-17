import {
    MongoClient,
    ObjectID
} from 'mongodb'
import Batch from './MongoDB/Batch'
import Entity from './MongoDB/Entity'

let databases = {}

export default class MongoDB {
    static configure(url, options, name = 'default') {
        return new Promise((resolve, reject) => {
            MongoClient.connect(url, options, (error, db) => {
                if (error)
                    reject(error)
                else {
                    databases[name] = db
                    resolve(db)
                }
            })
        })
    }
    static getDatabase(name = 'default') {
        return databases[name]
    }
    static get database() {
        return this.getDatabase()
    }
    static get ObjectID() {
        return ObjectID
    }
    static get IDRegex() {
        return /^[0-9a-fA-F]{24}$/
    }
    static get batch() {
        return Batch
    }
    static get entity() {
        return Entity
    }
}