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
	var worldSpeed = 300;

	var lastTime;
	var canvas = document.getElementById("b");
	var ctx = canvas.getContext("2d");

	var player = {
		pos:[30, 30],
		lastPosition: [],
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
			this.lastPosition = [this.pos[0] ,this.pos[1]];
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

	var boxCords = [[100, 100], [200, 200], [300, 300], [200, 100], [400, 100], [300, 200], [100, 400], [600, 300], [400, 400]];

	var boxes = [];

	/*function createBoxes() {
		for(var i=0; i<boxCords.length; i++) {
			boxes.push({
				pos: [boxCords[i][0], boxCords[i][1]],
				sprite: new Sprite('images/box.png', [0, 0], [40, 40], 16, [0, 1]),
				energy: 3
			});
		}
	}*/



	//createBoxes();
	createItems(boxCords, boxes, (new Sprite('images/box.png', [0, 0], [40, 40], 16, [0, 1])), 3);
	console.log(boxes);

	/*var box = new Box(100, 100);

	function Box (xpos, ypos) {
		this[0] = xpos;
		this[1] = ypos;
		this.width = 40;
		this.height = 40;
	}*/


	resources.load([
		'images/sprites.png',
		'images/enemie.png',
		'images/box.png'
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
		renderItems(boxes);
	}

	function update(dt) {
		player.move(dt);
		player.checkBonds();
		moveWorldF(dt);
		checkCollisions();
	};

	function clearCanvas(){
		canvas.width = canvas.width;
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

	function checkCollisions() {
		// Boxes with player
		for(var i=0;i<boxes.length;i++){
			if(boxCollides(player.pos, player.sprite.size, boxes[i].pos, boxes[i].sprite.size)) {
				player.pos = player.lastPosition;
			}
		}
	}

	function moveWorldF(dt) {
		switch(moveWorld){
			case 0:
				player.pos[0] = player.pos[0];
				player.pos[1] = player.pos[1];
				break;
			case 1:
				player.pos[0] += worldSpeed * dt;
				changePosition(boxes, worldSpeed* dt, 1);
				if(player.pos[0] > canvas.width/2) {
					moveWorld = 0;
				}
				break;
			case 2:
				player.pos[0] -= worldSpeed * dt;
				changePosition(boxes, worldSpeed* dt, 2);
				if(player.pos[0] < canvas.width/2) {
					moveWorld = 0;
				}
				break;
			case 3:
				player.pos[1] += worldSpeed* dt;
				changePosition(boxes, worldSpeed* dt, 3);
				if(player.pos[1] > canvas.height/2) {
					moveWorld = 0;
				}
				break;
			case 4:
				player.pos[1] -= worldSpeed * dt;
				changePosition(boxes, worldSpeed* dt, 4);
				if(player.pos[1] < canvas.height/2) {
					moveWorld = 0;
				}
				break;
		}
	}

	function changePosition(list, delta, direction) {
		for(var i=0; i<list.length; i++) {
			switch(direction){
				case 1:
					list[i].pos[0] += delta;
					break;
				case 2:
					list[i].pos[0] -= delta;
					break;
				case 3:
					list[i].pos[1] += delta;
					break;
				case 4:
					list[i].pos[1] -= delta;
					break;
			}
		}
	}


	/*function renderEntities(list) {
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
	}*/

	/*function createBoxes() {
		for(var i=0; i<boxCords.length; i++) {
			var item = new Items([boxCords[i][0], boxCords[i][1]], (new Sprite('images/box.png', [0, 0], [40, 40], 16, [0, 1])), 3);
			boxes.push(
				item
			);
		}
	}*/

	function createItems(coords, array, sprite, energy) {
		for(var i=0; i<coords.length; i++) {
			var item = new Items([coords[i][0], coords[i][1]], sprite, energy);
			array.push(item);
		}
	}

	// Object constructor
	function Items(pos, sprite, energy) {
		this.pos = pos;
		this.sprite = sprite;
		this.energy = energy;
	}

	function renderItems(items) {
		for(var i=0; i<items.length; i++) {
			ctx.save();
			ctx.translate(items[i].pos[0], items[i].pos[1]);
			items[i].sprite.render(ctx);
			ctx.restore();
		}
	}

	canvas.addEventListener("mousemove", player.target, false);


})();
