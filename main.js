const GAME_WIDTH = 388;
const GAME_HEIGHT = 500;
const CHARACTER_SIZE = 32;
const CHARACTER_WIDTH = 32;
const CHARACTER_HEIGHT = 42;
const FPS = 60;
const LOOP_INTERVAL = Math.round(1000 / FPS);
const VELOCITY = 2.5;
const CACTUS_SIZES = {
  0: 32,
  1: 48,
  2: 64,
};

const $gameScreen = $('#game-screen');
const $character = $('#character');
const $score = $('#score');

// Character's jumping velocity acceleration / deceleration depending whether the character is on the ground of in the sky
let parabolaVelocity = 5.5;

// Array of all obstacles
let cactusArr = [];
let ufoArr = [];
let cloudArr = [];
let obstaclesArr = [];


// User score
let userScore = 0;

// Class template for obstacles
class Obstacle {
  constructor (type){
    this.type = type;
    this.speed = this.setSpeed()
    this.elementMovement = true;
    this.x = -400;
    this.y = this.initialYAxis();
    this.size = this.obstacleSize();
    this.emoji = this.setEmoji();
    this.$elem = $(`<div class="obstacle">${this.emoji}</div>`);

    this.append()
  };

  setSpeed() {
    if (this.type === 'ufo') {
      return 1.5;
    } else if (this.type === 'cloud'){
      return 0.75;
    } else {
      return 1;
    };
  };

  append() {
    this.$elem.appendTo($gameScreen).css('bottom', this.y).css('right', this.x).css('font-size', this.size)
  }

  updateX(){
    this.x = (VELOCITY * this.speed) + this.x
    return this.x;
  };

  setEmoji(){
    if(this.type === 'ufo'){
      return '🛸';
    }else if(this.type === 'cactus'){
      return '🌵';
    } else if(this.type === 'cloud'){
      return '☁️';
    };
  };

  initialYAxis(){
    if(this.type === 'cactus'){
      return 70;
    }else if(this.type === 'cloud'){
      return Math.floor(Math.random()*(295-205)+205);
    }else if(this.type === 'ufo'){
      return Math.floor(Math.random()*(155-85)+85);
    };
  };

  obstacleSize(){
    if(this.type==='cactus'){
      const randomSize = Math.floor(Math.random()*(3-0)+0);
      return CACTUS_SIZES[randomSize];
    }else if(this.type === 'cloud'){
      return 32;
    }else if(this.type === 'ufo'){
      return 48;
    };
  };

  obstacleMovement(){
    // let obstaclePosition = {
    //   position: {
    //     yAxis: this.y,
    //     xAxis: this.x,
    //   },
    //   movement: this.elementMovement
    // };

    this.$elem.css('right', this.updateX())

    if(this.x>666){
      this.$elem.remove()
    }
  }
};

// Primary values for the character - y position and movement status
let character = {
  position: {
    y: 70,
  },
  movement: {
    up: false,
    down: false
  }
};

// Logic handlers for key up and down
// Should user press space bar or arrow up button, the condition below will get executed.
const handleKeyDown = e => {
  const {keyCode} = e;
  if(keyCode === 38 || keyCode === 32){
    character.movement.up = true;
  };
};

const handleKeyUp = () => {
  character.movement.up = false;
};

const updateMovements = () => {
  // Character's object destructured
  const {
    position: {y},
    movement: {
      up,
      down
    },
  } = character;

  // Dynamically updated y coordinates
  let newY = y;

  if (!down && up && newY < 205) {
    // Verify if y coordinates are below maximum and if current characters trajectory is upwards to update upwards y coordinates and decrease parabola cure jumping speed
    parabolaVelocity -= 0.20;
    newY += (parabolaVelocity + VELOCITY)
  } else if (!down && newY >= 205) {
    // Verify if y trajectory has reached its maximum height to stall the character temporarily midair, then set character for downwards trajectory
    newY = 205;
    setTimeout(()=>{
      character.movement.down = true;
    }, 50);
  } else if (down && up && y>70) {
    // Should the character be on the downwards trajectory, update the y trajectory and increase parabola cure falling speed.
    parabolaVelocity += 0.20;
    newY -= (parabolaVelocity + VELOCITY);
  } else if (down && up && newY <= 70) {
    // Should the character be on the ground level, whilst he upwards and downwards trajectories are both active means the characters has completed round trip, hence all of the initial values get reset into original values.
    newY = 70;
    character.movement.up = false;
    character.movement.down = false;
  };

  // CSS updates for character coordinates.
  character.position.y = newY;
  $character.css('bottom', newY);

  /*
    OBSTACLE OBJECT FUNCTION THAT MOVES THE ITEM ACROSS THE SCREEN GOES 'ERE!
  */
/*   cactusArr.forEach((element) => {
    element.obstacleMovement()
    //console.log(element.x)
    if(element.x>700){
      cloudArr.shift()
    }
  })

  ufoArr.forEach((element) => {
    element.obstacleMovement()
    //console.log(element.x)
    if(element.x>700){
      cloudArr.shift()
    } */

    obstaclesArr.forEach((element, index) => {
      element.obstacleMovement();
      if (element.x > 666) {
        userScore++;
        obstaclesArr.splice(index, 1);
      };

      const scoreStr = userScore.toString().padStart(5, '0');
      $score.children().text(scoreStr);
    });



  /*
    AFTER ALL MOVEMENTS, CHECK FOR COLLISION
  */
};

const randomInterval = () => {
  return Math.floor(Math.random()*(3000-1000)+1000)
};

function addCactus(){
  cactusArr.push(new Obstacle('cactus'));
  setTimeout(addCactus, randomInterval())
};

function addUfo(){
  ufoArr.push(new Obstacle('ufo'));
  setTimeout(addUfo, randomInterval())
};

function addObstacles(){

  let randomObstacle
  if(randomInterval()<2000){
    randomObstacle = new Obstacle('ufo');
  } else {
    randomObstacle = new Obstacle('cactus');
  };

  obstaclesArr.push(randomObstacle);
  obstaclesArr.push(new Obstacle('cloud'));
  setTimeout(addObstacles, randomInterval())
};



const init = () => {
  // Event listener for the jumping command
  $(document).on('keydown', handleKeyDown);

  // Main game engine.
  gameLoop = setInterval(updateMovements, LOOP_INTERVAL);

  addObstacles()

/*   // TODO: tbr
  setInterval(function(){
    obstacles.push(new Obstacle('cactus'));
  }, randomInterval());

  setInterval(function(){
    obstacles.push(new Obstacle('ufo'));
  }, randomInterval());
 */

};

init();
