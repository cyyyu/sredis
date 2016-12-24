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

    self._client.script('load', 'return redis.call("info")', function(err, re) {
      self._hash = re
      self.emit('scriptsLoaded')
      self._evalLoop()
    })

    self.emit('watching')
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
  _evalLoop() {
    let self = this;

    setTimeout(function loop() {
      self._client.evalsha(self._hash, '0', function(err, re) {
        let beautified = helper.beautify(re)
        Object.assign(self.status, beautified)
        self.emit('statusUpdated', beautified)
        setTimeout(loop, self._interval)
      })
    })
  }
}

exports = module.exports = Sredis
