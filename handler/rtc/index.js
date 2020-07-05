//var open = require('open');
var express=require('express')
var path=require('path')
var app = express();
var http = require('http').createServer(app);
const io = require('socket.io')(http, {pingTimeout: 30000})
const PORT = process.env.PORT || 5000

//var room={}
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

// haha
//Whenever someone connects this gets executed
io.on('connection', function(socket) {
   console.log('A user connected');
   socket.on('join_room',function(data){
	//socket.emit('test',data)
	let d=JSON.parse(data);
	room[d.me]=socket.id;

	//socket.emit('test',room[d.me])
   })
   //Whenever someone disconnects this piece of code executed
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
    console.log('disconnect');
    if (socket.room) {
      var room = socket.room;
      io.to(room).emit('leave', socket.id);
      socket.leave(room);
    }
  });
  socket.on('join', function(name, callback){
    console.log('join', name);
    socket.join(name);
    socket.room = name;
    ar.push({name:name,socket:socket.id})
    //var socketIds = socketIdsInRoom(name);


    //var clients = io.sockets.clients(name)
	
/*var socketIds=ar
let caaa=[];
for (var i = socketIds.length - 1; i >= 0; i--) {
	if (socketIds[i].name==name) {
		caaa.push(socketIds[i].socket)
	}
}*/

io.in(name).clients((err , clients) => {
    // clients will be array of socket ids , currently available in given room
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
    //var to = io.sockets.connected[data.to];
	var to=io.to(data.to);
    to.emit('exchange', data);
  });


  socket.on('preserveSocketId', function(data){
    //console.log('exchange', data);
    //if (socketSess[data]==undefined) {
    	socketSess[data] = socket.id;
    	//}
    
    //var to = io.sockets.connected[data.to];
	//var to=io.to(data.to);
    //to.emit('exchange', data);
  });

socket.on('invite_video_p', function(data){
    //console.log('exchange', data);
    //data.from = socket.id;
    //var to = io.sockets.connected[data.to];
	//var to=io.to(data.to);
let tom=socketSess[data.to];
var to=io.to(tom);
    to.emit('invite_video_p', data.Room);
  });
  socket.on('answer',function(data){
	let tom=socketSess[data];
var to=io.to(tom);
    to.emit('answer', tom);
  })
//hello
socket.on('invite_video', function(data){
    //console.log('exchange', data);
    //data.from = socket.id;
    //var to = io.sockets.connected[data.to];
	//var to=io.to(data.to);
let tom=socketSess[data.to];
var to=io.to(tom);
    to.emit('invite_video', data.Room);
  });
	
});




http.listen(PORT, function() {
   console.log('listening on *:3000');
});