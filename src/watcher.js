'use strict'

const redis = require('redis'),
  EventEmitter = require('events'),
  fs = require('fs'),
  helper = require('./helper.js')

class Sredis extends EventEmitter {
  constructor(options) {
    super()

    let self = this

    self.status = {}
    self.store = []
    self._interval = options.interval || 3000

    self._client = redis.createClient({
      host: options.host || '127.0.0.1',
      port: options.port || 6379,
      password: options.password
    })
    self._client.on('error', self._clientErrorHandler.bind(self))
    self._client.on('connect', self._clientConnectedHandler.bind(self))

    self._store()

    if (options.output) {
      self._bindOutput(options.output)
    }
  }
  _store() {
    let self = this

    self.on('statusUpdated', function(data) {
      self.store.push(data)
      if (self.store.length > 7)
        self.store = self.store.slice(-7)

      self.emit('historyUpdated', self.store)
    })
  }
  _bindOutput(filepath) {
    let self = this

    self.on('statusUpdated', function(data) {
      let fields = helper.genCsvFields(data)
      if (!fs.existsSync(filepath))
        fs.appendFile(filepath, fields.join(',') + '\r\n')

      fs.appendFile(filepath, helper.genCsvData(fields, data))
    })
  }
  _clientConnectedHandler(err) {
    let self = this

    let s = [
      ['script', 'load', 'return redis.call("info")']
    ]

    self.emit('watching')

    self._executer(s, 'scriptsLoading').then(function(re) {
      self._hash = re[0]
      self.emit('scriptsLoaded')
      self._executeInterval()
    })
  }
  _clientErrorHandler(err) {
    let self = this;

    let listenerCount = self.listenerCount('error');

    if (listenerCount) {
      self.emit('error', err)
    } else {
      throw err
    }
  }
  _executer(s, eventname) {
    let self = this

    if (eventname) {
      self.emit(eventname)
    }

    return new Promise(function(resolve, reject) {
      self._client.multi(s).exec(function(err, re) {
        if (err) {
          return reject(err)
        }
        return resolve(re)
      })
    })
  }
  _executeInterval() {
    let self = this;

    let s = [
      ['evalsha', self._hash, '0']
    ]

    setTimeout(function loop() {
      self._executer(s, 'statusUpdating').then(function(re) {
        let beautified = helper.beautify(re[0])
        Object.assign(self.status, beautified)
        self.emit('statusUpdated', beautified)
        setTimeout(loop, self._interval)
      })
    })
  }
}

exports = module.exports = Sredis
