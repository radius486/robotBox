(function(){

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

  window.Items = Items;
  window.createItems = createItems;

})();
