const express = require('express'); // load express package
const app = express(); //create express app
const serv = require('http').Server(app); //serve http over app
const io = require('socket.io')(serv,{maxHttpBufferSize: 1e8}); // connect socket.io to server
const fs = require('fs'); // load file system package
const path = require('path')
const { resolve } = require('path');
var startedTime = new Date(); // convenient
const uuid = require('uuid') // load uuid package
const nodemailer = require('nodemailer')
const url = require('url')
const hash = require('hash.js')
var tokens = []
var serverData = {}
var allowedImageFormats = ['image/png','image/jpeg','image/gif']
// HTTP SERVER

const port = 3001;

class tripCode{
    constructor(email,name,passwordH,pwdtkn){
        this.email = email;
        this.name = name,
        this.passwordH = passwordH
        this.pwdtkn = pwdtkn
    }
}
class school {
    constructor(mods,boards,name,vfdomain,tcodes,modaccounts){
        this.mods = mods
        this.boards = boards
        this.name = name
        this.vfdomain = vfdomain
        this.codes = tcodes
        this.modaccounts = modaccounts
    }
}
class board {
    constructor(posts,name){
        this.posts = posts
        this.name = name
    }
    static addPost (op,text,comments,isvf,imgpath) {
        var post = new post(op,text,comments,isvf,imgpath)
        this.posts.push(post)
        this.organizePosts()
    }
    static organizePosts() {
        this.posts.sort((a,b) => b.score-a.score)
        this.posts = this.posts.slice(0,50)
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
        score -= (age / 300000 ) // minus one score for every 5 minutes in post age
        return score
    }
    static delAsset () {
        fs.unlinkSync(this.imgpath)
        
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
function registerTrip(school,name,emailAddr,pWord) {
    if ((emailAddr.substring(emailAddr.length - school.vfdomain.length, emailAddr.length) != school.vfdomain) && school.vfdomain != '') {
        return {error:true, message:`Invalid address domain. Please register using the designated domain for this community.`}
    }
    if (pWord.length < 8) {
        return {error:true,message:'Password is too short'}
    }
    for (i=0;i<school.codes.length;i++) {
        if (school.codes[i].email == emailAddr) {
            return {error:true,message:'This email address is already in use!'}
        }
    }
    let usertoken = randLetters(40)
    var tc = new tripCode (mailAddr,name,hash.sha256().update(pWord).digest('hex'),usertoken)
    school.codes.push(tc)
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
     fs.writeFile(dir,buffer.toString('base64'),'base64',(err) => {
        if (err){
            resolve({error:true,message:err})
        }
        else {
            resolve({error:false,message:'Image saved successfully',path:dir,clipath:clientpath})
         }
    })
    })
}
function verifyCode(school,n,p) {
    let trip = ''
    for(i=0;i<school.codes.length;i++){
        if (hash.sha256().update(p).digest('hex') == school.codes[i].passwordH && school.codes[i].name == n) {
            return true
        }
    }
    return false
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
// TEST EMAIL
// var transporter = nodemailer.createTransport({
//     service:'Gmail',
//     auth: {
//         user:'humburgercheeseburger93@gmail.com',
//         pass: 'Horse7Rat$Kilogram'
//    }
// });
// var mailOptions = {
//     from:'humburgercheeseburger93@gmail.com',
//     to:'ekocher26@bayschoolsf.org',
//     subject:'test test',
//     text:'test test'
// }
// transporter.sendMail(mailOptions, function(error, info) {
//     if (error) {
//         console.log(error);
//     } else {
//         console.log('Email sent: ' + info.response)
//     }
// })