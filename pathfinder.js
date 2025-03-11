// Path finding
class PathFinder {
    constructor(maze, exits) {
        this.maze = maze;
        this.exits = exits;
        this.visitedPositions = new Map(); // Store visited positions with entity IDs
    }
    
    markVisited(x, y, entity) {
        const posKey = `${x},${y}`;
        
        if (!this.visitedPositions.has(posKey)) {
            this.visitedPositions.set(posKey, new Set());
        }
        
        this.visitedPositions.get(posKey).add(entity.id);
        
        // Обновляем карту исследования этой сущности
        if (entity.explorationMap) {
            entity.explorationMap.set(posKey, (entity.explorationMap.get(posKey) || 0) + 1);
            
            // Если карта исследования стала слишком большой, удаляем старые записи
            if (entity.explorationMap.size > entity.explorationMemory) {
                // Находим самую старую запись и удаляем ее
                let oldestKey = null;
                let lowestCount = Infinity;
                
                for (const [key, count] of entity.explorationMap.entries()) {
                    if (count < lowestCount) {
                        lowestCount = count;
                        oldestKey = key;
                    }
                }
                
                if (oldestKey) {
                    entity.explorationMap.delete(oldestKey);
                }
            }
        }
    }
    
    chooseDirection(x, y, entity) {
        // Get available directions (non-wall cells)
        const availableDirections = [];
        const visitedAvailableDirections = [];
        
        for (let i = 0; i < directions.length; i++) {
            const dir = directions[i];
            const newX = x + dir.dx;
            const newY = y + dir.dy;
            
            // Check if the new position is within bounds and not a wall
            if (
                newX >= 0 && newX < MAZE_SIZE &&
                newY >= 0 && newY < MAZE_SIZE &&
                this.maze[newY][newX] === 0 // It's a path
            ) {
                const posKey = `${newX},${newY}`;
                const visited = this.visitedPositions.has(posKey) && 
                               this.visitedPositions.get(posKey).has(entity.id);
                
                if (visited) {
                    visitedAvailableDirections.push(i);
                } else {
                    availableDirections.push(i);
                }
            }
        }
        
        // Choose an unvisited direction if available, otherwise a visited one
        if (availableDirections.length > 0) {
            return availableDirections[Math.floor(Math.random() * availableDirections.length)];
        } else if (visitedAvailableDirections.length > 0) {
            return visitedAvailableDirections[Math.floor(Math.random() * visitedAvailableDirections.length)];
        }
        
        return -1; // No valid direction
    }

    chooseDirectionFromList(x, y, availableDirectionIndexes, entity) {
        if (availableDirectionIndexes.length === 0) {
            return -1;
        }
        
        // Инициализируем или обновляем карту исследования для этой сущности
        if (!entity.explorationMap) {
            entity.explorationMap = new Map();
            entity.explorationLevel = 0.8 + Math.random() * 0.2; // Уровень стремления к исследованию (0.8-1.0)
        }
        
        // Если есть текущее направление, предпочитаем его
        if (entity.currentDirection >= 0 && availableDirectionIndexes.includes(entity.currentDirection)) {
            // Проверяем, не ведет ли это направление в тупик
            const dir = directions[entity.currentDirection];
            const newX = x + dir.dx;
            const newY = y + dir.dy;
            
            // Проверяем, есть ли у следующей клетки выходы (кроме текущей позиции)
            let hasExit = false;
            for (let i = 0; i < directions.length; i++) {
                const nextDir = directions[i];
                const nextX = newX + nextDir.dx;
                const nextY = newY + nextDir.dy;
                
                // Пропускаем проверку обратного направления (откуда пришли)
                if (nextX === x && nextY === y) continue;
                
                if (
                    nextX >= 0 && nextX < MAZE_SIZE &&
                    nextY >= 0 && nextY < MAZE_SIZE &&
                    this.maze[nextY][nextX] === 0 // Это путь
                ) {
                    hasExit = true;
                    break;
                }
            }
            
            // Если это не тупик, продолжаем двигаться в этом направлении с высокой вероятностью
            if (hasExit && Math.random() < 0.95) {
                return entity.currentDirection;
            }
        }
        
        // С высокой вероятностью используем стратегию исследования
        const useExplorationStrategy = Math.random() < entity.explorationLevel;
        
        if (useExplorationStrategy) {
            // Анализируем доступные направления и выбираем неисследованные или наименее исследованные
            const directionScores = availableDirectionIndexes.map(dirIndex => {
                const dir = directions[dirIndex];
                const newX = x + dir.dx;
                const newY = y + dir.dy;
                const posKey = `${newX},${newY}`;
                
                // Проверяем, посещали ли мы эту позицию ранее
                const visited = this.visitedPositions.has(posKey) && 
                              this.visitedPositions.get(posKey).has(entity.id);
                
                // Проверяем, сколько раз мы исследовали эту область
                const explorationCount = entity.explorationMap.get(posKey) || 0;
                
                // Создаем оценку для каждого направления
                // Более низкие значения = более привлекательные направления
                let score = explorationCount;
                
                // Сильно предпочитаем непосещенные пути
                if (!visited) {
                    score -= 1000;
                }
                
                // Проверяем соседние клетки (на 2 шага вперед)
                let unexploredNeighbors = 0;
                for (let dx = -2; dx <= 2; dx++) {
                    for (let dy = -2; dy <= 2; dy++) {
                        const checkX = newX + dx;
                        const checkY = newY + dy;
                        const neighborKey = `${checkX},${checkY}`;
                        
                        // Если соседняя клетка не посещена, увеличиваем счетчик
                        if (!this.visitedPositions.has(neighborKey) || 
                            !this.visitedPositions.get(neighborKey).has(entity.id)) {
                            unexploredNeighbors++;
                        }
                    }
                }
                
                // Дополнительно предпочитаем направления с большим количеством непосещенных соседей
                score -= unexploredNeighbors * 5;
                
                // Если этот путь ведет к выходу, дадим ему бонус
                if (this.isPathToExit(newX, newY)) {
                    score -= 500;
                }
                
                return { dirIndex, score };
            });
            
            // Сортируем направления по оценке (от низших к высшим)
            directionScores.sort((a, b) => a.score - b.score);
            
            // Выбираем одно из лучших направлений (с небольшой случайностью для разнообразия)
            const randomIndex = Math.floor(Math.random() * Math.min(2, directionScores.length));
            const selectedDirIndex = directionScores[randomIndex].dirIndex;
            
            // Обновляем карту исследования
            const selectedDir = directions[selectedDirIndex];
            const newX = x + selectedDir.dx;
            const newY = y + selectedDir.dy;
            const posKey = `${newX},${newY}`;
            entity.explorationMap.set(posKey, (entity.explorationMap.get(posKey) || 0) + 1);
            
            return selectedDirIndex;
        }
        
        // Если не используем стратегию исследования, вернемся к базовому алгоритму
        const unvisitedDirections = [];
        const visitedDirections = [];
        
        for (const dirIndex of availableDirectionIndexes) {
            const dir = directions[dirIndex];
            const newX = x + dir.dx;
            const newY = y + dir.dy;
            
            const posKey = `${newX},${newY}`;
            const visited = this.visitedPositions.has(posKey) && 
                           this.visitedPositions.get(posKey).has(entity.id);
            
            if (visited) {
                visitedDirections.push(dirIndex);
            } else {
                unvisitedDirections.push(dirIndex);
            }
        }
        
        // Предпочитаем непосещенные направления, если доступны
        if (unvisitedDirections.length > 0) {
            return unvisitedDirections[Math.floor(Math.random() * unvisitedDirections.length)];
        } else if (visitedDirections.length > 0) {
            return visitedDirections[Math.floor(Math.random() * visitedDirections.length)];
        }
        
        // Если ничего подходящего не найдено, выбираем случайное направление
        return availableDirectionIndexes[Math.floor(Math.random() * availableDirectionIndexes.length)];
    }

    // Add to PathFinder class to check if a position is an exit
    isExit(x, y) {
        return this.exits.some(exit => exit.x === x && exit.y === y);
    }

    findExitPath(x, y) {
        // Simple BFS to find path to nearest exit
        const queue = [{x, y, path: []}];
        const visited = new Set();
        
        while (queue.length > 0) {
            const current = queue.shift();
            const posKey = `${current.x},${current.y}`;
            
            if (visited.has(posKey)) continue;
            visited.add(posKey);
            
            // Check if current position is an exit
            for (const exit of this.exits) {
                if (current.x === exit.x && current.y === exit.y) {
                    return current.path;
                }
            }
            
            // Try all directions
            for (let i = 0; i < directions.length; i++) {
                const dir = directions[i];
                const newX = current.x + dir.dx;
                const newY = current.y + dir.dy;
                
                // Check if the new position is within bounds and not a wall
                if (
                    newX >= 0 && newX < MAZE_SIZE &&
                    newY >= 0 && newY < MAZE_SIZE &&
                    this.maze[newY][newX] === 0 // It's a path
                ) {
                    const newPath = [...current.path, i];
                    queue.push({x: newX, y: newY, path: newPath});
                }
            }
        }
        
        return []; // No path found
    }

    findDirectionToExit(x, y, entity) {
        // Используем A* или упрощенный алгоритм поиска пути до ближайшего выхода
        // Кэшируем пути для оптимизации производительности
        const posKey = `${x},${y}`;
        
        // При первом посещении точки или с определенной вероятностью пересчитываем путь
        // Это делает поведение более естественным (бегунки не всегда идут по оптимальному пути)
        if (!entity.cachedPath || entity.cachedPath.length === 0 || Math.random() < 0.1) {
            // Находим кратчайший путь до ближайшего выхода
            const path = this.findExitPath(x, y);
            entity.cachedPath = path;
        }
        
        // Если у нас есть кэшированный путь, используем его первый шаг
        if (entity.cachedPath && entity.cachedPath.length > 0) {
            return entity.cachedPath.shift();
        }
        
        // Если путь не найден, возвращаемся к случайному движению
        return -1;
    }

    // Проверяет, может ли путь привести к выходу
    isPathToExit(x, y) {
        // Проверим, находится ли точка на пути к выходу
        // Упрощенная эвристика - проверяем, является ли позиция частью пути,
        // который ведет ближе к одному из выходов
        for (const exit of this.exits) {
            // Вычисляем расстояние Манхэттена до выхода
            const distanceToExit = Math.abs(x - exit.x) + Math.abs(y - exit.y);
            
            // Если мы достаточно близко к выходу и между нами и выходом нет стен,
            // считаем этот путь ведущим к выходу
            if (distanceToExit < 10) {
                return true;
            }
        }
        
        return false;
    }
}
