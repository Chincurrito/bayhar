const express = require('express'); // load express package
const app = express(); //create express app
const serv = require('http').Server(app); //serve http over app
const io = require('socket.io')(serv); // connect socket.io to server
const fs = require('fs'); // load file system package
var everUsedIDS = [];
var bans = []
var startedTime = new Date(); // convenient
const uuid = require('uuid') // load uuid package
var tokens = [] 
// HTTP SERVER
///////////////////////////////////////////////////
const port = 3000;
//Start Server
serv.listen(3000); // specified port or 8k as backup
console.log('Started server at '+startedTime+' on port '+port); // log which port was used
//route main page in index
app.get('/',function(req, res) {
  res.sendFile(__dirname + '/client/index.html');
});
//Serve static files
app.use('/client',express.static(__dirname + '/client'));

io.sockets.on('connection', function (socket) {
    // listeners go here
    socket.emit('handshake')
})
