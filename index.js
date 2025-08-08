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

//Start Server
serv.listen(process.env.PORT); // specified port or 8k as backup
console.log('Using port '+process.env.PORT); // log which port was used
//route main page in index
app.get('/',function(req, res) {
  res.sendFile(__dirname + '/client/index.html');
});
//Serve static files
app.use('/client',express.static(__dirname + '/client'));
