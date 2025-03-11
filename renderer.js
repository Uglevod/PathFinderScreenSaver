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
        // Рисуем шлейф, если он есть
        if (entity.trail && entity.trail.length > 0) {
            // Создаем градиент для шлейфа
            const gradient = this.ctx.createLinearGradient(
                entity.trail[0].x * this.cellSize, 
                entity.trail[0].y * this.cellSize,
                entity.displayX * this.cellSize, 
                entity.displayY * this.cellSize
            );
            
            // Рисуем шлейф в обратном порядке - от старых точек к новым
            for (let i = entity.trail.length - 1; i >= 0; i--) {
                const point = entity.trail[i];
                const trailX = point.x * this.cellSize;
                const trailY = point.y * this.cellSize;
                
                // Размер зависит от прозрачности для дополнительного эффекта
                const size = this.cellSize * 0.6 * (0.3 + point.opacity * 0.7);
                
                this.ctx.beginPath();
                this.ctx.arc(trailX, trailY, size, 0, Math.PI * 2);
                
                // Используем тот же цвет что и у бегунка, но с измененной прозрачностью
                const color = entity.color;
                const r = parseInt(color.slice(1, 3), 16);
                const g = parseInt(color.slice(3, 5), 16);
                const b = parseInt(color.slice(5, 7), 16);
                
                // Создаем эффект свечения
                const glow = Math.min(255, r + 100, g + 100, b + 100);
                const glowFactor = point.opacity * 0.7;
                const rGlow = Math.floor(r * (1 - glowFactor) + glow * glowFactor);
                const gGlow = Math.floor(g * (1 - glowFactor) + glow * glowFactor);
                const bGlow = Math.floor(b * (1 - glowFactor) + glow * glowFactor);
                
                this.ctx.fillStyle = `rgba(${rGlow}, ${gGlow}, ${bGlow}, ${point.opacity})`;
                this.ctx.fill();
                this.ctx.closePath();
            }
        }
        
        // Рисуем сам объект
        const centerX = entity.displayX * this.cellSize;
        const centerY = entity.displayY * this.cellSize;
        const radius = this.cellSize / 2 * 0.8;

        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = entity.color;
        this.ctx.fill();
        this.ctx.closePath();

        // Отрисовка ID сущности (закомментировано)
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        //this.ctx.fillText(entity.id, centerX, centerY);
    }

    drawStats(stats) {
        this.ctx.fillStyle = '#555';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';

        let y = 10;
        //for (const [key, value] of Object.entries(stats)) {
        //    this.ctx.fillText(`${key}: ${value}`, 10, y);
        //    y += 20;
        //}

        this.ctx.fillText(`R: ${stats.rounds}`, 10, y);
        this.ctx.fillText(`E: ${stats.runnersEscaped}`, 10, y + 20);
        this.ctx.fillText(`C: ${stats.runnersTotal}`, 10, y + 40);
        //this.ctx.fillText(`T: ${stats.time}`, 10, y + 60);
        //this.ctx.fillText(`Escape Rate: ${stats.escapeRate}`, 10, y + 80);
    }
}