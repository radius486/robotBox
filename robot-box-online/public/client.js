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

  var playerSpeed = 200;

  var enemiesSpeed = 10;

  var triggerDistance = 200;

  var player = {
      pos:[30, 30],
      sprite: new Sprite('images/sprites.png', [0, 0], [39, 39], 16, [0, 1]),
  };

  var portal = {
    pos: [30, 30],
    sprite: new Sprite('images/portal.png', [0, 0], [50, 50], 16, [0, 1])
  };

  var playerId;

  var serverplayers = {};

  var bullets = [];

  var canvas = document.getElementById("field");
  var ctx = canvas.getContext("2d");

  socket.on('getplayers', function(data) {
    serverplayers = data[1];
    playerId = data[0];

    for (var key in serverplayers) {
      serverplayers[key].sprite = new Sprite('images/sprites.png', [0, 0], [39, 39], 16, [0, 1]);

      if (key == playerId) {
        player = serverplayers[key];
        delete serverplayers[key];
      }
    }

    player.angle = function() {
      return Math.atan2(this.yy - this.pos[1], this.xx - this.pos[0]);
    };

    player.target = [null, null];
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
    drawBullets();
    renderEntity(portal);
    renderEntity(player);
    renderEntities(serverplayers);
    drawCursor(player, '#000000');
  }

  function update(dt) {
    handleinput(dt);
    player.sprite.update(dt);
    updateBullets(dt);
    updateEntities(dt, serverplayers);
  }

  function clearCanvas(){
    canvas.width = canvas.width;
  }

  function renderEntity(entity) {
    ctx.save();
    ctx.translate(entity.pos[0], entity.pos[1]);
    ctx.rotate(calculateAngle(entity));
    entity.sprite.render(ctx);
    ctx.restore();
  }

  function renderEntities(list) {
    for (var key in list) {
      renderEntity(list[key]);
      drawCursor(list[key]);
    }
  }

  function updateEntities(dt, list) {
    for (var key in list) {
      list[key].sprite.update(dt);
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
    serverplayers[data.id].xx = data.xx;
    serverplayers[data.id].yy = data.yy;
  }

  function drawCursor(entity, color){
    ctx.fillStyle = color || '#ff0000';
    ctx.fillRect(entity.xx-2, entity.yy-2, 4, 4);
  }

  function shoot() {
    var sprite = new Sprite('images/sprites.png', [0, 39], [18, 8]);
    var angle = Math.atan2(player.target[1] - player.pos[1], player.target[0] - player.pos[0]);

    var bullet = {
      pos:[player.pos[0],player.pos[1]],
      start: [player.pos[0], player.pos[1]],
      angle: angle,
      speed: 2000
    };

    socket.emit('shoot', bullet);

    bullet.sprite = sprite;

    bullet.distance = function() {
      return Math.sqrt(Math.pow((bullet.pos[0] - bullet.start[0]), 2) + Math.pow((bullet.pos[1] - bullet.start[1]), 2));
    };

    bullets.push(bullet);
  }

  function drawBullets() {
    for(var i=0; i<bullets.length; i++) {
      ctx.save();
      ctx.translate(bullets[i].pos[0], bullets[i].pos[1]);
      ctx.rotate(bullets[i].angle);
      bullets[i].sprite.render(ctx);
      ctx.restore();
    }
  }

  function updateBullets(dt){
    for(var i=0; i<bullets.length; i++) {
      bullets[i].pos[0] += bullets[i].speed * dt * Math.cos(bullets[i].angle);
      bullets[i].pos[1] += bullets[i].speed * dt * Math.sin(bullets[i].angle);

     if ( bullets[i].distance() >= 1000) {
        bullets.splice(i, 1);
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

    player.lastPosition=[player.pos[0] ,player.pos[1]];

    if(input.isDown('DOWN') || input.isDown('s')) {
      player.pos[1]+= playerSpeed * dt;
    }

    if(input.isDown('UP') || input.isDown('w')) {
      player.pos[1]-= playerSpeed * dt;
    }

    if(input.isDown('LEFT') || input.isDown('a')) {
      player.pos[0]-= playerSpeed * dt;
    }

    if(input.isDown('RIGHT') || input.isDown('d')) {
      player.pos[0]+= playerSpeed * dt;
    }

    if(input.isDown('SPACE') ) {

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
      if (e.pageX !== undefined && e.pageY !== undefined) {
          player.xx = e.pageX;
          player.yy = e.pageY;
      }
      else {
          player.xx = e.clientX + document.body.scrollLeft +
          document.documentElement.scrollLeft;
          player.yy = e.clientY + document.body.scrollTop +
          document.documentElement.scrollTop;
      }
      player.xx -= canvas.offsetLeft;
      player.yy -= canvas.offsetTop;

      var data = {
        xx: player.xx,
        yy: player.yy
      };

      socket.emit('cursor', data);

  }

  function targetClick(e) {
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
    console.log('click '+ player.target[0]+','+ player.target[1]);
    shoot();
  }

  function calculateAngle(entity) {
    return Math.atan2(entity.yy - entity.pos[1], entity.xx - entity.pos[0]);
  }

  canvas.addEventListener("mousedown", targetClick, false);
  canvas.addEventListener("mousemove", targetPosition, false);


})();

