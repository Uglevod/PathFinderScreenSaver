// Maze generation
class MazeGenerator {
    constructor() {
        this.maze = [];
        this.exits = [];
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

        // Генерируем выходы - один в каждом направлении из внутреннего лабиринта
        this.generateExits(borderSize);

        return this.maze;
    }

    carvePath(x, y) {
        // Помечаем эту ячейку как путь
        this.maze[y][x] = 0;

        // Направления: вверх, вправо, вниз, влево
        const dirs = [[0, -2], [2, 0], [0, 2], [-2, 0]];

        // Перемешиваем направления
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
            }
        }
    }

    generateExits(borderSize) {
        this.exits = [];

        // Обеспечиваем, чтобы выходы не были слишком близко к углам
        const margin = 5;
        const max = MAZE_SIZE - borderSize - margin;
        const min = borderSize + margin;

        // Создаем 4 выхода - по одному с каждой стороны внутреннего лабиринта
        const exitPoints = [
            // Верхний выход
            {
                x: Math.floor(min + Math.random() * (max - min)),
                y: borderSize
            },
            // Правый выход
            {
                x: MAZE_SIZE - borderSize - 1,
                y: Math.floor(min + Math.random() * (max - min))
            },
            // Нижний выход
            {
                x: Math.floor(min + Math.random() * (max - min)),
                y: MAZE_SIZE - borderSize - 1
            },
            // Левый выход
            {
                x: borderSize,
                y: Math.floor(min + Math.random() * (max - min))
            }
        ];

        // Обеспечиваем, чтобы все выходы соединялись с путем
        for (const exit of exitPoints) {
            this.maze[exit.y][exit.x] = 0;

            // Если выход находится на внутренней стене, убедимся, что он соединяется с внутренним путем
            if (exit.x === borderSize) {
                this.maze[exit.y][exit.x + 1] = 0;
            } else if (exit.x === MAZE_SIZE - borderSize - 1) {
                this.maze[exit.y][exit.x - 1] = 0;
            } else if (exit.y === borderSize) {
                this.maze[exit.y + 1][exit.x] = 0;
            } else if (exit.y === MAZE_SIZE - borderSize - 1) {
                this.maze[exit.y - 1][exit.x] = 0;
            }

            // Добавляем в массив выходов
            this.exits.push(exit);
        }
    }

    shuffleArray(array) {
        // Алгоритм перемешивания Фишера-Йейтса
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}
