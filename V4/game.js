class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.canvas.width = CANVAS_SIZE;
        this.canvas.height = CANVAS_SIZE;

        this.renderer = new Renderer(this.canvas, CELL_SIZE);
        this.mazeGenerator = new MazeGenerator();
        
        this.maze = [];
        this.exits = [];
        this.entities = [];
        this.pathFinder = null;
        this.stats = {
            runnersEscaped: 0,
            runnersTotal: 0,
            time: 0,
            escapeRate: '0.0%',
            rounds: 1
        };

        this.navigatorSpeed = 9.0;
        this.runnerSpeed = 2.5;

        this.resetGame();

        this.lastTimestamp = 0;
        this.gameLoop(0);
        
        // Инициализируем меню
        this.menu = new GameMenu(this);

        this.explosions = []; // массив для анимаций взрывов
    }

    resetGame() {
        this.maze = this.mazeGenerator.generate();
        this.exits = this.mazeGenerator.exits;

        this.pathFinder = new PathFinder(this.maze, this.exits);

        this.entities = [];
        this.explosions = []; // Очищаем взрывы при перезагрузке игры

        const centerX = Math.floor(MAZE_SIZE / 2);
        const centerY = Math.floor(MAZE_SIZE / 2);

        this.navigator = {
            id: 'N',
            type: 'navigator',
            x: centerX,
            y: centerY,
            targetX: centerX,
            targetY: centerY,
            displayX: centerX,
            displayY: centerY,
            moveProgress: 1.0,
            color: NAVIGATOR_COLOR,
            nextMove: null
        };

        this.entities.push(this.navigator);

        this.stats.runnersEscaped = 0;
        this.stats.runnersTotal = 0;
        this.stats.time = 0;
        this.stats.escapeRate = '0.0%';
        this.stats.rounds += 1;

        this.setupInputHandlers();
    }

    render() {
        this.renderer.drawMaze(this.maze, this.exits, this.pathFinder.visitedPositions);
        
        // Отрисовываем взрывы с проверкой на существование
        if (this.explosions && this.explosions.length > 0) {
            for (const explosion of this.explosions) {
                if (explosion && explosion.particles) {
                    this.renderer.drawExplosion(explosion);
                }
            }
        }
        
        for (const entity of this.entities) {
            const renderEntity = {
                ...entity,
                x: entity.displayX,
                y: entity.displayY
            };
            this.renderer.drawEntity(renderEntity);
        }

        this.renderer.drawStats(this.stats);
    }

    update(deltaTime) {
        this.stats.time += deltaTime;

        // Проверка условия для перезапуска игры
        if (this.stats.runnersEscaped >= 50) {
            console.log("Достигнуто 50 сбежавших бегунков! Перезапуск игры...");
            this.resetGame();
            return; // Прерываем выполнение текущего кадра
        }

        for (const entity of this.entities) {
            this.updateEntityMovement(entity, deltaTime);

            if (entity.moveProgress >= 1.0) {
                if (entity.type === 'runner') {
                    this.planRunnerMove(entity);
                } else if (entity.type === 'navigator' && entity.nextMove !== null) {
                    this.moveNavigator(entity.nextMove);
                    entity.nextMove = null;
                }
            }
        }

        this.spawnRunners();
        this.checkCollisions();

        // Обновляем анимации взрывов - добавляем проверку на существование массива
        if (this.explosions && this.explosions.length > 0) {
            for (let i = this.explosions.length - 1; i >= 0; i--) {
                const explosion = this.explosions[i];
                if (!explosion || !explosion.particles) continue; // Проверяем наличие частиц
                
                explosion.time += deltaTime;
                
                let allParticlesExpired = true;
                
                for (const particle of explosion.particles) {
                    particle.x += particle.vx * deltaTime;
                    particle.y += particle.vy * deltaTime;
                    particle.alpha = Math.max(0, 1 - (explosion.time / particle.life));
                    
                    if (particle.alpha > 0) {
                        allParticlesExpired = false;
                    }
                }
                
                // Удаляем завершённые взрывы
                if (allParticlesExpired) {
                    this.explosions.splice(i, 1);
                }
            }
        }

        // Проверяем, не должен ли взорваться какой-либо из бегунков
        if (this.entities && this.entities.length > 0) {
            for (let i = this.entities.length - 1; i >= 0; i--) {
                const entity = this.entities[i];
                if (entity && entity.type === 'runner' && Math.random() < EXPLOSION_CHANCE) {
                    // Создаём взрыв на месте бегунка
                    this.createExplosion(entity.displayX, entity.displayY, entity.color);
                    
                    // Удаляем бегунка
                    this.entities.splice(i, 1);
                }
            }
        }
    }

    updateEntityMovement(entity, deltaTime) {
        if (entity.x !== entity.targetX || entity.y !== entity.targetY) {
            const speed = entity.type === 'navigator' ? this.navigatorSpeed : this.runnerSpeed;
            entity.moveProgress += speed * deltaTime;

            if (entity.moveProgress >= 1.0) {
                entity.moveProgress = 1.0;
                entity.displayX = entity.targetX;
                entity.displayY = entity.targetY;

                entity.x = entity.targetX;
                entity.y = entity.targetY;

                this.pathFinder.markVisited(entity.x, entity.y, entity);
                
                // Добавляем новую позицию в шлейф для бегунков
                if (entity.type === 'runner' && entity.trail) {
                    entity.trail.push({
                        x: entity.displayX,
                        y: entity.displayY,
                        age: 0 // начальный возраст
                    });
                    
                    // Ограничиваем длину шлейфа
                    if (entity.trail.length > TRAIL_MAX_LENGTH) {
                        entity.trail.shift(); // удаляем самый старый элемент
                    }
                }
            } else {
                entity.displayX = entity.x + (entity.targetX - entity.x) * entity.moveProgress;
                entity.displayY = entity.y + (entity.targetY - entity.y) * entity.moveProgress;
            }
        }
        
        // Увеличиваем возраст точек шлейфа
        if (entity.type === 'runner' && entity.trail) {
            for (let i = 0; i < entity.trail.length; i++) {
                entity.trail[i].age += deltaTime;
            }
            
            // Удаляем точки, которые стали слишком старыми
            entity.trail = entity.trail.filter(point => point.age < TRAIL_LIFETIME);
        }
    }

    gameLoop(timestamp) {
        const deltaTime = (timestamp - this.lastTimestamp) / 1000;
        this.lastTimestamp = timestamp;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame(this.gameLoop.bind(this));
    }

    setupInputHandlers() {
        document.addEventListener('keydown', (e) => {
            let dirIndex = -1;

            switch (e.key) {
                case 'ArrowUp': dirIndex = 0; break;
                case 'ArrowRight': dirIndex = 1; break;
                case 'ArrowDown': dirIndex = 2; break;
                case 'ArrowLeft': dirIndex = 3; break;
            }

            if (dirIndex >= 0) {
                if (this.navigator.moveProgress < 1.0) {
                    this.navigator.nextMove = dirIndex;
                } else {
                    this.moveNavigator(dirIndex);
                }
            }
        });
    }

    moveNavigator(dirIndex) {
        const dir = directions[dirIndex];
        const newX = this.navigator.x + dir.dx;
        const newY = this.navigator.y + dir.dy;

        if (
            newX >= 0 && newX < MAZE_SIZE &&
            newY >= 0 && newY < MAZE_SIZE &&
            this.maze[newY][newX] === 0 &&
            !this.isPositionOccupied(newX, newY, this.navigator)
        ) {
            this.navigator.targetX = newX;
            this.navigator.targetY = newY;
            this.navigator.moveProgress = 0.0;
        }
    }

    planRunnerMove(runner) {
        if (runner.moveProgress >= 1.0) {
            const validDirections = [];
            
            // Проверяем, застрял ли бегунок
            if (runner.lastX === runner.x && runner.lastY === runner.y) {
                runner.stuckCounter++;
                
                // Если бегунок застрял надолго, сбрасываем его кэшированный путь
                if (runner.stuckCounter > 3) {
                    runner.cachedPath = [];
                    runner.stuckCounter = 0;
                }
            } else {
                runner.stuckCounter = 0;
            }
            
            // Запоминаем текущие координаты для проверки на застревание
            runner.lastX = runner.x;
            runner.lastY = runner.y;
            
            for (let i = 0; i < directions.length; i++) {
                const dir = directions[i];
                const newX = runner.x + dir.dx;
                const newY = runner.y + dir.dy;
                
                if (
                    newX >= 0 && newX < MAZE_SIZE &&
                    newY >= 0 && newY < MAZE_SIZE &&
                    this.maze[newY][newX] === 0 &&
                    !this.isPositionOccupied(newX, newY, runner)
                ) {
                    validDirections.push(i);
                }
            }
            
            let dirIndex = -1;
            if (validDirections.length > 0) {
                dirIndex = this.pathFinder.chooseDirectionFromList(runner.x, runner.y, validDirections, runner);
            }

            if (dirIndex >= 0) {
                const dir = directions[dirIndex];
                const newX = runner.x + dir.dx;
                const newY = runner.y + dir.dy;

                runner.targetX = newX;
                runner.targetY = newY;
                runner.moveProgress = 0.0;
            }
        }
    }

    spawnRunners() {
        if (this.entities.filter(e => e.type === 'runner').length < MAX_RUNNERS) {
            if (Math.random() < 0.01) {
                const centerX = Math.floor(MAZE_SIZE / 2);
                const centerY = Math.floor(MAZE_SIZE / 2);

                const runner = {
                    id: Math.floor(Math.random() * 1000),
                    type: 'runner',
                    x: centerX,
                    y: centerY,
                    targetX: centerX,
                    targetY: centerY,
                    displayX: centerX,
                    displayY: centerY,
                    moveProgress: 1.0,
                    color: RUNNER_COLORS[Math.floor(Math.random() * RUNNER_COLORS.length)],
                    intelligence: 0.5 + Math.random() * 0.5,
                    patience: Math.random(),
                    cachedPath: [],
                    stuckCounter: 0,
                    // Добавляем массив для хранения шлейфа - истории позиций
                    trail: []
                };

                this.entities.push(runner);
                this.stats.runnersTotal++;
            }
        }
    }

    checkCollisions() {
        const runnersToRemove = [];
        const borderSize = 2;
        
        for (const entity of this.entities) {
            if (entity.type === 'runner') {
                const x = Math.floor(entity.displayX);
                const y = Math.floor(entity.displayY);
                
                if (
                    x < 0 || x >= MAZE_SIZE || 
                    y < 0 || y >= MAZE_SIZE ||
                    x < borderSize || x >= MAZE_SIZE - borderSize || 
                    y < borderSize || y >= MAZE_SIZE - borderSize
                ) {
                    runnersToRemove.push(entity);
                    this.stats.runnersEscaped++;
                    
                    if (this.stats.runnersTotal > 0) {
                        const rate = (this.stats.runnersEscaped / this.stats.runnersTotal) * 100;
                        this.stats.escapeRate = rate.toFixed(1) + '%';
                    }
                    
                    console.log(`Бегунок ${entity.id} сбежал на позиции (${x}, ${y})!`);
                }
            }
        }
        
        if (runnersToRemove.length > 0) {
            console.log(`Удаляем ${runnersToRemove.length} сбежавших бегунков`);
            this.entities = this.entities.filter(e => !runnersToRemove.includes(e));
        }
    }

    isPositionOccupied(x, y, excludeEntity = null) {
        for (const entity of this.entities) {
            if (excludeEntity && entity.id === excludeEntity.id) {
                continue;
            }
            
            if (
                (entity.x === x && entity.y === y) || 
                (entity.targetX === x && entity.targetY === y && entity.moveProgress < 0.5)
            ) {
                return true;
            }
        }
        return false;
    }

    createExplosion(x, y, color) {
        const particles = [];
        
        for (let i = 0; i < EXPLOSION_PARTICLES; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3;
            
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: 0.2 + Math.random() * 0.3,
                color: color,
                alpha: 1.0,
                life: EXPLOSION_DURATION * (0.5 + Math.random() * 0.5)
            });
        }
        
        this.explosions.push({
            particles,
            time: 0
        });
        
        // Разрушаем стены лабиринта в радиусе взрыва
        this.destroyWalls(Math.floor(x), Math.floor(y), EXPLOSION_RADIUS);
    }

    destroyWalls(centerX, centerY, radius) {
        for (let y = centerY - radius; y <= centerY + radius; y++) {
            for (let x = centerX - radius; x <= centerX + radius; x++) {
                // Проверяем находится ли точка в радиусе взрыва
                const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
                
                // Если точка в радиусе взрыва и это стена
                if (
                    distance <= radius && 
                    x >= 0 && x < MAZE_SIZE && 
                    y >= 0 && y < MAZE_SIZE && 
                    this.maze[y][x] === 1
                ) {
                    // Разрушаем стену
                    this.maze[y][x] = 0;
                }
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const game = new Game('gameCanvas');
});