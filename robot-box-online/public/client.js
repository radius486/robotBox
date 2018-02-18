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

  var targetX,targetY;

  var playerSpeed = 200;

  var bulletSpeed = 2000;

  var enemiesSpeed = 10;

  var triggerDistance = 200;

  var lastPosition=[];

  var player = {
      pos:[30, 30],
      sprite: new Sprite('images/sprites.png', [0, 0], [39, 39], 16, [0, 1]),
      angle: function() {
        return Math.atan2(this.yy - this.pos[1], this.xx - this.pos[0]);
      }
  };

  var playerId;

  var serverplayers = {};

  var bullets=[];

  var canvas = document.getElementById("field");
  var ctx = canvas.getContext("2d");

  socket.on('getownid', function(data) {
    playerId = data;
  });

  socket.on('getplayers', function(data) {
    serverplayers = data;

    for (var key in serverplayers) {
      serverplayers[key].sprite = new Sprite('images/sprites.png', [0, 0], [39, 39], 16, [0, 1]);
    }
  });

  socket.on('getnewplayer', function(key) {
    serverplayers[key] = {
      pos: [30, 30],
      xx: 0,
      yy: 0,
      sprite: new Sprite('images/sprites.png', [0, 0], [39, 39], 16, [0, 1])
    };
  });

  socket.on('deleteplayer', function(key) {
    delete serverplayers[key];
  });


  socket.on('move', updatePosition);

  socket.on('cursor', updateCursors);

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
  ]);

  resources.onReady(init);

  function render() {
    clearCanvas();
    renderEntity(player);
    renderEntities(serverplayers);
    drawCursor(player, '#000000');
  }

  function update(dt) {
    handleinput(dt);
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
      // Not render clone of player
      if (key != playerId) {
        renderEntity(list[key]);
        drawCursor(list[key]);
      }
    }
  }

  function updatePosition(data) {
    serverplayers[data.id].pos[0] = data.x;
    serverplayers[data.id].pos[1] = data.y;
  }

  function updateCursors(data) {
    serverplayers[data.id].xx = data.xx;
    serverplayers[data.id].yy = data.yy;
    //console.log(serverplayers[data.id]);
  }

  function drawCursor(entity, color){
    ctx.fillStyle = color || '#ff0000';
    ctx.fillRect(entity.xx-2, entity.yy-2, 4, 4);
  }

  function handleinput(dt) {

    lastPosition=[player.pos[0] ,player.pos[1] ];


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

    if (lastPosition[0] != player.pos[0] || lastPosition[1] != player.pos[1]) {
      var data = {
        x: player.pos[0] ,
        y: player.pos[1]
      };
      socket.emit('move', data);
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
      //console.log(x+','+y);
      var data = {
        xx: player.xx,
        yy: player.yy
      };

      socket.emit('cursor', data);

  }

  function targetClick(e) {
    if (e.pageX !== undefined && e.pageY !== undefined) {
      targetX= e.pageX;
      targetY = e.pageY;
    }
    else {
      targetX = e.clientX + document.body.scrollLeft +
      document.documentElement.scrollLeft;
      targetY = e.clientY + document.body.scrollTop +
      document.documentElement.scrollTop;
    }
    targetX -= canvas.offsetLeft;
    targetY -= canvas.offsetTop;
    console.log('click '+targetX+','+targetY);
    bullets.push({
      pos:[player.pos[0],player.pos[1]],
      sprite: new Sprite('images/sprites.png', [0, 39], [18, 8]) ,
      angle: Math.atan2(targetY - player.pos[1], targetX - player.pos[0])
    });

  }

  function calculateAngle(entity) {
    return Math.atan2(entity.yy - entity.pos[1], entity.xx - entity.pos[0]);
  }

  canvas.addEventListener("mousedown", targetClick, false);
  canvas.addEventListener("mousemove", targetPosition, false);


})();
