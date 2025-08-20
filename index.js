const express = require('express'); // load express package
const app = express(); //create express app
const serv = require('http').Server(app); //serve http over app
const io = require('socket.io')(serv,{maxHttpBufferSize: 1e8}); // connect socket.io to server
const fs = require('fs'); // load file system package
const path = require('path')
const { resolve } = require('path');
var startedTime = new Date(); // convenient
const uuid = require('uuid') // load uuid package
var tokens = []
var serverData = {}
var allowedImageFormats = ['image/png','image/jpeg','image/gif']
// HTTP SERVER
const port = 3000;

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
    constructor(op,text,comments,isvf,imgpath){
        this.date = new Date()
        this.op = op
        this.text = text
        this.comments = comments
        this.isvf = isvf
        this.imgpath = imgpath
    }
    get score() {
        var score = 0
        var age = Date.now() - this.date.getTime()
        if (this.isvf) {
            score += 20
        }
        score -= Math.floor(age / 300000 ) // minus one score for every 5 minutes in post age
        return score
    }
}
class attachment {
    constructor(fullpath,clipath) {
        this.fullpath = fullpath
        this.clipath = clipath
    }
    get remove() {
        fs.unlink(fullpath)
    }
}
//Start Server
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
    console.log('A new user connected. ID: '+socket.id)
    socket.emit('handshake')
    socket.on('getSchool',function (schoolname) {
        
    })
    socket.on('testuploadimage',async function (data,type) {
        processImage(data,type).then((res) => {
             if (res.error) {
                console.log(res.message)
            }
            else {
                io.to(socket.id).emit('testuploadimageres',{path:res.path,clipath:res.clipath})
            }
        })
       
    })
})
function mkpost (trip,rawtxt,schoolid,board,attachments) {

}
async function processImage(buffer,type) {
    return new Promise ((resolve,reject) => {
         let extension = '';
    if (type = 'image/png'){
        extension = '.png'
    }
    else if (type = 'image/jpeg'){
        extension = '.jpeg'
    }
    else if (type = 'image/gif'){
        extension = '.gif'
    }
    else {
        resolve({error:true,message:'invalid file extension'})
    }
    let name = randLetters(25)+extension
    let d = path.join(__dirname,'src')
    let dir = path.join(d,name)
    var clientpath = '/src/'+name
    console.log(buffer.toString('base64'))
     fs.writeFile(dir,buffer.toString('base64'),(err) => {
        if (err){
            resolve({error:true,message:err})
        }
        else {
            resolve({error:false,message:'Image saved successfully',path:dir,clipath:clientpath})
         }
    })
    })
}
function randLetters (length) {
    var chars = 'qwertyuiopasdfghjklzxcvbnm1234567890QWERTYUIOPASDFGHJKLZXCVBNM'
    var opt = ''
    for (i=0;i<length;i++){
        opt += chars[Math.floor(Math.random()*chars.length)]
    }
    return opt
}
async function getBase64 (file) {
    return new Promise((resolve,reject) => {
        const freader = new FileReader()
        freader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    })
}
function processText(rawtext) {
    var text = rawtext.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll(`'`,'&apos;').replaceAll(`"`,'&quot;')
    var lines = text.split('\n')
    var oup = '';
    for (i=0;i<lines.length;i++){
        if (lines[i].trim().substring(0,4) == '&gt;') {
            oup+='<span class = "greentext">'+lines[i]+'</span>\n'
        }
        else {
            oup+=lines[i] + '\n'
        }
    }
    return oup;
}
// var data = fs.readFileSync(__dirname+'/src/IMG_6205.png').toString('base64')
// fs.writeFileSync(__dirname+'/src/chinchilla2.png',data,{encoding:'base64'},(err) => {
//     if (err){console.log(err)}else{console.log('done!')}
// })