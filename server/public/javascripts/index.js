(function() {
  'use strict'

  var TableView = new Vue({
    el: '#table-container',
    data: initdata
  })

  var socket = io.connect()
  socket.on('update', function(data) {
    Object.assign(TableView, data)
  })

})()
