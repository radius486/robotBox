(function(){

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

	var moveWorld = 0;
	var activeWorld = false;

	var lastTime;
	var canvas = document.getElementById("b");
	var ctx = canvas.getContext("2d");

	var player = {
		pos:[30, 30],
		cursor: [200, 200],
		speed: 200,
		sprite: new Sprite('images/sprites.png', [0, 0], [39, 39], 16, [0, 1]),
		render: function () {
							ctx.save();
							ctx.translate(this.pos[0], this.pos[1]);
							ctx.rotate(Math.atan2(this.cursor[1] - this.pos[1], this.cursor[0] - this.pos[0]));
							this.sprite.render(ctx);
							ctx.restore();
							// Cursor
							ctx.fillStyle = '#000000';
							ctx.fillRect(this.cursor[0]-2, this.cursor[1]-2,4,4);
		},
		move: function(dt) {
			lastPosition=[this.pos[0] ,this.pos[1]];
			if(input.isDown('DOWN') || input.isDown('s'))
				this.pos[1]+= this.speed * dt;
			if(input.isDown('UP') || input.isDown('w'))
				this.pos[1]-= this.speed * dt;
			if(input.isDown('LEFT') || input.isDown('a'))
				this.pos[0]-= this.speed * dt;
			if(input.isDown('RIGHT') || input.isDown('d'))
				this.pos[0]+= this.speed * dt;
		},
		target: function(e) {
			if (e.pageX != undefined && e.pageY != undefined) {
				player.cursor[0] = e.pageX;
				player.cursor[1] = e.pageY;
			}
			else {
				player.cursor[0] = e.clientX + document.body.scrollLeft +
				document.documentElement.scrollLeft;
				player.cursor[1] = e.clientY + document.body.scrollTop +
				document.documentElement.scrollTop;
			}
			player.cursor[0] -= canvas.offsetLeft;
			player.cursor[1] -= canvas.offsetTop;
		},
		checkBonds: function() {
			// Check bonds
			if(player.pos[0] < player.sprite.size[0]/2) {
				moveWorld = 1;
			}
			else if(player.pos[0] > canvas.width - player.sprite.size[0]/2) {
				moveWorld = 2;
			}
			else if(player.pos[1] < player.sprite.size[1]/2) {
				moveWorld = 3;
			}
			else if(player.pos[1] > canvas.height - player.sprite.size[1]/2) {
				moveWorld = 4;
			}
		}
	};

	var boxes = [[100, 100], [200, 200], [300, 300]];
	var box = new Box(100, 100);

	function Box (xpos, ypos) {
		this[0] = xpos;
		this[1] = ypos;
		this.width = 40;
		this.height = 40;
	}

	function drowBoxes() {
		for(var i=0; i<boxes.length; i++) {
			ctx.fillStyle = '#cccccc';
			ctx.fillRect(boxes[i][0], boxes[i][1] ,40 ,40);
		}
	}


	resources.load([
		'images/sprites.png',
		'images/enemie.png',
		'images/walls.png'
	]);

	resources.onReady(init);

	function main() {
		var now = Date.now();
		var dt = (now - lastTime) / 1000.0;
		render();
		update(dt);
		lastTime = now;
		requestAnimFrame(main);
	};

	function init() {
		lastTime = Date.now();
		main();
	}

	function render() {
		clearCanvas();
		player.render();
		drowBox(box[0], box[1]);
	}

	function update(dt) {
		player.move(dt);
		player.checkBonds();
		moveWorldF(dt);
	};

	function clearCanvas(){
		canvas.width = canvas.width;
	}

	function moveWorldF(dt) {
		switch(moveWorld){
			case 0:
				player.pos[0] = player.pos[0];
				box[0] = box[0];
				break;
			case 1:
				player.pos[0] += player.speed * dt;
				box[0] += player.speed * dt;
				if(player.pos[0] > canvas.width/2) {
					moveWorld = 0;
				}
				break;
			case 2:
				player.pos[0] -= player.speed * dt;
				box[0] -= player.speed * dt;
				if(player.pos[0] < canvas.width/2) {
					moveWorld = 0;
				}
				break;
			case 3:
				player.pos[1] += player.speed * dt;
				box[1] += player.speed * dt;
				if(player.pos[1] > canvas.height/2) {
					moveWorld = 0;
				}
				break;
			case 4:
				player.pos[1] -= player.speed * dt;
				box[1] -= player.speed * dt;
				if(player.pos[1] < canvas.height/2) {
					moveWorld = 0;
				}
				break;
		}
	}


	function renderEntities(list) {
		for(var i=0; i<list.length; i++) {
			renderEntity(list[i]);
		}
	}

	function renderEntity(entity,angle) {
		ctx.save();
		ctx.translate(entity.pos[0], entity.pos[1]);
		ctx.rotate(angle);
		entity.sprite.render(ctx);
		ctx.restore();
	}

	function drowBox(x, y) {
		ctx.fillStyle = '#cccccc';
		ctx.fillRect(x, y ,40 ,40);
	}

	canvas.addEventListener("mousemove", player.target, false);


})();
