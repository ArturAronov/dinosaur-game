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



const $character = $('#character');
const $cactus = $('#cactus');

// Character's jumping velocity acceleration / deceleration depending whether the character is on the ground of in the sky
let parabolaVelocity = 5.5;

// Iteration of obstacle ID's to keep a track on which elements to be removed once they come out of the screen
let obstacleId=0;

// Dummy obstacle
let cactus = {
  position: {
    y: 70,
    x: -100,
  },
  movement: true
};

// Class template for obstacles
class Obstacle {
  constructor (type){
    this.type = type;
  };

  static initialXAxis(){
    if(this.type === 'cactus'){
      return 70;
    }else if(this.type === 'cloud'){
      // TODO
    }else if(this.type === 'ufo'){
      // TODO
    };
  };

  static cactusSize(){
    if(this.type==='cactus'){
      return randomSize = Math.random(Math.floor()*(2-0)+0);
    }else if(this.type === 'cloud'){
      return 32;
    }else if(this.type === 'ufo'){
      return 48;
    };
  };

  static y = 70
  static speed = this.type === 'ufo' ? 1.5 : 1;
  static id = obstacleId++
  static x = -100;
  static size = this.cactusSize()
}

const cactus1 = Obstacle()

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


const setCharacterMovement = (value, keyCode) => {
  // Should user press space bar or arrow up button, the condition below will get executed.
  if(keyCode === 38 || keyCode === 32){
    character.movement.up = value;
  };
};


// Logic handlers for key up and down
const handleKeyDown = e => {
  const {keyCode} = e;
  setCharacterMovement(true, e.keyCode);
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
  }else if (!down && newY >= 205) {
    // Verify if y trajectory has reached its maximum height to stall the character temporarily midair, then set character for downwards trajectory
    newY = 205;
    setTimeout(()=>{
      character.movement.down = true;
    }, 50);
  }else if(down && up && y>70) {
    // Should the character be on the downwards trajectory, update the y trajectory and increase parabola cure falling speed.
    parabolaVelocity += 0.20;
    newY -= (parabolaVelocity + VELOCITY);
  } else if(down && up && newY <= 70){
    // Should the character be on the ground level, whilst he upwards and downwards trajectories are both active means the characters has completed round trip, hence all of the initial values get reset into original values.
    newY = 70;
    character.movement.up = false;
    character.movement.down = false;
  };


  // Dummy obsticle movement on the screen.
  if(cactus.movement){
    let cactusNewX = cactus.position.x+=3
    $cactus.css('right', cactusNewX);
  };
  $cactus.css('bottom', cactus.position.y);

  // CSS updates for character coordinates.
  character.position.y = newY;
  $character.css('bottom', newY);
};

const init = () => {
  // Event listener for the jumping command
  $(document).on('keydown', handleKeyDown);

  // Main game engine.
  gameLoop = setInterval(updateMovements, LOOP_INTERVAL);
};

init();
