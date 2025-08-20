var socket = io()
socket.on('connect_error', function (err){
  console.log('Socket.io did not connect because of '+err)
})
document.getElementById('send').addEventListener('click',function () {
  var file = document.querySelector('input').files[0]
  if (file){
    socket.emit('testuploadimage',file,file.type)
  }
})
socket.on('testuploadimageres',function (res) {
  var i = document.createElement('img')
  i.src = res.clipath
  document.body.appendChild(i)
})