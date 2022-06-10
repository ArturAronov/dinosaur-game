export const CHARACTER_WIDTH = 29;
export const CHARACTER_HEIGHT = 48;
export const FPS = 60;
export const DINO_INITIAL_Y = 75;
export const DINO_INITIAL_X = 30;
export const DINO_MAX_Y = 205;
export const LOOP_INTERVAL = Math.round(1000 / FPS);
export const VELOCITY = 2.5;
export const RANDOM_INTERVAL_MIN = 1000;
export const RANDOM_INTERVAL_MAX = 3000;
export const MIN_SCREEN = 650;
export const OBSTACLE_X = 600;
export const CACTUS_Y = 68;
export const SIZE_S = 32;
export const SIZE_M = 42;
export const SIZE_L = 52;
export const KEYCODE_UP = 38;
export const KEYCODE_SPACE = 32;
export const KEYCODE_RETURN = 13;
export const DINO_STAND ="./assets/dino-stand.png";
export const DINO_RUN_1 = "./assets/dino-run1.png";
export const DINO_RUN_2 = "./assets/dino-run2.png";
export const $GAME_SCREEN = $('#game-screen');
export const $CHARACTER = $('#dino');
export const $USER_SCORE = $('#user-score');
export const $HIGH_SCORE = $('#high-score');
export const $GAME_OVER = $('#game-over');
export const $DINO_SRC = $('#dino').attr('src');
export const $ERROR = $('#error');
export const CACTUS_SIZES = {
  0: SIZE_S,
  1: SIZE_M,
  2: SIZE_L,
};
