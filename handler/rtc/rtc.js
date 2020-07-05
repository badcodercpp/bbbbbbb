var express=require('express')
var path=require('path')
var app = express();
var http = require('http').createServer(app);
const io = require('socket.io')(http, {pingTimeout: 30000})
const PORT = process.env.PORT || 5000

app.use(express.static(path.join(__dirname, 'public')))
app.get('/', function(req, res) {
   res.sendfile('testRTC.html');
});
app.get('/testRTC',function(req,res){
	res.sendfile(__dirname+'/public/testRTC.html')
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

http.listen(PORT, function() {
   console.log('listening on *:3000');
});