import EventEmitter from 'events'
import plural from 'plural'
import Case from 'case'
import Redis from './Redis'

const emitter = new EventEmitter()

class Entity {

    constructor() {
        
        let emitter = new EventEmitter()
 
        this.on = emitter.on
        this.once = emitter.once
        this.emit = emitter.emit
        this.removeListener = emitter.removeListener

    }

    // Events
    static on() {
        emitter.on.apply(this, arguments)
    }
    static once() {
        emitter.once.apply(this, arguments)
    }
    static emit() {
        emitter.emit.apply(this, arguments)
    }
    static removeListener() {
        emitter.removeListener.apply(this, arguments)
    }

    // name in plural
    static get pluralName() {
        return plural(this.name)
    }

    static caseName(_case) {
        return Case[_case](this.name)
    }
    static casePluralName(_case) {
        return Case[_case](this.pluralName)
    }
}

Entity.__defineSetter__(
    'redisRefs',
    function(refs) {
        this._redisRefs = refs
        this.redisRefs.forEach(
            key => {
                if(key == 'id')
                    this.on(
                        'new',
                        insert => {
                            Redis.batch.sadd(
                                this.getRedisKey(key, insert.context),
                                `${insert.id}`
                            )
                        }
                    )
                else
                    this.on(
                        'save',
                        async update => {
                            if(update.changes && update.changes.includes(key)) {
                                if(update.object && update.object[key])
                                    await Redis.batch.hdel(
                                        this.getRedisKey(key, update.context),
                                        update.object[key]
                                    )
                                if(update[this.caseName('lower')] && update[this.caseName('lower')][key])
                                    await Redis.batch.hset(
                                        this.getRedisKey(key, update.context),
                                        update[this.caseName('lower')][key],
                                        `${update.id}`
                                    )
                            }
                        }
                    )
            }
        )
    }
)

Entity.__defineGetter__(
    'redisRefs',
    function(refs) {
        return this._redisRefs
    }
)

export default Entity
