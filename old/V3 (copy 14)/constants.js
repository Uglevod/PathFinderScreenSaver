// Game constants and configuration
const MAZE_SIZE = 151; // Must be odd for maze generation
const CELL_SIZE = 5;
const CANVAS_SIZE = MAZE_SIZE * CELL_SIZE;

// Colors
const WALL_COLOR = '#050404';
const PATH_COLOR = '#000';//afa
const EXIT_COLOR = '#8bc34a';
const NAVIGATOR_COLOR = '#2196f3';
const RUNNER_COLORS = ['#f44336', '#9c27b0', '#ff9800', '#ffeb3b'];




// Max number of runner entities
const MAX_RUNNERS = 100;

// Movement directions - up, right, down, left
const directions = [
    { dx: 0, dy: -1 },
    { dx: 1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 }
];

// Добавим константы для светового шлейфа
const TRAIL_LENGTH = 30; // Увеличим длину шлейфа
const TRAIL_FADE_SPEED = 0.03; // Немного снизим скорость затухания для более плавного эффекта