
const CHARACTER_WIDTH = 32;
const CHARACTER_HEIGHT = 42;
const FPS = 60;
const LOOP_INTERVAL = Math.round(1000 / FPS);
const VELOCITY = 2.5;
const CACTUS_SIZES = {
  0: 30,
  1: 45,
  2: 40,
};

const $gameScreen = $('#game-screen');
const $character = $('#character');
const $score = $('#score');

// Character's jumping velocity acceleration / deceleration depending whether the character is on the ground or in the air
let parabolaVelocity = 5.5;

// Obstacle objects will be stored here eventually for the duration of screen time
const obstaclesArr = [];

// User score
let userScore = 0;

// Class template for obstacles
class Obstacle {
  constructor (type){
    this.type = type;
    this.speed = this.setSpeed()
    this.elementMovement = true;
    this.x = 600;
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

  append() {
    // Appends new object into the HTML and updates the CSS values
    this.$elem.appendTo($gameScreen).css('bottom', this.y).css('left', this.x).css('font-size', this.size)
  };

  updateX(){
    // Moves the obstacle on the x axis
    this.x = this.x - (VELOCITY * this.speed);
    return this.x;
  };

  setEmoji(){
    // Obstacle image
    if(this.type === 'ufo'){
      return '🛸';
    }else if(this.type === 'cactus'){
      return '🌵';
    } else if(this.type === 'cloud'){
      return '☁️';
    };
  };

  initialYAxis(){
    // Gives each object the y axis
    if(this.type === 'cactus'){
      return 70;
    }else if(this.type === 'cloud'){
      return Math.floor(Math.random()*(295-205)+205);
    }else if(this.type === 'ufo'){
      return Math.floor(Math.random()*(155-85)+85);
    };
  };

  obstacleSize(){
    // Gives each object its size
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
    // Moves object on the y axis
    this.$elem.css('left', this.updateX());

    // Removes object from the HTML should it get out of screen
    if(this.x<5){
      this.$elem.remove();
    };
  };
};

// Primary values for the character - y position and movement status
let character = {
  position: {
    y: 70,
    x: 30,
    height: CHARACTER_HEIGHT,
    width: CHARACTER_WIDTH,
  },
  movement: {
    up: false,
    down: false
  }
};


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
    position: {
      y,
      x,
      width,
      height,
    },
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

  // Loops over the obstaclesArr array to modify the obstacle objects
  obstaclesArr.forEach((element, index) => {

    // This will move the object on the x axis from right to left
    element.obstacleMovement();

    // Collision logic
    if (x < element.x + element.width &&
        x + width > element.x &&
        y < element.y + element.height &&
        height + y > element.y &&
        element.type !== 'cloud'){
          console.log('oops');
      };

    // This condition verifies if object is about to leave the screen, in which case it will be removed from the obstaclesArr array and score gets incremented by 1
    if (element.x < 5) {
      element.type!=='cloud'&&userScore++;
      obstaclesArr.splice(index, 1);
    };

    // Prints the score on to the screen given the 5 digit format with leading zeros, such as 00088
    const scoreStr = userScore.toString().padStart(5, '0');
    $score.text(scoreStr);
  });
};

const randomInterval = () => {
  return Math.floor(Math.random()*(3000-1000)+1000)
};

// Function that creates new Obstacle and pushes them into the obstacleArr array
function addObstacles(){
  // Decide whether it's ufo or cactus that gets created, depending on random number generated form randomInterval function
  const randomObstacle = randomInterval()>2800 ? new Obstacle('ufo') : new Obstacle('cactus');

  obstaclesArr.push(randomObstacle);
  obstaclesArr.push(new Obstacle('cloud'));

  // setTimeout function that creates infinite loop in order to generate new number value in randomInterval function so that obstacles come out at different times
  setTimeout(addObstacles, randomInterval());
};



const init = () => {
  // Event listener for the jumping command
  $(document).on('keydown', handleKeyDown);

  // Main game engine.
  gameLoop = setInterval(updateMovements, LOOP_INTERVAL);
  addObstacles();
};

init();
