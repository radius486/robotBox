(function(){

  // Entities constructor
  function Entities (pos, sprite, energy, speed, active){
    this.pos = pos;
    this.lastPosition = pos;
    this.sprite = new Sprite(sprite, [0, 0], [32, 67],6, [0, 1, 2, 3, 4]);
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

  function createEntities(coords, array, sprite, energy, speed) {

    for(var i=0;i<coords.length;i++){
      var entity = new Entities ([coords[i][0],coords[i][1]], sprite, energy, speed);
      array.push(entity);
    }
  }

  function random(from,to){
    return Math.floor(Math.random()*(to-from+1))+from;
  }

  window.createEntities = createEntities;
  window.random = random;

})();
