var express = require('express');
var app = express();
var server = app.listen(5000);
var socket = require('socket.io');
var io = socket(server);
var allPlayers = {};

app.use(express.static('public'));

console.log('My server is running!!!');

io.sockets.on('connection', newConnection);

function Player(pos, xx, yy) {
  this.pos = pos;
  this.xx = xx;
  this.yy = yy;
}

function newConnection(socket) {
  console.log('New connection: ' + socket.id);

  allPlayers[socket.id] = new Player([30, 30], 200, 200);

  var data = [socket.id, allPlayers];

  var player = [socket.id, allPlayers[socket.id]];

  socket.emit('getplayers', data);

  //io.sockets.emit('getplayers', allPlayers);

  socket.broadcast.emit('getnewplayer', player);

  socket.on('move', sendPosition);

  socket.on('cursor', sendCursors);

  socket.on('disconnect', removePlayer);

  function sendPosition(data) {
    data.id = socket.id;
    allPlayers[socket.id].pos[0] = data.x;
    allPlayers[socket.id].pos[1] = data.y;
    socket.broadcast.emit('move', data);
    //console.log(socket.id + ': ' + data.x + ', ' + data.y);
  }

  function sendCursors(data) {
    data.id = socket.id;
    allPlayers[socket.id].xx[0] = data.xx;
    allPlayers[socket.id].yy[1] = data.yy;
    socket.broadcast.emit('cursor', data);
    //console.log(socket.id + ': ' + data.xx + ', ' + data.yy);
  }

  function removePlayer() {
    console.log('Disconnected: ' + socket.id);
    socket.broadcast.emit('deleteplayer', socket.id);
    delete allPlayers[socket.id];
  }
}
