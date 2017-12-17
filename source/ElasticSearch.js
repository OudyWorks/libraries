import {
    Client
} from 'elasticsearch'

let clients = {}

export default class ElasticSearch {
    static configure(options, name = 'default') {
        return new Promise(resolve => {
            clients[name] = new Client(options)
            resolve(clients[name])
        })
    }
    static get client() {
        return this.getClient()
    }
    static getClient(name = 'default') {
        return clients[name]
    }
}