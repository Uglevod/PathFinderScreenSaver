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
        // Рисуем шлейф для бегунков
        if (entity.type === 'runner' && entity.trail && entity.trail.length > 0) {
            this.drawTrail(entity);
        }
        
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
        //this.ctx.fillText(entity.id, centerX, centerY);
    }

    drawTrail(entity) {
        if (!entity.trail || entity.trail.length < 2) return;
        
        // Проходим по всем точкам шлейфа
        for (let i = 0; i < entity.trail.length - 1; i++) {
            const point = entity.trail[i];
            const nextPoint = entity.trail[i + 1];
            
            // Рассчитываем позиции в пикселях
            const x1 = (point.x + 0.5) * this.cellSize;
            const y1 = (point.y + 0.5) * this.cellSize;
            const x2 = (nextPoint.x + 0.5) * this.cellSize;
            const y2 = (nextPoint.y + 0.5) * this.cellSize;
            
            // Рассчитываем прозрачность на основе возраста
            const alpha = Math.max(0, 1 - (point.age / TRAIL_LIFETIME));
            
            // Базовый цвет
            const baseColor = entity.color;
            
            // Эффект объемности - рисуем несколько слоев
            // 1. Внешний слой (свечение)
            const glowColor = this.hexToRgba(baseColor, alpha * 0.3);
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.lineWidth = this.cellSize * 0.7; // Широкая линия для свечения
            this.ctx.strokeStyle = glowColor;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            
            // Добавляем размытие если возможно
            if (typeof this.ctx.shadowBlur !== 'undefined') {
                this.ctx.shadowBlur = this.cellSize * 0.5;
                this.ctx.shadowColor = glowColor;
            }
            
            this.ctx.stroke();
            this.ctx.closePath();
            
            // Сбрасываем эффекты тени
            this.ctx.shadowBlur = 0;
            
            // 2. Средний слой
            const midColor = this.hexToRgba(baseColor, alpha * 0.6);
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.lineWidth = this.cellSize * 0.45;
            this.ctx.strokeStyle = midColor;
            this.ctx.stroke();
            this.ctx.closePath();
            
            // 3. Внутренний яркий слой (основной)
            const coreColor = this.hexToRgba(baseColor, alpha * 0.9);
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.lineWidth = this.cellSize * 0.25;
            this.ctx.strokeStyle = coreColor;
            this.ctx.stroke();
            this.ctx.closePath();
        }
    }

    hexToRgba(hex, alpha) {
        let r = parseInt(hex.slice(1, 3), 16);
        let g = parseInt(hex.slice(3, 5), 16);
        let b = parseInt(hex.slice(5, 7), 16);
        
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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

    drawExplosion(explosion) {
        if (!explosion || !explosion.particles) return;
        
        for (const particle of explosion.particles) {
            if (!particle) continue;
            
            const x = particle.x * this.cellSize;
            const y = particle.y * this.cellSize;
            const radius = particle.radius * this.cellSize;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);
            
            // Используем цвет частицы с альфа-каналом
            const rgba = this.hexToRgba(particle.color || '#ffffff', particle.alpha || 0);
            this.ctx.fillStyle = rgba;
            
            // Добавляем свечение
            if (typeof this.ctx.shadowBlur !== 'undefined') {
                this.ctx.shadowBlur = radius * 2;
                this.ctx.shadowColor = rgba;
            }
            
            this.ctx.fill();
            this.ctx.closePath();
            
            // Сбрасываем эффекты тени
            this.ctx.shadowBlur = 0;
        }
    }
}