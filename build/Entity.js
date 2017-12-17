'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _plural = require('plural');

var _plural2 = _interopRequireDefault(_plural);

var _case2 = require('case');

var _case3 = _interopRequireDefault(_case2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const emitter = new _events2.default();

class Entity {
    // Events
    static on() {
        emitter.on.apply(this, arguments);
    }
    static once() {
        emitter.once.apply(this, arguments);
    }
    static emit() {
        emitter.emit.apply(this, arguments);
    }

    // name in plural
    static get pluralName() {
        return (0, _plural2.default)(this.name);
    }

    static caseName(_case) {
        return _case3.default[_case](this.name);
    }
    static casePluralName(_case) {
        return _case3.default[_case](this.pluralName);
    }
}
exports.default = Entity;