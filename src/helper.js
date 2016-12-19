'use strict'

exports.genCsvFields = function genCsvFields(j) {
  return ['time', 'connected_clients', 'client_longest_output_list', 'blocked_clients', 'used_memory', 'used_memory_human', 'used_memory_rss', 'used_memory_rss_human', 'used_memory_peak', 'used_memory_peak_human', 'used_memory_lua', 'used_memory_lua_human', 'maxmemory', 'maxmemory_human', 'mem_fragmentation_ratio', 'mem_allocator', 'total_connections_received', 'total_commands_processed', 'instantaneous_ops_per_sec', 'rejected_connections', 'sync_full', 'sync_partial_ok', 'sync_partial_err', 'expired_keys', 'evicted_keys', 'keyspace_hits', 'keyspace_misses', 'pubsub_channels', 'pubsub_patterns', 'latest_fork_usec', 'used_cpu_sys', 'used_cpu_user', 'used_cpu_sys_children', 'used_cpu_user_children']
}

exports.genCsvData = function genCsvData(fields, j) {
  let data = Date()

  fields.map(function(k) {
    for (let i in j) {
      for (let g in j[i]) {
        if (g.toLowerCase() === k.toLowerCase()) {
          data += ',' + j[i][g]
          delete j[i][g]
          break
        }
      }
    }
  })

  return data + '\r\n'
}

exports.beautify = function beautify(d) {
  let re = {},
    tmp1, tmp2

  d.split('#').map(function(item) {
    tmp1 = item.split('\r\n')
    tmp2 = tmp1[0].trim()
    if (tmp2) {
      re[tmp2] = {}
      tmp1.slice(1).map(function(i) {
        i = i.trim().split(':')
        if (i[0])
          re[tmp2][i[0]] = i[1]
      })
    }
  })

  return re
}
