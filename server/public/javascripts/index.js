(function() {
  'use strict'

  var TableView = new Vue({
    el: '#table-container',
    data: initdata
  })
  TableView.Keyspace.totalKeys = countKeys(initdata.Keyspace)

  /* socket io */
  var socket = io.connect()
  socket.on('update', updateViews)

  /* funcs */
  function updateViews(data) {
    Object.assign(TableView, data)

    TableView.Keyspace.totalKeys = countKeys(data.Keyspace)
  }

  function countKeys(keyspace) {
    var count = 0
    for (var i in keyspace) {
      if (typeof keyspace[i] === 'string')
        count += parseInt(keyspace[i].trim().split(',')[0].split('=')[1])
    }
    return count
  }

})()
