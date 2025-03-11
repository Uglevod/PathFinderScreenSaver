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
            time: 0
        };

        this.navigatorSpeed = 9.0;
        this.runnerSpeed = 9.5;

        this.resetGame();

        this.lastTimestamp = 0;
        this.gameLoop(0);
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
        this.stats.time = 0;

        this.setupInputHandlers();
    }

    render() {
        this.renderer.drawMaze(this.maze, this.mazeGenerator.exits, this.pathFinder.visitedPositions);
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
            this.maze[newY][newX] === 0
        ) {
            this.navigator.targetX = newX;
            this.navigator.targetY = newY;
            this.navigator.moveProgress = 0.0;
        }
    }

    planRunnerMove(runner) {
        if (runner.moveProgress >= 1.0) {
            const dirIndex = this.pathFinder.chooseDirection(runner.x, runner.y, runner);

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
                    color: RUNNER_COLORS[Math.floor(Math.random() * RUNNER_COLORS.length)]
                };

                this.entities.push(runner);
            }
        }
    }

    checkCollisions() {
        // Check for runners at exits
        const runnersToRemove = [];
        
        for (const entity of this.entities) {
            if (entity.type === 'runner') {
                // Check if runner has completed movement to an exit cell
                if (entity.moveProgress >= 1.0) {
                    // Check if at an exit
                    for (const exit of this.exits) {  // Убедитесь, что используете правильный массив выходов
                        if (entity.x === exit.x && entity.y === exit.y) {
                            runnersToRemove.push(entity);
                            this.stats.runnersEscaped++;
                            console.log(`Runner ${entity.id} escaped at exit (${exit.x}, ${exit.y})!`);
                            break;
                        }
                    }
                }
            }
        }
        
        // Remove escaped runners
        if (runnersToRemove.length > 0) {
            console.log(`Removing ${runnersToRemove.length} runners that escaped`);
            this.entities = this.entities.filter(e => !runnersToRemove.includes(e));
        }
    }



}

document.addEventListener('DOMContentLoaded', () => {
    const game = new Game('gameCanvas');
});