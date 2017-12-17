import EventEmitter from 'events'
import plural from 'plural'
import Case from 'case'

const emitter = new EventEmitter()

export default class Entity {
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