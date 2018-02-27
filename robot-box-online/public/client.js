(function(){
  var socket = io.connect(window.location.href);

  var requestAnimFrame = (function(){
      return window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          window.oRequestAnimationFrame      ||
          window.msRequestAnimationFrame     ||
          function(callback){
              window.setTimeout(callback, 1000 / 60);
          };
  })();

  var lastTime;

  var delta = [0, 0];

  var lastDelta = [0, 0];

  var playerSpeed = 200;

  var enemiesSpeed = 10;

  var triggerDistance = 200;

  var player = {
      pos:[30, 30],
      rpos: [30, 30],
      sprite: new Sprite('images/sprites.png', [0, 0], [39, 39], 16, [0, 1]),
      target: [200, 200],
      energy: 100
  };

  var portal = {
    pos: [30, 30],
    sprite: new Sprite('images/portal.png', [0, 0], [50, 50], 16, [0, 1])
  };

  var playerId;

  var serverplayers = {};

  var bullets = [];

  var explosions = [];

  var canvas = document.getElementById("field");
  var ctx = canvas.getContext("2d");

  socket.on('getplayers', function(data) {
    serverplayers = data[1];
    playerId = data[0];

    for (var key in serverplayers) {
      serverplayers[key].sprite = new Sprite('images/sprites.png', [0, 0], [39, 39], 16, [0, 1]);

      if (key == playerId) {
        player = serverplayers[key];
        player.rpos = [];
        player.rpos[0] = player.pos[0];
        player.rpos[1] = player.pos[1];

        delete serverplayers[key];
      }
    }
  });

  socket.on('getnewplayer', function(player) {
    serverplayers[player[0]] = player[1];
    serverplayers[player[0]].sprite = new Sprite('images/sprites.png', [0, 0], [39, 39], 16, [0, 1]);
  });

  socket.on('deleteplayer', function(key) {
    delete serverplayers[key];
  });


  socket.on('move', updatePosition);

  socket.on('cursor', updateCursors);

  socket.on('shoot', function(data) {
    var bullet = data;

    bullet.sprite = new Sprite('images/sprites.png', [0, 39], [18, 8]);

    bullet.distance = function() {
      return Math.sqrt(Math.pow((bullet.pos[0] - bullet.start[0]), 2) + Math.pow((bullet.pos[1] - bullet.start[1]), 2));
    };

    bullets.push(bullet);
  });

  socket.on('damage', function(data) {
    serverplayers[data.id].energy -= data.damage;
    console.log('Player ' + data.id + ' energy: ' + serverplayers[data.id].energy);
  });

  function main() {
    var now = Date.now();
    var dt = (now - lastTime) / 1000.0;
    render();
    update(dt);

    lastTime = now;
    requestAnimFrame(main);
  }

  function init() {
    lastTime = Date.now();
    main();
  }

  resources.load([
    'images/sprites.png',
    'images/box.png',
    'images/portal.png'
  ]);

  resources.onReady(init);

  function render() {
    clearCanvas();
    renderEntity(portal, 0, delta);
    renderEntity(player, calculateAngle(player, true), [0, 0], true);
    renderEntities(serverplayers);
    renderItems(bullets);
    renderItems(explosions);
    drawCursor(player, '#000000');
  }

  function update(dt) {
    handleinput(dt);
    updatePlayer(dt);
    updateEntities(dt, serverplayers);
    updateBullets(dt);
    updateExplosions(dt);
  }

  function clearCanvas(){
    canvas.width = canvas.width;
  }

  function renderEntity(entity, angle, delta, isplayer) {
    delta = typeof delta !== 'undefined' ? delta : [0, 0];
    ctx.save();
    if (isplayer) {
      ctx.translate(entity.rpos[0], entity.rpos[1]);
    } else {
      ctx.translate(entity.pos[0] - delta[0], entity.pos[1] - delta[1]);
    }
    ctx.rotate(angle);
    entity.sprite.render(ctx);
    ctx.restore();
  }

  function renderEntities(list) {
    for (var key in list) {
      renderEntity(list[key], calculateAngle(list[key]), delta, false);
      drawCursor(list[key], '#ff0000', delta);
    }
  }

  function renderItems(list) {
    for(var i=0; i<list.length; i++) {
      renderEntity(list[i], list[i].angle, delta);
    }
  }

  function updatePlayer (dt){
    if (player.energy > 0) {
      player.sprite.update(dt);
    }
  }

  function updateEntities(dt, list) {
    for (var key in list) {
      if (list[key].energy > 0) {
        list[key].sprite.update(dt);
      }
    }
  }

  function sendOrBang(list, data) {
    if (Object.keys(serverplayers).length === 0) {
      socket.emit('move', data);
      return;
    }

    for (var key in list) {
      if (boxCollides(player.pos, player.sprite.size, list[key].pos, list[key].sprite.size) &&
          !boxCollides(player.pos, player.sprite.size, [30, 30], [50, 50])) {
        player.pos = player.lastPosition;
        delta = [lastDelta[0], lastDelta[1]];
        player.rpos = [player.lastPosition[0] - delta[0], player.lastPosition[1] - delta[1]];
        console.log('bang');
        return;
      }
    }

    socket.emit('move', data);
  }

  function updatePosition(data) {
    serverplayers[data.id].pos[0] = data.x;
    serverplayers[data.id].pos[1] = data.y;
  }

  function updateCursors(data) {
    serverplayers[data.id].target = data.target;
  }

  function drawCursor(entity, color, delta){
    ctx.fillStyle = color || '#ff0000';
    delta = typeof delta !== 'undefined' ? delta : [0, 0];
    ctx.fillRect(entity.target[0] - delta[0] - 2, entity.target[1] - delta[1] - 2, 4, 4);
  }

  function shoot() {
    var sprite = new Sprite('images/sprites.png', [0, 39], [18, 8]);
    var angle = Math.atan2(player.target[1] - player.rpos[1], player.target[0] - player.rpos[0]);

    var bullet = {
      pos:[player.pos[0],player.pos[1]],
      start: [player.pos[0], player.pos[1]],
      angle: angle,
      speed: 1000
    };

    socket.emit('shoot', bullet);

    bullet.sprite = sprite;

    bullet.distance = function() {
      return Math.sqrt(Math.pow((bullet.pos[0] - bullet.start[0]), 2) + Math.pow((bullet.pos[1] - bullet.start[1]), 2));
    };

    bullets.push(bullet);
  }

  function updateBullets(dt){
    for(var i=0; i<bullets.length; i++) {
      bullets[i].pos[0] += bullets[i].speed * dt * Math.cos(bullets[i].angle);
      bullets[i].pos[1] += bullets[i].speed * dt * Math.sin(bullets[i].angle);

      //Bullets with serverplayer collision
      for (var key in serverplayers) {
        if(bullets[i] && boxCollides(serverplayers[key].pos, serverplayers[key].sprite.size, bullets[i].pos, bullets[i].sprite.size) && bullets[i].distance() >= 50) {
          explosion(serverplayers[key].pos);
          bullets.splice(i, 1);
          i--;
        }
      }

      if (bullets[i]) {
        //Bullets with player collision
        if (boxCollides(player.pos, player.sprite.size, bullets[i].pos, bullets[i].sprite.size) && bullets[i].distance() >= 50) {
          explosion(player.pos);
          bullets.splice(i, 1);
          player.energy -= 10;
          socket.emit('damage', 10);
          console.log('My player energy: ' + player.energy);
          i--;
        } else if (bullets[i].distance() >= 500) {
          explosion(bullets[i].pos);
          bullets.splice(i, 1);
          i--;
        }
      }
    }
  }

  function explosion(pos){
    explosions.push({
      pos: pos,
      sprite: new Sprite('images/sprites.png',
        [0, 117],
        [39, 39],
        16,
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        null,
        true)
    });
  }

  function updateExplosions(dt){
    for(var i=0; i<explosions.length; i++) {
      explosions[i].sprite.update(dt);

      if(explosions[i].sprite.done) {
        explosions.splice(i, 1);
        i--;
      }
    }
  }

  function collides(x, y, r, b, x2, y2, r2, b2) {
      return !(r <= x2 || x > r2 ||
              b <= y2 || y > b2);
  }

  function boxCollides(pos, size, pos2, size2) {
    return collides(pos[0]-size[0]/2, pos[1]-size[1]/2,
            pos[0]+size[0]/2, pos[1]+size[1]/2,
            pos2[0]-size2[0]/2, pos2[1]-size2[1]/2,
            pos2[0]+size2[0]/2, pos2[1]+size2[1]/2);
  }

  function handleinput(dt) {

    if (player.energy <= 0) { return false; }

    player.lastPosition = [player.pos[0] ,player.pos[1]];
    lastDelta = [delta[0], delta[1]];

    if (input.isDown('DOWN') || input.isDown('s')) {
      player.pos[1]+= Math.floor(playerSpeed * dt);

      if(player.pos[1] > canvas.height/2) {
        player.rpos[1] = canvas.height/2;
        delta[1]+= Math.floor(playerSpeed * dt);
      } else {
        player.rpos[1] = player.pos[1];
      }
    }

    if (input.isDown('UP') || input.isDown('w')) {
      player.pos[1]-= Math.floor(playerSpeed * dt);

      if (player.pos[1] - player.sprite.size[1]/2 < 0) {
        player.pos[1] = player.lastPosition[1];
      }

      if (player.pos[1] > canvas.height/2 || delta[1] > 0) {
        player.rpos[1] = canvas.height/2;
        delta[1]-= Math.floor(playerSpeed * dt);

        if (delta[1] < 0){
          delta[1] = 0;
        }
      } else {
        player.rpos[1] = player.pos[1];
      }
    }

    if (input.isDown('LEFT') || input.isDown('a')) {
      player.pos[0]-= Math.floor(playerSpeed * dt);

      if (player.pos[0] - player.sprite.size[0]/2 < 0) {
        player.pos[0] = player.lastPosition[0];
      }

      if (player.pos[0] > canvas.width/2 || delta[0] > 0) {
        player.rpos[0] = canvas.width/2;
        delta[0]-= Math.floor(playerSpeed * dt);

        if (delta[0] < 0){
          delta[0] = 0;
        }
      } else {
        player.rpos[0] = player.pos[0];
      }
    }

    if (input.isDown('RIGHT') || input.isDown('d')) {
      player.pos[0]+= Math.floor(playerSpeed * dt);

      if (player.pos[0] > canvas.width/2) {
        player.rpos[0] = canvas.width/2;
        delta[0]+= Math.floor(playerSpeed * dt);
      } else {
        player.rpos[0] = player.pos[0];
      }

    }

    if (input.isDown('SPACE') ) {

    }

    if (player.lastPosition[0] != player.pos[0] || player.lastPosition[1] != player.pos[1]) {
      var data = {
        x: player.pos[0],
        y: player.pos[1]
      };
      sendOrBang(serverplayers, data);
    }
  }

  function targetPosition(e) {
    if (player.energy <= 0) { return false; }

    if (e.pageX !== undefined && e.pageY !== undefined) {
      player.target[0] = e.pageX;
      player.target[1] = e.pageY;
    }
    else {
      player.target[0] = e.clientX + document.body.scrollLeft +
      document.documentElement.scrollLeft;
      player.target[1] = e.clientY + document.body.scrollTop +
      document.documentElement.scrollTop;
    }
    player.target[0] -= canvas.offsetLeft;
    player.target[1] -= canvas.offsetTop;

    var data = {
      target: [player.target[0] + delta[0], player.target[1] + delta[1]]
    };

    socket.emit('cursor', data);
  }

  function targetClick(e) {
    if (player.energy <= 0) { return false; }

    if (e.pageX !== undefined && e.pageY !== undefined) {
      player.target[0]= e.pageX;
      player.target[1] = e.pageY;
    }
    else {
      player.target[0] = e.clientX + document.body.scrollLeft +
      document.documentElement.scrollLeft;
      player.target[1] = e.clientY + document.body.scrollTop +
      document.documentElement.scrollTop;
    }
    player.target[0] -= canvas.offsetLeft;
    player.target[1] -= canvas.offsetTop;

    var x = player.target[0] + delta[0];
    var y = player.target[1] + delta[1];

    console.log('Target: '+ x +', '+ y);
    shoot();
  }

  function calculateAngle(entity, isPlayer) {
    if (isPlayer) {
      return Math.atan2(entity.target[1] - entity.rpos[1], entity.target[0] - entity.rpos[0]);
    } else {
      return Math.atan2(entity.target[1] - entity.pos[1], entity.target[0] - entity.pos[0]);
    }
  }

  canvas.addEventListener("mousedown", targetClick, false);
  canvas.addEventListener("mousemove", targetPosition, false);


})();

