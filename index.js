const express = require('express'); // load express package
const app = express(); //create express app
const serv = require('http').Server(app); //serve http over app
const io = require('socket.io')(serv); // connect socket.io to server
const fs = require('fs'); // load file system package
var startedTime = new Date(); // convenient
const uuid = require('uuid') // load uuid package
var tokens = [] 
// HTTP SERVER
///////////////////////////////////////////////////
const port = 3000;
//Start Server
class tripCode{
    constructor(email,name,password,pwdtkn){
        this.email = email;
        this.name = name,
        this.password = password
        this.pwdtkn = pwdtkn
    }
}
class school {
    constructor(mods,boards,name,vfdomain){
        this.mods = mods
        this.boards = boards
        this.name = name
        this.vfdomain = vfdomain
    }
}
class board {
    constructor(posts,name){
        this.posts = posts
        this.name = name
    }
}
class post {
    constructor(op,text,comments,isvf){
        this.date = new Date()
        this.op = op
        this.text = text
        this.comments = comments
        this.isvf = isvf
    }
    get score() {
        var score = 0
        var age = Date.now() - this.date.getTime()
        if (this.isvf) {
            score += 20
        }
        score -= Math.floor(age / 60000 ) // minus one score for 
        return score
    }
}
serv.listen(port); // specified port or 8k as backup
console.log('Started server at '+startedTime+' on port '+port); // log which port was used
//route main page in index
app.get('/',function(req, res) {
  res.sendFile(__dirname + '/client/index.html');
});
//Serve static files
app.use('/client',express.static(__dirname + '/client'));
app.use('/src',express.static(__dirname + '/src'))
io.sockets.on('connection', function (socket) {
    // listeners go here
    socket.emit('handshake')
})
