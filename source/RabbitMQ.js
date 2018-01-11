import {
    connect
} from 'amqplib'

let connections = {}

export default class RabbitMQ {
    static configure(url, name = 'default') {
        return connect(url).then(
            connection => connections[name] = connection
        )
    }
    static getConnection(name = 'default') {
        return connections[name]
    }
    static get connection() {
        return this.getConnection()
    }
}