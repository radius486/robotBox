(function(){

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
  createEntities(enemiesCords, enemies, (new Sprite('images/enemie.png', [0, 0], [36, 56],6, [0, 1, 2, 3, 2, 1])), 30, 50);

  window.boxes = boxes;
  window.energy = energy;
  window.bombs = bombs;
  window.bullets = bullets;
  window.explosions = explosions;
  window.enemies = enemies;

})();
