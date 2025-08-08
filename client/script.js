var socket = io()
socket.on('connect_error', function (err){
  console.log('Socket.io did not connect because of '+err)
})
socket.on('handshake',function () {
    document.write('connected successfuly yippee')
})