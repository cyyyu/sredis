(function() {
  'use strict'

  var TableView = new Vue({
    el: '#table-container',
    data: initdata,
    computed: {
      totalKeys: function() {
        var vm = this
        var keyspace = vm.Keyspace
        var count = 0
        for (var i in keyspace) {
          if (typeof keyspace[i] === 'string')
            count += parseInt(keyspace[i].trim().split(',')[0].split('=')[1])
        }
        return count
      }
    }
  })

  /* socket io */
  var socket = io.connect()
  socket.on('update', updateViews)
  socket.on('updateHistory', updateCharts)

  /* funcs */
  function updateViews(data) {
    Object.assign(TableView, data)
  }

  function updateCharts(history) {
    /* Got history, update charts now. */
    console.debug('got history: ', history)
  }

})()
