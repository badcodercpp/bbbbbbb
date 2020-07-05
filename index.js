import express from 'express';
import doLogin from './handler/login';
import doSignup from './handler/signup';
import doAdminStuffs from './handler/admin/query';
import doGetMapData from './handler/mapData';
import doGetProfile from './handler/profile';
import doGetUserDetails from './handler/details/user';
import { checkToken } from './middleware/token';
import sendOtp from './handler/otp';
const path = require('path');
const bodyParser = require('body-parser')
const useragent = require('express-useragent');
var multer  = require('multer')
const jsonParser = bodyParser.json();
const PORT = process.env.PORT || 5001;
var upload = multer({ dest: 'uploads/' })
const app = express();
app.use(express.static(path.join(__dirname, 'public')))
var http = require('http').createServer(app);
const io = require('socket.io')(http, {pingTimeout: 30000});

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Expose-Headers", "*")
  next();
});

app.use(useragent.express());

app.get('/test', (req, res) => {
  res.send('hello world')
});

app.post('/login', jsonParser, (req, res) => {
  return doLogin(req, res)
})

app.post('/signup', jsonParser, (req, res) => {
  return doSignup(req, res)
})

app.get('/mapdata', jsonParser, (req, res) => {
  return doGetMapData(req, res)
})

app.post('/doAdminStuffs', jsonParser, (req, res) => {
  return doAdminStuffs(req, res)
})

app.post('/profile/:id', jsonParser, (req, res) => {
  return doGetProfile(req, res);
})

app.post('/userDetails', jsonParser, checkToken, (req, res) => {
  return  doGetUserDetails(req, res);
})

app.post('/uploadMedia', jsonParser, checkToken, (req, res) => {
  return  doUploadMedia(req, res);
})

app.post('/sendOtp', jsonParser, (req, res) => {
  sendOtp().then(data => {
    console.log(data)
  })
})

app.post('/uploadVideo', upload.single(Date.now().toString()), function (req, res, next) {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
  console.log("hi", req.file)
})

let ar=[];
var roomList = {};
let socketSess={};
function socketIdsInRoom(name) {
  var socketIds = io.nsps['/'].adapter.rooms[name];
  if (socketIds) {
    var collection = [];
    for (var key in socketIds) {
      collection.push(key);
    }
    return collection;
  } else {
    return [];
  }
}

io.on('connection', function(socket) {
    socket.on('join_room',function(data){
      let d=JSON.parse(data);
      room[d.me]=socket.id;
    })
    socket.on('disconnect', function () {
      console.log('A user disconnected');
    });
    socket.on('start_chat',function(message){
        let ob={
            to:message.to,
            sdp:message.sdp
        }
        let too=room[message.to];
        io.to(too).emit('chatting',ob)
    })
    socket.on('ice_candidate',function(message){
        let ob={
            to:message.to,
            candidate:message.candidate
        }
        let too=room[message.to];
        io.to(too).emit('isIceCandidate',ob)
    })
    socket.on('disconnect', function(){
        if (socket.room) {
        var room = socket.room;
        io.to(room).emit('leave', socket.id);
        socket.leave(room);
        }
    });
    socket.on('join', function(name, callback){
        socket.join(name);
        socket.room = name;
        ar.push({name:name,socket:socket.id})
        io.in(name).clients((err , clients) => {
            let cl=[];
            for(let b of clients){
                if(b!=socket.id){
                    cl.push(b)
                }
            }
            callback(cl);
        }); 
    });
    socket.on('exchange', function(data){
        console.log('exchange', data);
        data.from = socket.id;
        var to=io.to(data.to);
        to.emit('exchange', data);
    });
    socket.on('preserveSocketId', function(data){
        socketSess[data] = socket.id;
    });
    socket.on('invite_video_p', function(data){
        let tom=socketSess[data.to];
        var to=io.to(tom);
        to.emit('invite_video_p', data.Room);
    });
    socket.on('answer',function(data){
        let tom=socketSess[data];
        var to=io.to(tom);
        to.emit('answer', tom);
    })
    socket.on('invite_video', function(data){
        let tom=socketSess[data.to];
        var to=io.to(tom);
        to.emit('invite_video', data.Room);
    });
});


// app.listen(PORT, () => console.log(`Listening on ${ PORT }`))

http.listen(PORT, function() {
  console.log(`Listening on ${ PORT }`);
});
