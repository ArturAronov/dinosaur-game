const CHARACTER_WIDTH = 29;
const CHARACTER_HEIGHT = 48;
const FPS = 60;
const DINO_INITIAL_Y = 75;
const DINO_INITIAL_X = 30;
const DINO_MAX_Y = 205;
const LOOP_INTERVAL = Math.round(1000 / FPS);
const VELOCITY = 2.5;
const RANDOM_INTERVAL_MIN = 1000;
const RANDOM_INTERVAL_MAX = 3000;
const MIN_SCREEN = 650;
const OBSTACLE_X = 600;
const CACTUS_Y = 68;
const SIZE_S = 32;
const SIZE_M = 42;
const SIZE_L = 52;
const KEYCODE_UP = 38;
const KEYCODE_SPACE = 32;
const KEYCODE_RETURN = 13;
const DINO_STAND ="./assets/dino-stand.png";
const DINO_RUN_1 = "./assets/dino-run1.png";
const DINO_RUN_2 = "./assets/dino-run2.png";
const $GAME_SCREEN = $('#game-screen');
const $CHARACTER = $('#dino');
const $USER_SCORE = $('#user-score');
const $HIGH_SCORE = $('#high-score');
const $GAME_OVER = $('#game-over');
const $DINO_SRC = $('#dino').attr('src');
const $ERROR = $('#error');
const CACTUS_SIZES = {
  0: SIZE_S,
  1: SIZE_M,
  2: SIZE_L,
};

let gameLoop;
let dinoRunLoop;
let objectCreationLoop;
let continueGame = true;
let currentDinoSrc = $DINO_SRC;


// Character's jumping velocity acceleration / deceleration depending whether the character is on the ground or in the air
let parabolaVelocity = 5.5;

// Obstacle objects will be stored here eventually for the duration of screen time
let obstaclesArr = [];

// User score
let highScore = 0;
let userScore = 0;

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

// Primary values for the character - y position and movement status
let character = {
  position: {
    y: DINO_INITIAL_Y,
    x: DINO_INITIAL_X,
    height: CHARACTER_HEIGHT,
    width: CHARACTER_WIDTH,
  },
  movement: {
    up: false,
    down: false
  }
};

function reset(index) {
  // Reset all of the game's initial values
  continueGame = false;       // Sets continue game to false
  $(document).off('keydown')  // Removes the keydown event listener
  clearInterval(dinoRunLoop); // Removes the dinosaur running loop
  clearInterval(gameLoop);    // Stops the game loop
  clearTimeout(objectCreationLoop);
  obstaclesArr.splice(index, obstaclesArr.length-1);  // Clears obstacle arr
  $('.obstacle').css('display', 'none');  // Hides obstacles display
  $GAME_OVER.css('display', 'flex');
  $GAME_SCREEN.css('animation', 'none');
  $(document).on('keydown', handleRestart);

  $CHARACTER.css('bottom', DINO_INITIAL_Y);
  $CHARACTER.css('transform', 'rotate(45deg)');
};

function restart() {
  // Clear off any pre-existing values in case game is run more than once
  const highScoreStr = highScore.toString().padStart(5, '0');
  $HIGH_SCORE.text('HI'+highScoreStr);
  $GAME_OVER.css('display', 'none');
  $CHARACTER.css('transform', 'rotate(0deg)');
  $GAME_SCREEN.css('animation', 'animatedBackground 8000ms linear infinite');
  userScore = 0;
  obstaclesArr = [];
  continueGame = true;
  parabolaVelocity = 5.5;
  gameLoop = null;
  objectCreationLoop = null;
};

const handleError = () => {
  // Since the game is using keyboard, this code will check if user device is mobile, in which case it will return an error message.
  if( /Android|webOS|iPhone/i.test(navigator.userAgent) ) {
   $GAME_SCREEN.detach();
   $ERROR.css('display', 'block ');
  } else {
    $ERROR.css('display', 'none');
    $('body').append($GAME_SCREEN);
  };
};

$(window).resize(function(){
  // Verify user's device on resize
  handleError();
  if($(window).width() < MIN_SCREEN){
    $GAME_SCREEN.detach();
    $ERROR.css('display', 'block');
  };
});


$(window).on('load', function(){
  // Verify user's device on load
  handleError();
  if($(window).width() < MIN_SCREEN){
    $GAME_SCREEN.detach();
    $ERROR.css('display', 'block');
  };
});

const handleLegMovement = () => {
  //Handle the image swaps to create an effect of dinosaur's legs moving while being on the ground
  currentDinoSrc = $('#dino').attr('src');
  if (character.position.y === DINO_INITIAL_Y) {
    if (currentDinoSrc === DINO_STAND) {
      $CHARACTER.attr('src', DINO_RUN_1);
    } else if (currentDinoSrc === DINO_RUN_1){
      $CHARACTER.attr('src', DINO_RUN_2);
    } else if(currentDinoSrc === DINO_RUN_2) {
      $CHARACTER.attr('src', DINO_RUN_1);
    }
  } else {
    $CHARACTER.attr('src', DINO_RUN_1);
  };
};

const handleRestart = e => {
  const {keyCode} = e;
  if(keyCode === KEYCODE_RETURN) {
    if(userScore > highScore){
      highScore = userScore;
    };

    character = {
      position: {
        y: DINO_INITIAL_Y,
        x: DINO_INITIAL_X,
        height: CHARACTER_HEIGHT,
        width: CHARACTER_WIDTH,
      },
      movement: {
        up: false,
        down: false
      }
    };

    init();
  };
};


// Should user press space bar or arrow up button, the condition below will get executed.
const handleKeyDown = e => {
  const {keyCode} = e;
  if(keyCode === KEYCODE_UP || keyCode === KEYCODE_SPACE){
    character.movement.up = true;
  };
};

const handleKeyUp = () => {
  character.movement.up = false;
};

const updateMovements = () => {
  $(document).off('keydown', handleRestart)
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

  if (!down && up && newY < DINO_MAX_Y) {
    // Verify if y coordinates are below maximum and if current characters trajectory is upwards to update upwards y coordinates and decrease parabola cure jumping speed
    parabolaVelocity -= 0.20;
    newY += (parabolaVelocity + VELOCITY)
  } else if (!down && newY >= DINO_MAX_Y) {
    // Verify if y trajectory has reached its maximum height to stall the character temporarily midair, then set character for downwards trajectory
    newY = DINO_MAX_Y;
    setTimeout(()=>{
      character.movement.down = true;
    }, 50);
  } else if (down && up && y > DINO_INITIAL_Y) {
    // Should the character be on the downwards trajectory, update the y trajectory and increase parabola cure falling speed.
    parabolaVelocity += 0.20;
    newY -= (parabolaVelocity + VELOCITY);
  } else if (down && up && newY <= DINO_INITIAL_Y) {
    // Should the character be on the ground level, whilst he upwards and downwards trajectories are both active means the characters has completed round trip, hence all of the initial values get reset into original values.
    newY = DINO_INITIAL_Y;
    character.movement.up = false;
    character.movement.down = false;
  };

  // CSS updates for character coordinates.
  character.position.y = newY;
  $CHARACTER.css('bottom', newY);

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
          reset();
      };

    // This condition verifies if object is about to leave the screen, in which case it will be removed from the obstaclesArr array and score gets incremented by 1
    if (element.x < 5) {
      element.type!=='cloud'&&userScore++;
      obstaclesArr.splice(index, 1);
    };

    // Prints the score on to the screen given the 5 digit format with leading zeros, such as 00088
    const scoreStr = userScore.toString().padStart(5, '0');
    $USER_SCORE.text(scoreStr);
  })
};

const randomInterval = () => {
  return Math.floor(Math.random()*(RANDOM_INTERVAL_MAX-RANDOM_INTERVAL_MIN)+RANDOM_INTERVAL_MIN)
};

// Function that creates new Obstacle and pushes them into the obstacleArr array
function addObstacles(){
  if(continueGame){
    // Decide whether it's ufo or cactus that gets created, depending on random number generated form randomInterval function
    const randomObstacle = randomInterval()>2800 ? new Obstacle('ufo') : new Obstacle('cactus');

    obstaclesArr.push(randomObstacle);
    obstaclesArr.push(new Obstacle('cloud'));

    // setTimeout function that creates infinite loop in order to generate new number value in randomInterval function so that obstacles come out at different times
    objectCreationLoop = setTimeout(addObstacles, randomInterval());
  };
};



const init = () => {
  restart();

  // Event listener for the jumping command
  $(document).on('keydown', handleKeyDown);

  // Main game engine.
  dinoRunLoop = setInterval(handleLegMovement, 100)
  gameLoop = setInterval(updateMovements, LOOP_INTERVAL);
  addObstacles();
};

init();
