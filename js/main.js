const CHARACTER_WIDTH = 29;
const CHARACTER_HEIGHT = 48;
const FPS = 60;
const LOOP_INTERVAL = Math.round(1000 / FPS);
const VELOCITY = 2.5;
const CACTUS_SIZES = {
  0: 32,
  1: 42,
  2: 52,
};

const $gameScreen = $('#game-screen');
const $character = $('#dino');
const $userScore = $('#user-score');
const $highScore = $('#high-score');
const $gameOver = $('#game-over');
const $dinoSrc = $('#dino').attr('src');
const $error = $('#error');

let gameLoop;
let dinoRunLoop;
let objectCreationLoop;
let continueGame = true;

//  Images of running dinosaur
let currentDinoSrc = $dinoSrc;
const dinoStand ="./assets/dino-stand.png";
const dinoRun1 = "./assets/dino-run1.png";
const dinoRun2 = "./assets/dino-run2.png";

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


  initialYAxis(){
    // Gives each object the y axis
    if(this.type === 'cactus'){
      return 68;
    }else if(this.type === 'cloud'){
      return Math.floor(Math.random()*(258-158)+158);
    }else if(this.type === 'ufo'){
      return Math.floor(Math.random()*(155-85)+85);
    };
  };

  append() {
    // Appends new object into the HTML and updates the CSS values
    this.$elem.appendTo($gameScreen).css('bottom', this.y).css('left', this.x).css('font-size', this.size);
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
      return 32;
    }else if(this.type === 'ufo'){
      return 48;
    };
  };

  setEmoji(){
    // Obstacle image
    if(this.type === 'ufo'){
      return '🛸';
    }else if(this.type === 'cactus'){
      return `<img style='height: ${this.size}px' src='./assets/cactus.png'></img>`;
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
    y: 75,
    x: 30,
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
  $gameOver.css('display', 'flex');
  $gameScreen.css('animation', 'none');
  $(document).on('keydown', handleRestart);
};

function restart() {
  // Clear off any pre-existing values in case game is run more than once
  const highScoreStr = highScore.toString().padStart(5, '0');
  $highScore.text('HI'+highScoreStr);
  $gameOver.css('display', 'none');
  $gameScreen.css('animation', 'animatedBackground 8000ms linear infinite');
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
   $gameScreen.detach();
   $error.css('display', 'block ');
  } else {
    $error.css('display', 'none');
    $('body').append($gameScreen);
  };
};

$(window).resize(function(){
  // Verify user's device on resize
  handleError();
  if($(window).width() < 650){
    $gameScreen.detach();
    $error.css('display', 'block');
  };
});


$(window).on('load', function(){
  // Verify user's device on load
  handleError();
  if($(window).width() < 650){
    $gameScreen.detach();
    $error.css('display', 'block');
  };
});

const handleLegMovement = () => {
  //Handle the image swaps to create an effect of dinosaur's legs moving while being on the ground
  currentDinoSrc = $('#dino').attr('src');
  if (character.position.y === 75) {
    if (currentDinoSrc === dinoStand) {
      $character.attr('src', dinoRun1);
    } else if (currentDinoSrc === dinoRun1){
      $character.attr('src', dinoRun2);
    } else if(currentDinoSrc === dinoRun2) {
      $character.attr('src', dinoRun1);
    }
  } else {
    $character.attr('src', dinoRun1);
  };
};

const handleRestart = e => {
  const {keyCode} = e;
  if(keyCode === 13) {
    if(userScore > highScore){
      highScore = userScore;
    };

    character = {
      position: {
        y: 75,
        x: 30,
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
  if(keyCode === 38 || keyCode === 32){
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
    newY = 75;
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
          reset();
      };

    // This condition verifies if object is about to leave the screen, in which case it will be removed from the obstaclesArr array and score gets incremented by 1
    if (element.x < 5) {
      element.type!=='cloud'&&userScore++;
      obstaclesArr.splice(index, 1);
    };

    // Prints the score on to the screen given the 5 digit format with leading zeros, such as 00088
    const scoreStr = userScore.toString().padStart(5, '0');
    $userScore.text(scoreStr);
  })
};

const randomInterval = () => {
  return Math.floor(Math.random()*(3000-1000)+1000)
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
