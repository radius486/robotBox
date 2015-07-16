(function(){

  // Walls
  var wallsCords = [[90,230],[110,230],[130,230],[150,230],[170,230],[190,230],[210,230],[230,230],[250,230],[270,230],[290,230],[310,230],[330,230],[350,230],[370,230],[370,210],[370,190],[370,170],[370,150],[390,150],[410,150],[430,150],[450,150],[470,150],[490,150]];
  var walls = [];

  // Boxes
  var boxCords = [[140,30],[240,30],[360,30],[470,30],[240,140],[140,140]];
  var boxes = [];

  // Energy
  var energyCords =  [[480,220],[410,280],[270,290]];
  var energy = [];

  // Bombs
  var bombCords = [[300, 100], [300, 400]];
  var bombs = [];

  // Bullets
  var bullets = [];

  // Explosions
  var explosions = [];

  // Enemies
  var enemiesCords=[[540,100],[540,200],[480,280],[340,320]];
  var enemies=[];

  createItems(wallsCords, walls, (new Sprite('images/wall.png', [0, 0], [20, 20], 16, [0, 1])), 50);
  createItems(boxCords, boxes, (new Sprite('images/box.png', [0, 0], [40, 40], 16, [0, 1])), 50);
  createItems(energyCords, energy, (new Sprite('images/energy.png', [0, 0], [20, 20], 16, [0, 1])), 10);
  createItems(bombCords, bombs, (new Sprite('images/bomb.png', [0, 0], [20, 20], 16, [0, 1])), 40);
  createEntities(enemiesCords, enemies, (new Sprite('images/enemie.png', [0, 0], [36, 56],6, [0, 1, 2, 3, 2, 1])), 30, 50);

  window.walls = walls;
  window.boxes = boxes;
  window.energy = energy;
  window.bombs = bombs;
  window.bullets = bullets;
  window.explosions = explosions;
  window.enemies = enemies;

})();
