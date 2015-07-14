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
	var worldSpeed = 300;

	var lastTime;
	var canvas = document.getElementById("b");
	var ctx = canvas.getContext("2d");

	var player = {
		pos:[30, 30],
		lastPosition: [],
		cursor: [200, 200],
		speed: 200,
		energy: 50,
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
			if(moveWorld == 0 && this.energy > 0) {
				this.lastPosition = [this.pos[0] ,this.pos[1]];
				if(input.isDown('DOWN') || input.isDown('s'))
					this.pos[1]+= this.speed * dt;
				if(input.isDown('UP') || input.isDown('w'))
					this.pos[1]-= this.speed * dt;
				if(input.isDown('LEFT') || input.isDown('a'))
					this.pos[0]-= this.speed * dt;
				if(input.isDown('RIGHT') || input.isDown('d'))
					this.pos[0]+= this.speed * dt;
			}
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
		leftClick: function(e) {
		if (e.pageX != undefined && e.pageY != undefined) {
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
		//console.log('click '+player.target[0]+','+player.target[1]);
		shoot();

		//console.log(enemies);
		//console.log(bullets);

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

	// Boxes
	var boxCords = [[100, 100], [200, 200], [300, 300], [200, 100], [400, 100], [300, 200], [100, 400], [600, 300], [400, 400]];
	var boxes = [];

	// Energy
	var energyCords =  [[200, 300],[400, 600]];
	var energy = [];

	// Bombs
	var bombCords = [[300, 100], [300, 400]];
	var bombs = [];

	// Bullets
	var bullets = [];

	// Explosions
	var explosions = [];

	// Enemies
	var enemiesCords=[[350,100],[400,200],[450,100],[100, 200], [200, 300], [300, 400], [200, 400], [400, 300], [300, 500], [100, 500], [600, 400], [400, 500]];
	var enemies=[];

	createItems(boxCords, boxes, (new Sprite('images/box.png', [0, 0], [40, 40], 16, [0, 1])), 50);
	createItems(energyCords, energy, (new Sprite('images/energy.png', [0, 0], [20, 20], 16, [0, 1])), 10);
	createItems(bombCords, bombs, (new Sprite('images/bomb.png', [0, 0], [20, 20], 16, [0, 1])), 40);
	createEntities(enemiesCords, enemies, (new Sprite('images/enemie.png', [0, 0], [36, 56],6, [0, 1, 2, 3, 2, 1])), 100, 100);
	console.log(enemies);


	resources.load([
		'images/sprites.png',
		'images/enemie.png',
		'images/box.png',
		'images/energy.png',
		'images/bomb.png'
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
		renderItems([[boxes], [energy], [bombs], [bullets, 1], [explosions]]);
		renderEntities(enemies);
		player.render();
	}

	function update(dt) {
		player.move(dt);
		player.checkBonds();
		moveWorldF(dt);
		checkCollisions();
		updateBullets(dt);
		updateExplosions(dt);
		updateEnemies(dt);
	};

	function clearCanvas(){
		canvas.width = canvas.width;
	}

	function random(from,to){
    return Math.floor(Math.random()*(to-from+1))+from;
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
		// Player with boxes
		for(var i=0;i<boxes.length;i++){
			if(boxCollides(player.pos, player.sprite.size, boxes[i].pos, boxes[i].sprite.size)) {
				player.pos = player.lastPosition;
			}
		}

		// Player with energy
		for(var i=0;i<energy.length;i++){
			if(boxCollides(player.pos, player.sprite.size, energy[i].pos, energy[i].sprite.size)) {
				player.energy+=energy[i].energy;
				energy.splice(i, 1);
				console.log(player.energy);
			}
		}

		// Player with bombs
		for(var i=0;i<bombs.length;i++){
			if(boxCollides(player.pos, player.sprite.size, bombs[i].pos, bombs[i].sprite.size)) {
				explosion(bombs[i].pos);
				player.energy-=bombs[i].energy;
				bombs.splice(i, 1);
				console.log(player.energy);
			}
		}

		// Boxes with bullets
		for(var i=0;i<boxes.length;i++){

			for(var j=0; j<bullets.length; j++) {

				if(boxCollides(boxes[i].pos, boxes[i].sprite.size, bullets[j].pos, bullets[j].sprite.size)){

					explosion(bullets[j].pos);

					boxes[i].energy-=bullets[j].energy;
					console.log(boxes[i].energy);
					if(boxes[i].energy<=0){
						explosion(boxes[i].pos);
						boxes.splice(i, 1);
						i--;
					}
					bullets.splice(j, 1);
					break;
				}
			}
		}

		//Enemies
		for(var i=0; i<enemies.length; i++) {

				//canvas
				/*if(enemies[i].pos[0] < 0) {
					enemies[i].rand=4;
				}
				else if(enemies[i].pos[0] > canvas.width - enemies[i].sprite.size[0]) {
					enemies[i].rand=0;
				}

				if(enemies[i].pos[1] < 0) {
					enemies[i].rand=6;
				}
				else if(enemies[i].pos[1] > canvas.height - enemies[i].sprite.size[1]) {
					enemies[i].rand=2;
				}*/
				//-------------------------------
			var pos = enemies[i].pos;
			var size = enemies[i].sprite.size;
			//enemy with enemy
			for(var j=0;j<enemies.length;j++){
				if(enemies[i].pos!=enemies[j].pos){
					if(boxCollides(enemies[i].pos, enemies[i].sprite.size, enemies[j].pos, enemies[j].sprite.size)){
						enemies[i].pos = enemies[i].lastPosition;
						enemies[j].pos = enemies[j].lastPosition;
						enemies[i].course = random(0,7);
						enemies[j].course = random(0,7);
						enemies[i].angle = enemies[i].chooseAngle();
						enemies[j].angle = enemies[i].chooseAngle();

					}
				}
			}
			//enemies with bullets
			/*for(var j=0; j<bullets.length; j++) {
				var pos2 = bullets[j].pos;
				var size2 = bullets[j].sprite.size;

				if(boxCollides(pos, size, pos2, size2)) {

					explosion(pos);

					enemies[i].hits+=1;
					if(enemies[i].hits==3){
						enemies.splice(i, 1);
						i--;
					}
					bullets.splice(j, 1);
					break;
				}
			}*/

			//enemies with boxes
			for(var j=0; j < boxes.length; j++){
				if(boxCollides(enemies[i].pos, enemies[i].sprite.size, boxes[j].pos, boxes[j].sprite.size)){
						enemies[i].pos = enemies[i].lastPosition;
						enemies[i].course = random(0,7);
						enemies[i].angle = enemies[i].chooseAngle();
				}
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
				changePosition(energy, worldSpeed* dt, 1);
				changePosition(bombs, worldSpeed* dt, 1);
				changePosition(enemies, worldSpeed* dt, 1);
				if(player.pos[0] > canvas.width/2) {
					moveWorld = 0;
				}
				break;
			case 2:
				player.pos[0] -= worldSpeed * dt;
				changePosition(boxes, worldSpeed* dt, 2);
				changePosition(energy, worldSpeed* dt, 2);
				changePosition(bombs, worldSpeed* dt, 2);
				changePosition(enemies, worldSpeed* dt, 2);
				if(player.pos[0] < canvas.width/2) {
					moveWorld = 0;
				}
				break;
			case 3:
				player.pos[1] += worldSpeed* dt;
				changePosition(boxes, worldSpeed* dt, 3);
				changePosition(energy, worldSpeed* dt, 3);
				changePosition(bombs, worldSpeed* dt, 3);
				changePosition(enemies, worldSpeed* dt, 3);
				if(player.pos[1] > canvas.height/2) {
					moveWorld = 0;
				}
				break;
			case 4:
				player.pos[1] -= worldSpeed * dt;
				changePosition(boxes, worldSpeed* dt, 4);
				changePosition(energy, worldSpeed* dt, 4);
				changePosition(bombs, worldSpeed* dt, 4);
				changePosition(enemies, worldSpeed* dt, 4);
				if(player.pos[1] < canvas.height/2) {
					moveWorld = 0;
				}
				break;
		}
	}

	//Change items position when world is moving.
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

	// Items implementation
	function createItems(coords, array, sprite, energy) {
		for(var i=0; i<coords.length; i++) {
			var item = new Items([coords[i][0], coords[i][1]], sprite, energy);
			array.push(item);
		}
	}

	// Object constructor
	function Items(pos, sprite, energy, speed, angle) {
		this.pos = pos;
		this.sprite = sprite;
		this.energy = energy;
		this.speed = speed;
		this.angle = angle;
	}

	function renderItems(items) {
		for(var i=0; i<items.length; i++) {
			for(var j=0; j<items[i][0].length; j++) {
				ctx.save();
				ctx.translate(items[i][0][j].pos[0], items[i][0][j].pos[1]);
				// Rotate angle of item
				if(items[i][1] == 1) {
					ctx.rotate(items[i][0][j].angle);
				}
				items[i][0][j].sprite.render(ctx);
				ctx.restore();
			}
		}
	}

	function shoot() {
		var sprite = new Sprite('images/sprites.png', [0, 39], [18, 8]);
		var angle = Math.atan2(player.target[1] - player.pos[1], player.target[0] - player.pos[0]);
		bullets.push(new Items([player.pos[0],player.pos[1]], sprite, 10, 1000, angle));
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

	function updateBullets(dt){
		for(var i=0; i<bullets.length; i++) {

			bullets[i].pos[0] += bullets[i].speed * dt*Math.cos(bullets[i].angle);
			bullets[i].pos[1] += bullets[i].speed * dt*Math.sin(bullets[i].angle);

			if(bullets[i].pos[1] < 0 || bullets[i].pos[1] > canvas.height ||
			   bullets[i].pos[0] > canvas.width) {
				bullets.splice(i, 1);
				i--;
			}
		}
	}

	function updateExplosions(dt){
		for(var i=0; i<explosions.length; i++) {
			explosions[i].sprite.update(dt);

			// Remove if animation is done
			if(explosions[i].sprite.done) {
				explosions.splice(i, 1);
				i--;
			}
		}
	}

	function createEntities(coords, array, sprite, energy, speed) {

		// Entities constructor
		function Entities (pos, sprite, energy, speed, active){
			this.pos = pos;
			this.lastPosition = pos;
			this.sprite = sprite;
			this.energy = energy;
			this.speed = speed;
			this.active = false;
			this.course = random(0,7);
			this.cicle = 0;
			this.endCicle = random(50,100);
			this.angle = this.chooseAngle();
		}

		Entities.prototype.chooseAngle = function () {
			switch(this.course){
				case 0:
					return Math.PI*3/2;
					break;
				case 1:
					return Math.PI*11/6;
					break;
				case 2:
					return Math.PI*2;
					break;
				case 3:
					return Math.PI/4;
					break;
				case 4:
					return Math.PI/2;
					break;
				case 5:
					return Math.PI*3/4;
					break;
				case 6:
					return Math.PI;
					break;
				case 7:
					return Math.PI*4/3;
					break;
			}
		}

		for(var i=0;i<coords.length;i++){
			var entity = new Entities ([coords[i][0],coords[i][1]], sprite, energy, speed);
			array.push(entity);
		}

	}

	function renderEntities(entities) {
		for(var i=0; i<entities.length; i++) {
			ctx.save();
			ctx.translate(entities[i].pos[0], entities[i].pos[1]);
			ctx.rotate(entities[i].angle);
			entities[i].sprite.render(ctx);
			ctx.restore();
		}
	}

	function updateEnemies(dt){
			for(var i=0;i<enemies.length;i++){

				enemies[i].lastPosition = [enemies[i].pos[0],enemies[i].pos[1]];

				enemies[i].cicle += 1;
				if(enemies[i].cicle == enemies[i].endCicle){
					enemies[i].course = random(0,7);
					enemies[i].angle = enemies[i].chooseAngle();
					enemies[i].cicle = 0;
				}

				switch(enemies[i].course) {
					case 0:
						enemies[i].pos[0]-=enemies[i].speed*dt;
						break;
					case 1:
						enemies[i].pos[0]-=enemies[i].speed*dt;
						enemies[i].pos[1]-=enemies[i].speed*dt;
						break;
					case 2:
						enemies[i].pos[1]-=enemies[i].speed*dt;
						break;
					case 3:
						enemies[i].pos[0]+=enemies[i].speed*dt;
						enemies[i].pos[1]-=enemies[i].speed*dt;
						break;
					case 4:
						enemies[i].pos[0]+=enemies[i].speed*dt;
						break;
					case 5:
						enemies[i].pos[0]+=enemies[i].speed*dt;
						enemies[i].pos[1]+=enemies[i].speed*dt;
						break;
					case 6:
						enemies[i].pos[1]+=enemies[i].speed*dt;
						break;
					case 7:
						enemies[i].pos[0]-=enemies[i].speed*dt;
						enemies[i].pos[1]+=enemies[i].speed*dt;
						break;
				}

			}

	}

	canvas.addEventListener("mousemove", player.target, false);
	canvas.addEventListener("mousedown", player.leftClick, false);


})();
