// Maze generation
class MazeGenerator {
    constructor() {
        this.maze = [];
        this.exits = [];
    }

    generate() {
        // Initialize maze with all walls
        this.maze = Array(MAZE_SIZE).fill().map(() => Array(MAZE_SIZE).fill(1));

        // Start from the center
        const startX = Math.floor(MAZE_SIZE / 2);
        const startY = Math.floor(MAZE_SIZE / 2);

        // Carve the path
        this.carvePath(startX, startY);

        // Generate exits - one in each direction from the edge
        this.generateExits();

        return this.maze;
    }

    carvePath(x, y) {
        // Mark this cell as path
        this.maze[y][x] = 0;

        // Directions: up, right, down, left
        const dirs = [[0, -2], [2, 0], [0, 2], [-2, 0]];

        // Randomize directions
        this.shuffleArray(dirs);

        // Try carving paths in all directions
        for (const [dx, dy] of dirs) {
            const newX = x + dx;
            const newY = y + dy;

            // Check if the new position is within bounds and is a wall
            if (
                newX > 0 && newX < MAZE_SIZE - 1 &&
                newY > 0 && newY < MAZE_SIZE - 1 &&
                this.maze[newY][newX] === 1 // It's a wall
            ) {
                // Carve through the wall between current and new cell
                this.maze[y + dy/2][x + dx/2] = 0;

                // Continue carving from the new cell
                this.carvePath(newX, newY);
            }
        }
    }

    generateExits() {
        this.exits = [];

        // Ensure exits are not too close to the corners
        const margin = 5;
        const max = MAZE_SIZE - margin;
        const min = margin;

        // Create 4 exits, one on each side of the maze
        const exitPoints = [
            // Top exit
            {
                x: Math.floor(min + Math.random() * (max - min)),
                y: 0
            },
            // Right exit
            {
                x: MAZE_SIZE - 1,
                y: Math.floor(min + Math.random() * (max - min))
            },
            // Bottom exit
            {
                x: Math.floor(min + Math.random() * (max - min)),
                y: MAZE_SIZE - 1
            },
            // Left exit
            {
                x: 0,
                y: Math.floor(min + Math.random() * (max - min))
            }
        ];

        // Ensure all exits connect to a path
        for (const exit of exitPoints) {
            this.maze[exit.y][exit.x] = 0;

            // If the exit is on the edge, make sure it connects to an inner path
            if (exit.x === 0) {
                this.maze[exit.y][exit.x + 1] = 0;
            } else if (exit.x === MAZE_SIZE - 1) {
                this.maze[exit.y][exit.x - 1] = 0;
            } else if (exit.y === 0) {
                this.maze[exit.y + 1][exit.x] = 0;
            } else if (exit.y === MAZE_SIZE - 1) {
                this.maze[exit.y - 1][exit.x] = 0;
            }

            // Add to exits array
            this.exits.push(exit);
        }
    }

    shuffleArray(array) {
        // Fisher-Yates shuffle algorithm
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}
