// Maze generation
class MazeGenerator {
    constructor() {
        this.maze = [];
        this.exits = [];
        this.branchiness = 0.7; // Параметр, контролирующий ветвистость (0 - мало ветвей, 1 - много)
    }

    generate() {
        // Инициализируем лабиринт со всеми путями (0)
        this.maze = Array(MAZE_SIZE).fill().map(() => Array(MAZE_SIZE).fill(0));
        
        // Создаем внутренний лабиринт со стенами
        const borderSize = 2; // Размер внешнего прохода
        const innerSize = MAZE_SIZE - (borderSize * 2);
        
        // Заполняем внутреннюю часть стенами
        for (let y = borderSize; y < MAZE_SIZE - borderSize; y++) {
            for (let x = borderSize; x < MAZE_SIZE - borderSize; x++) {
                this.maze[y][x] = 1; // Стена
            }
        }

        // Начинаем прокладывать путь с центра
        const startX = Math.floor(MAZE_SIZE / 2);
        const startY = Math.floor(MAZE_SIZE / 2);

        // Прокладываем путь внутри лабиринта
        this.carvePath(startX, startY);
        
        // Добавляем дополнительные проходы для создания циклов и альтернативных путей
        this.addAdditionalPaths(borderSize);
        
        // Генерируем выходы - один в каждом направлении из внутреннего лабиринта
        this.generateExits(borderSize);

        return this.maze;
    }

    carvePath(x, y) {
        // Помечаем эту ячейку как путь
        this.maze[y][x] = 0;

        // Направления: вверх, вправо, вниз, влево
        const dirs = [[0, -2], [2, 0], [0, 2], [-2, 0]];

        // Перемешиваем направления, но с улучшенным алгоритмом,
        // который способствует созданию больших ответвлений
        this.shuffleArray(dirs);

        // Пробуем прокладывать пути во всех направлениях
        for (const [dx, dy] of dirs) {
            const newX = x + dx;
            const newY = y + dy;

            // Проверяем, находится ли новая позиция в пределах внутреннего лабиринта
            if (
                newX > 1 && newX < MAZE_SIZE - 1 &&
                newY > 1 && newY < MAZE_SIZE - 1 &&
                this.maze[newY][newX] === 1 // Это стена
            ) {
                // Прорезаем стену между текущей и новой ячейкой
                this.maze[y + dy/2][x + dx/2] = 0;

                // Продолжаем прокладывать путь от новой ячейки
                this.carvePath(newX, newY);
                
                // Добавляем ответвления с определенной вероятностью
                // Чем выше branchiness, тем больше вероятность создать еще одно ответвление
                if (Math.random() < this.branchiness) {
                    // Находим случайную стену поблизости и пробуем создать новый путь
                    const randomDir = Math.floor(Math.random() * 4);
                    const [rdx, rdy] = dirs[randomDir];
                    const randX = x + rdx;
                    const randY = y + rdy;
                    
                    if (
                        randX > 1 && randX < MAZE_SIZE - 1 &&
                        randY > 1 && randY < MAZE_SIZE - 1 &&
                        this.maze[randY][randX] === 1
                    ) {
                        this.maze[y + rdy/2][x + rdx/2] = 0;
                        this.carvePath(randX, randY);
                    }
                }
            }
        }
    }
    
    // Добавление дополнительных проходов для создания циклов и альтернативных путей
    addAdditionalPaths(borderSize) {
        // Количество дополнительных проходов зависит от размера лабиринта
        const numAdditionalPaths = Math.floor(MAZE_SIZE * 0.5);
        
        for (let i = 0; i < numAdditionalPaths; i++) {
            // Выбираем случайную позицию внутри лабиринта 
            const x = borderSize + Math.floor(Math.random() * (MAZE_SIZE - 2 * borderSize));
            const y = borderSize + Math.floor(Math.random() * (MAZE_SIZE - 2 * borderSize));
            
            // Если это стена, и она окружена путями, то превращаем ее в путь
            if (this.maze[y][x] === 1) {
                // Подсчитываем количество соседних путей
                let pathNeighbors = 0;
                if (y > 0 && this.maze[y-1][x] === 0) pathNeighbors++;
                if (y < MAZE_SIZE-1 && this.maze[y+1][x] === 0) pathNeighbors++;
                if (x > 0 && this.maze[y][x-1] === 0) pathNeighbors++;
                if (x < MAZE_SIZE-1 && this.maze[y][x+1] === 0) pathNeighbors++;
                
                // Если хотя бы два соседа - пути, превращаем стену в путь
                if (pathNeighbors >= 2) {
                    this.maze[y][x] = 0;
                }
            }
        }
    }

    generateExits(borderSize) {
        this.exits = [];

        // Обеспечиваем, чтобы выходы не были слишком близко к углам
        const margin = 5;
        const max = MAZE_SIZE - borderSize - margin;
        const min = borderSize + margin;

        // Добавляем больше выходов для увеличения разнообразия
        const numExits = 8; // Увеличиваем количество выходов
        const exitPositions = [];
        
        // Создаем равномерно распределенные выходы по периметру
        for (let i = 0; i < numExits; i++) {
            // Определяем, на какой стороне будет выход
            const side = i % 4;
            let exit;
            
            switch (side) {
                case 0: // Верхняя сторона
                    exit = {
                        x: min + Math.floor(Math.random() * (max - min)),
                        y: borderSize
                    };
                    break;
                case 1: // Правая сторона
                    exit = {
                        x: MAZE_SIZE - borderSize - 1,
                        y: min + Math.floor(Math.random() * (max - min))
                    };
                    break;
                case 2: // Нижняя сторона
                    exit = {
                        x: min + Math.floor(Math.random() * (max - min)),
                        y: MAZE_SIZE - borderSize - 1
                    };
                    break;
                case 3: // Левая сторона
                    exit = {
                        x: borderSize,
                        y: min + Math.floor(Math.random() * (max - min))
                    };
                    break;
            }
            
            exitPositions.push(exit);
        }

        // Обеспечиваем, чтобы все выходы соединялись с путем
        for (const exit of exitPositions) {
            this.maze[exit.y][exit.x] = 0;

            // Если выход находится на внутренней стене, убедимся, что он соединяется с внутренним путем
            if (exit.x === borderSize) {
                this.maze[exit.y][exit.x + 1] = 0;
                // Добавляем дополнительный проход для большей связности
                if (exit.y > borderSize) this.maze[exit.y - 1][exit.x + 1] = 0;
            } else if (exit.x === MAZE_SIZE - borderSize - 1) {
                this.maze[exit.y][exit.x - 1] = 0;
                if (exit.y < MAZE_SIZE - borderSize - 1) this.maze[exit.y + 1][exit.x - 1] = 0;
            } else if (exit.y === borderSize) {
                this.maze[exit.y + 1][exit.x] = 0;
                if (exit.x > borderSize) this.maze[exit.y + 1][exit.x - 1] = 0;
            } else if (exit.y === MAZE_SIZE - borderSize - 1) {
                this.maze[exit.y - 1][exit.x] = 0;
                if (exit.x < MAZE_SIZE - borderSize - 1) this.maze[exit.y - 1][exit.x + 1] = 0;
            }

            // Добавляем в массив выходов
            this.exits.push(exit);
        }
    }

    shuffleArray(array) {
        // Улучшенный алгоритм перемешивания для создания более ветвистых путей
        // Вместо стандартного алгоритма Фишера-Йейтса, добавляем смещение
        // для создания более разнообразных паттернов
        for (let i = array.length - 1; i > 0; i--) {
            const bias = Math.random() < this.branchiness ? 0.3 : 0;
            const j = Math.floor(Math.random() * (i + 1) + bias * i) % array.length;
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}
