const GAME_WIDTH = 388;
const GAME_HEIGHT = 500;
const CHARACTER_SIZE = 32;
const CHARACTER_WIDTH = 32;
const CHARACTER_HEIGHT = 42;
const FPS = 60;
const LOOP_INTERVAL = Math.round(1000 / FPS);
const VELOCITY = 2.5;


const $character = $('#character');
const $cactus = $('#cactus');

let cactus = {
  position: {
    y: 70,
    x: 50,
  },
  movement: true
}




let character = {
  position: {
    y: 70,
  },
  movement: {
    up: false,
    down: false,
  }
};


const setCharacterMovement = (value, keyCode) => {
  if(keyCode === 38){
    character.movement.up = value;
  };
};

const handleKeyUp = e => {
  console.log('up')
  const {keyCode} = e;
  character.position.y = 70;
  setCharacterMovement(false, e.keyCode);
};

const handleKeyDown = e => {
  const {keyCode} = e;
  console.log('down')
  character.position.x = 205;
  setCharacterMovement(true, e.keyCode);
};

const updateMovements = () => {
  const {
    position: {y},
    movement: {up, down}
  } = character;

  let newY = y;

  if(up && newY<205){
    newY += VELOCITY;
  }

  if(down){
    newY -= VELOCITY;
  };



  if(cactus.movement){
    let cactusNewX = cactus.position.x+=3
    $cactus.css('right', cactusNewX);
  }

  $cactus.css('bottom', cactus.position.y);

  character.position.y = newY;
  $character.css('bottom', newY);
};

const init = () => {
  $(document).on('keyup', handleKeyUp);
  $(document).on('keydown', handleKeyDown);





  gameLoop = setInterval(updateMovements, LOOP_INTERVAL);
};

init();
