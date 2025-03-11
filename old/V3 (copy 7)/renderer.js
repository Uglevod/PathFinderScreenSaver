class Renderer {
    constructor(canvas, cellSize) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.cellSize = cellSize;
    }

    drawMaze(maze, exits, visitedPositions) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw the maze
        for (let y = 0; y < maze.length; y++) {
            for (let x = 0; x < maze[y].length; x++) {
                const cellX = x * this.cellSize;
                const cellY = y * this.cellSize;

                if (maze[y][x] === 1) {
                    // Wall
                    this.ctx.fillStyle = WALL_COLOR;
                    this.ctx.fillRect(cellX, cellY, this.cellSize, this.cellSize);
                } else {
                    // Path
                    this.ctx.fillStyle = PATH_COLOR;
                    this.ctx.fillRect(cellX, cellY, this.cellSize, this.cellSize);

                    // Draw visited path if applicable
                    const posKey = `${x},${y}`;
                    if (visitedPositions && visitedPositions instanceof Map && visitedPositions.has(posKey)) {
                        this.ctx.fillStyle = 'rgba(0, 255, 0, 0.1)';
                        this.ctx.fillRect(cellX, cellY, this.cellSize, this.cellSize);
                    }
                }
            }
        }

        // Draw exits
        for (const exit of exits) {
            const cellX = exit.x * this.cellSize;
            const cellY = exit.y * this.cellSize;

            this.ctx.fillStyle = EXIT_COLOR;
            this.ctx.fillRect(cellX, cellY, this.cellSize, this.cellSize);
        }
    }

    drawEntity(entity) {
        // Use the exact position for smooth movement
        const centerX = (entity.x + 0.5) * this.cellSize;
        const centerY = (entity.y + 0.5) * this.cellSize;
        const radius = this.cellSize / 2 * 0.8; // 80% of half cell size

        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = entity.color;
        this.ctx.fill();
        this.ctx.closePath();

        // Draw entity ID
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(entity.id, centerX, centerY);
    }

    drawStats(stats) {
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';

        let y = 10;
        for (const [key, value] of Object.entries(stats)) {
            this.ctx.fillText(`${key}: ${value}`, 10, y);
            y += 20;
        }
    }
}