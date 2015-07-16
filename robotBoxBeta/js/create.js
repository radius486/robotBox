(function(){

  // Boxes
  var boxCords = [[100,0],[100,40],[100,80],[100,120],[100,160],[100,200],[140,200],[180,200],[220,200],[260,200],[300,200],[340,200],[460,200],[500,200],[540,200],[580,200],[580,160],[580,120],[580,80],[580,40],[580,0],[140,0],[180,0],[220,0],[260,0],[300,0],[340,0],[380,0],[420,0],[460,0],[500,0],[540,0]];
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
  var enemiesCords=[[550,60],[550,150],[490,100],[400,70],[420,140],[340,110],[280,150]];
  var enemies=[];

  createItems(boxCords, boxes, (new Sprite('images/box.png', [0, 0], [40, 40], 16, [0, 1])), 50);
  createItems(energyCords, energy, (new Sprite('images/energy.png', [0, 0], [20, 20], 16, [0, 1])), 10);
  createItems(bombCords, bombs, (new Sprite('images/bomb.png', [0, 0], [20, 20], 16, [0, 1])), 40);
  createEntities(enemiesCords, enemies, (new Sprite('images/enemie.png', [0, 0], [36, 56],6, [0, 1, 2, 3, 2, 1])), 30, 50);

  window.boxes = boxes;
  window.energy = energy;
  window.bombs = bombs;
  window.bullets = bullets;
  window.explosions = explosions;
  window.enemies = enemies;

})();
