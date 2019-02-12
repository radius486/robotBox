var express = require('express');
var app = express();
var server = app.listen(5000);
var socket = require('socket.io');
var io = socket(server);
var allPlayers = {};

app.use(express.static('public'));

console.log('My server is running!!!');

io.sockets.on('connection', newConnection);

function Player(pos, target, energy) {
  this.pos = pos;
  this.target = target;
  this.energy = energy;
}

function newConnection(socket) {
  console.log('New connection: ' + socket.id);

  allPlayers[socket.id] = new Player([30, 30], [200, 200], 100);

  var data = [socket.id, allPlayers];

  var player = [socket.id, allPlayers[socket.id]];

  socket.emit('getplayers', data);

  //io.sockets.emit('getplayers', allPlayers);

  socket.broadcast.emit('getnewplayer', player);

  socket.on('move', sendPosition);

  socket.on('cursor', sendCursors);

  socket.on('shoot', sendBullets);

  socket.on('damage', sendDamage);

  socket.on('disconnect', removePlayer);

  function sendPosition(data) {
    allPlayers[socket.id].pos[0] = data[0];
    allPlayers[socket.id].pos[1] = data[1];
    allPlayers[socket.id].target[0] = data[2];
    allPlayers[socket.id].target[1] = data[3];
    data[4] = socket.id;
    socket.broadcast.emit('move', data);
    console.log(socket.id + ': ' + data[0] + ', ' + data[1]);
  }

  function sendCursors(data) {
    allPlayers[socket.id].target = data;
    data[2] = socket.id;
    socket.broadcast.emit('cursor', data);
    console.log(socket.id + ': ' + data[0] + ', ' + data[1]);
  }

  function sendBullets(data) {
    socket.broadcast.emit('shoot', data);
    console.log(socket.id + ': ' + data);
  }

  function sendDamage(damage) {
    allPlayers[socket.id].energy -= damage;

    var data = {
      id: socket.id,
      damage: damage
    };

    socket.broadcast.emit('damage', data);
    console.log('Player ' + data.id + ' energy: ' + allPlayers[socket.id].energy);
  }

  function removePlayer() {
    console.log('Disconnected: ' + socket.id);
    socket.broadcast.emit('deleteplayer', socket.id);
    delete allPlayers[socket.id];
  }
}
