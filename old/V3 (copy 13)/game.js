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
    }

    resetGame() {
        this.maze = this.mazeGenerator.generate();
        this.exits = this.mazeGenerator.exits;

        this.pathFinder = new PathFinder(this.maze, this.exits);

        this.entities = [];

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
            } else {
                entity.displayX = entity.x + (entity.targetX - entity.x) * entity.moveProgress;
                entity.displayY = entity.y + (entity.targetY - entity.y) * entity.moveProgress;
            }
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
                    stuckCounter: 0
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
}

document.addEventListener('DOMContentLoaded', () => {
    const game = new Game('gameCanvas');
});