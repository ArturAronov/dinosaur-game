import {VELOCITY, OBSTACLE_X, CACTUS_Y, SIZE_S, SIZE_M, $GAME_SCREEN, CACTUS_SIZES} from './global_variables.js';

// Class template for obstacles
class Obstacle {
  constructor (type){
    this.type = type;
    this.speed = this.setSpeed();
    this.elementMovement = true;
    this.x = OBSTACLE_X;
    this.y = this.initialYAxis();
    this.size = this.obstacleSize();
    this.emoji = this.setEmoji();
    this.$elem = $(`<div class="obstacle ${this.type==='ufo'&&'ufo'}">${this.emoji}</div>`);

    // Appends the div into HTML
    this.append();
    this.width = Math.floor(this.$elem.width());
    this.height = Math.floor(this.$elem.height());
  };

  setSpeed() {
    // Gives each obstacle type a moving speed
    if (this.type === 'ufo') {
      return 1.5;
    } else if (this.type === 'cloud'){
      return 0.5;
    } else {
      return 1;
    };
  };


  initialYAxis(){
    // Gives each object the y axis
    if(this.type === 'cactus'){
      return CACTUS_Y;
    }else if(this.type === 'cloud'){
      return Math.floor(Math.random()*(258-158)+158);
    }else if(this.type === 'ufo'){
      return Math.floor(Math.random()*(155-85)+85);
    };
  };

  append() {
    // Appends new object into the HTML and updates the CSS values
    this.$elem.appendTo($GAME_SCREEN).css('bottom', this.y).css('left', this.x).css('font-size', this.size);
  };

  updateX(){
    // Moves the obstacle on the x axis
    this.x = this.x - (VELOCITY * this.speed);
    return this.x;
  };

  obstacleSize(){
    // Gives each object its size
    if(this.type==='cactus'){
      const randomSize = Math.floor(Math.random()*(3-0)+0);
      return CACTUS_SIZES[randomSize];
    }else if(this.type === 'cloud'){
      return SIZE_S;
    }else if(this.type === 'ufo'){
      return SIZE_M;
    };
  };

  setEmoji(){
    // Obstacle image
    if(this.type === 'ufo'){
      return '🛸';
    }else if(this.type === 'cactus'){
      return `<img style='height: ${this.size}px' src='./assets/cactus.png'/>`;
    } else if(this.type === 'cloud'){
      return '☁️';
    };
  };

  obstacleMovement(){
    // Moves object on the y axis
    this.$elem.css('left', this.updateX());

    // Removes object from the HTML should it get out of screen
    if(this.x<5){
      this.$elem.remove();
    };
  };
};

export {Obstacle}
