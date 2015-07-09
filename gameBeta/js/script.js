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

	var lastTime;



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

	resources.load([
		'images/sprites.png',
		'images/enemie.png',
		'images/walls.png'
	]);

	resources.onReady(init);

	var canvas = document.getElementById("b");
	 var ctx = canvas.getContext("2d");


	function izometkic(){
		ctx.setTransform(0.866, -0.5, 0.866, 0.5, 0, 200);
	}
	//ctx.setTransform(0.866, -0.5, 0.866, 0.5, 0, 200);





	var xx;
	var yy;

	var targetX,targetY;

	var playerSpeed=200;

	var bulletSpeed=2000;

	var enemiesSpeed = 10;

	var triggerDistance=200;

	var lastPosition=[];


	var player={
		pos:[30,30],
		sprite: new Sprite('images/sprites.png', [0, 0], [39, 39], 16, [0, 1])
	};

	var bullets=[];

	var enemies=[];

	var explosions=[];

	var walls=[];

	var enemiesPosition=[[350,100],[400,100],[450,100]];

	var wallsPosition1=[[100,10],[160,10],[420,60]];
	var wallsPosition2=[[100,50],[160,50]];

	for(var i=0;i<wallsPosition1.length;i++){
		walls.push({
			pos:[wallsPosition1[i][0],wallsPosition1[i][1]],
			sprite: new Sprite('images/walls.png', [0, 0], [60, 20],6, [0, 1, 2, 3, 2, 1]),
			hits:0
		});
	}
	for(var i=0;i<wallsPosition2.length;i++){
		walls.push({
			pos:[wallsPosition2[i][0],wallsPosition2[i][1]],
			sprite: new Sprite('images/walls.png', [0, 20], [20, 60],6, [0, 1, 2, 3, 2, 1]),
			hits:0
		});
	}


	for(var i=0;i<enemiesPosition.length;i++){
		enemies.push({
			pos:[enemiesPosition[i][0],enemiesPosition[i][1]],
			sprite: new Sprite('images/enemie.png', [0, 0], [36, 56],6, [0, 1, 2, 3, 2, 1]),
			act:false,
			rand:random(0,7),
			cicle:0,
			hits:0,
			last:[enemiesPosition[i][0],enemiesPosition[i][1]]
		});
	}



	/*function drawPlayer(){
		ctx.save();
		ctx.translate(player.pos[0], player.pos[1]);
		ctx.rotate(Math.atan2(yy - player.pos[1], xx - player.pos[0]));
		player.sprite.render(ctx);
		ctx.restore();
	}*/

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

	function drawCursor(){
		ctx.fillStyle = '#000000';
		ctx.fillRect(xx-2,yy-2,4,4);
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

	function drawEnemies(){
		for(var i=0;i<enemies.length;i++){
			ctx.save();
			ctx.translate(enemies[i].pos[0], enemies[i].pos[1]);
			if(enemies[i].act==true){
				ctx.rotate(Math.atan2(player.pos[1]-enemies[i].pos[1]  , player.pos[0]-enemies[i].pos[0]  ) + Math.PI/2);
			}else if(enemies[i].rand==0){
				ctx.rotate(Math.PI*3/2);
			}else if(enemies[i].rand==4){
				ctx.rotate(Math.PI/2);
			}else if(enemies[i].rand==2){
				ctx.rotate(Math.PI*2);
			}else if(enemies[i].rand==6){
				ctx.rotate(Math.PI);
			}else if(enemies[i].rand==3){
				ctx.rotate(Math.PI/4);
			}else if(enemies[i].rand==5){
				ctx.rotate(Math.PI*3/4);
			}else if(enemies[i].rand==7){
				ctx.rotate(Math.PI*4/3);
			}else if(enemies[i].rand==1){
				ctx.rotate(Math.PI*11/6);
			}
			enemies[i].sprite.render(ctx);
			ctx.restore();
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

	function render() {
		clearCanvas();
		//izometkic();
		drawBullets();
		renderEntity(player,(Math.atan2(yy - player.pos[1], xx - player.pos[0])));
		drawEnemies();
		renderEntities(walls);
		renderEntities(explosions);
		drawCursor();
	}

	function update(dt) {
		handleinput(dt);
		checkCollisions();
		//updateEnemies(dt);
		trigger(dt);
		updateBullets(dt);
		updateExplosions(dt);
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
		checkPlayerBounds();

		for(var i=0; i<enemies.length; i++) {

				//canvas
				if(enemies[i].pos[0] < 0) {
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
				}
				//-------------------------------
			var pos = enemies[i].pos;
			var size = enemies[i].sprite.size;
			//enemy with enemy
			for(var j=0;j<enemies.length;j++){
				if(enemies[i].pos!=enemies[j].pos){
					var pos3 = enemies[j].pos;
					var size3 = enemies[j].sprite.size;
					if(boxCollides(pos, size, pos3, size3)){
						enemies[i].pos=enemies[i].last;
						enemies[j].pos=enemies[j].last;
						console.log('colapse');
						/*if(enemies[i].rand==0){
							enemies[i].rand=4;
							enemies[k].rand=0;
						}else if(enemies[i].rand==1){
							enemies[i].rand==5;
							enemies[k].rand==1
						}else if(enemies[i].rand==2){
							enemies[i].rand==6;
							enemies[k].rand==2;
						}else if(enemies[i].rand==3){
							enemies[i].rand==7;
							enemies[k].rand==3;
						}else if(enemies[i].rand==4){
							enemies[i].rand==0;
							enemies[k].rand==4;
						}else if(enemies[i].rand==5){
							enemies[i].rand==1;
							enemies[k].rand==5;
						}else if(enemies[i].rand==6){
							enemies[i].rand==2;
							enemies[k].rand==6;
						}else if(enemies[i].rand==7){
							enemies[i].rand==3;
							enemies[k].rand==7;
						}*/
					}
				}
			}
			//enemies with bullets
			for(var j=0; j<bullets.length; j++) {
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
			}

			//enemies with walls
			for(var j=0;j<walls.length;j++){
					var pos4 = walls[j].pos;
					var size4 = walls[j].sprite.size;
				if(boxCollides(pos, size, pos4, size4)){
						enemies[i].pos=enemies[i].last;
				}
			}

		}
		//walls with bullets
		for(var i=0;i<walls.length;i++){
					var pos5 = walls[i].pos;
					var size5 = walls[i].sprite.size;

				for(var j=0; j<bullets.length; j++) {
					var pos6 = bullets[j].pos;
					var size6 = bullets[j].sprite.size;

					if(boxCollides(pos5, size5, pos6, size6)){

						explosion(pos5);

						walls[i].hits+=1;
						if(walls[i].hits==10){
							walls.splice(i, 1);
							i--;
						}
						bullets.splice(j, 1);
						break;
					}

				}
			}
	}

	function checkPlayerBounds() {

		if(player.pos[0] < player.sprite.size[0]/2) {
			player.pos[0] = player.sprite.size[0]/2;
		}
		else if(player.pos[0] > canvas.width - player.sprite.size[0]/2) {
			player.pos[0] = canvas.width - player.sprite.size[0]/2;
		}

		if(player.pos[1] < player.sprite.size[1]/2) {
			player.pos[1] = player.sprite.size[1]/2;
		}
		else if(player.pos[1] > canvas.height - player.sprite.size[1]/2) {
			player.pos[1] = canvas.height - player.sprite.size[1]/2;
		}

		for(var i=0;i<walls.length;i++){
			if(boxCollides(player.pos, player.sprite.size, walls[i].pos, walls[i].sprite.size)) {
				player.pos=lastPosition;
			}
		}
	}

	function random(from,to){
        return Math.floor(Math.random()*(to-from+1))+from;
	}

	function updateEnemies(dt){
			for(var i=0;i<enemies.length;i++){

				enemies[i].last=[enemies[i].pos[0],enemies[i].pos[1]];

				enemies[i].cicle+=1;
				if(enemies[i].cicle==100){
					enemies[i].rand = random(0,7);
					enemies[i].cicle=0;
				}
				if(enemies[i].act==false){
					if(enemies[i].rand==0){
						enemies[i].pos[0]-=enemiesSpeed*dt/2;
					}else if(enemies[i].rand==4){
						enemies[i].pos[0]+=enemiesSpeed*dt/2;
					}else if(enemies[i].rand==2){
						enemies[i].pos[1]-=enemiesSpeed*dt/2;
					}else if(enemies[i].rand==6){
						enemies[i].pos[1]+=enemiesSpeed*dt/2;
					}else if(enemies[i].rand==3){
						enemies[i].pos[0]+=enemiesSpeed*dt/2;
						enemies[i].pos[1]-=enemiesSpeed*dt/2;
					}else if(enemies[i].rand==5){
						enemies[i].pos[0]+=enemiesSpeed*dt/2;
						enemies[i].pos[1]+=enemiesSpeed*dt/2;
					}else if(enemies[i].rand==7){
						enemies[i].pos[0]-=enemiesSpeed*dt/2;
						enemies[i].pos[1]+=enemiesSpeed*dt/2;
					}else if(enemies[i].rand==1){
						enemies[i].pos[0]-=enemiesSpeed*dt/2;
						enemies[i].pos[1]-=enemiesSpeed*dt/2;
					}
				}

			}

	}

	function trigger(dt){
		for(var i=0; i<enemies.length; i++){

		var pX=player.pos[0];
		var pY=player.pos[1];
		var enX=enemies[i].pos[0];
		var enY=enemies[i].pos[1];

			if((pX>enX-triggerDistance&&pX<enX+triggerDistance)&&(pY>enY-triggerDistance&&pY<enY+triggerDistance)){

				enemies[i].act=true;

				if(pX>enX){
					enemies[i].pos[0] += enemiesSpeed * dt;
				}else if(pX<enX){
					enemies[i].pos[0] -= enemiesSpeed * dt;
				}
				if(pY>enY){
				enemies[i].pos[1] += enemiesSpeed * dt;
				}else if(pY<enY){
				enemies[i].pos[1] -= enemiesSpeed * dt;
				}

			}else{
				enemies[i].act=false;
			}
		}
	}

	function updateBullets(dt){
		for(var i=0; i<bullets.length; i++) {

			bullets[i].pos[0] += bulletSpeed * dt*Math.cos(bullets[i].angle);
			bullets[i].pos[1] += bulletSpeed * dt*Math.sin(bullets[i].angle);

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
	}

	function targetPosition(e) {
		if (e.pageX != undefined && e.pageY != undefined) {
			xx = e.pageX;
			yy = e.pageY;
		}
		else {
			xx = e.clientX + document.body.scrollLeft +
			document.documentElement.scrollLeft;
			yy = e.clientY + document.body.scrollTop +
			document.documentElement.scrollTop;
		}
		xx -= canvas.offsetLeft;
		yy -= canvas.offsetTop;
		//console.log(x+','+y);

	}
	function targetClick(e) {
		if (e.pageX != undefined && e.pageY != undefined) {
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
			angle:Math.atan2(targetY - player.pos[1], targetX - player.pos[0])
		});

		//console.log(enemies);
		//console.log(bullets);

	}

	canvas.addEventListener("mousedown", targetClick, false);
	canvas.addEventListener("mousemove", targetPosition, false);

})();
