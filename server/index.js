'use strict'

const app = require('koa')(),
  router = require('koa-router')(),
  serve = require('koa-static'),
  views = require('koa-views'),
  util = require('util')

let watcher = {},
  server, io;

app.use(serve(__dirname + '/public'))
app.use(views(__dirname + '/views', {
  extension: 'pug'
}))
app.use(router.routes())

router.get('/', function*() {
  let initdata;
  if (watcher) {
    initdata = watcher.status
  }
  yield this.render('index', {
    initdata: JSON.stringify(initdata) || '{}'
  })
})

server = require('http').createServer(app.callback())
io = require('socket.io')(server)

function start(w) {
  Object.assign(watcher, w)
  server.listen(8888, console.log.bind(console, 'Starting web-server at: localhost:8888'))
}

function update(status) {
  io.emit('update', status)
}

function updateHistory(history) {
  io.emit('updateHistory', history)
}

exports.start = start
exports.update = update
exports.updateHistory = updateHistory
