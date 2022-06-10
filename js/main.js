import {CHARACTER_WIDTH, CHARACTER_HEIGHT, FPS, DINO_INITIAL_Y, DINO_INITIAL_X, DINO_MAX_Y, LOOP_INTERVAL, VELOCITY, RANDOM_INTERVAL_MIN, RANDOM_INTERVAL_MAX, MIN_SCREEN, KEYCODE_UP, KEYCODE_SPACE, KEYCODE_RETURN, DINO_STAND, DINO_RUN_1, DINO_RUN_2, $GAME_SCREEN, $CHARACTER, $USER_SCORE, $HIGH_SCORE, $GAME_OVER, $DINO_SRC, $ERROR} from './global_variables.js';
import {Obstacle} from './obstacle_class.js'

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
