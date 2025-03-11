// Game constants and configuration
const MAZE_SIZE = 91; // Must be odd for maze generation
const CELL_SIZE = 9;
const CANVAS_SIZE = MAZE_SIZE * CELL_SIZE;

// Colors
const WALL_COLOR = '#050404';
const PATH_COLOR = '#000';//afa
const EXIT_COLOR = '#8bc34a';
const NAVIGATOR_COLOR = '#2196f3';
const RUNNER_COLORS = ['#f44336', '#9c27b0', '#ff9800', '#ffeb3b'];

// Настройки шлейфа бегунков
const TRAIL_LIFETIME = 2.0; // время жизни точки шлейфа в секундах
const TRAIL_MAX_LENGTH = 30; // максимальная длина шлейфа
const TRAIL_GLOW_INTENSITY = 0.8; // интенсивность свечения шлейфа (0-1)

// Настройки взрывов
const EXPLOSION_CHANCE = 0.00008; // шанс взрыва бегунка в каждом кадре
const EXPLOSION_RADIUS = 3; // радиус разрушения стен (в клетках)
const EXPLOSION_PARTICLES = 80; // количество частиц для эффекта взрыва
const EXPLOSION_DURATION = 3.0; // длительность анимации взрыва (секунды)

// Max number of runner entities
const MAX_RUNNERS = 100;

// Movement directions - up, right, down, left
const directions = [
    { dx: 0, dy: -1 },
    { dx: 1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 }
];