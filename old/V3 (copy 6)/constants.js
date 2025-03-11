// Game constants and configuration
const MAZE_SIZE = 51; // Must be odd for maze generation
const CELL_SIZE = 16;
const CANVAS_SIZE = MAZE_SIZE * CELL_SIZE;

// Colors
const WALL_COLOR = '#333';
const PATH_COLOR = '#afa';
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