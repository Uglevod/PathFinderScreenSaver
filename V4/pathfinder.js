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
        
        // С определенной вероятностью используем интеллектуальный поиск пути
        const useSmartPathfinding = Math.random() < 0.7; // 70% времени бегунки используют умный поиск
        
        if (useSmartPathfinding) {
            // Ищем направление к ближайшему выходу
            const exitDirection = this.findDirectionToExit(x, y, entity);
            
            // Если нашли направление и оно доступно, используем его
            if (exitDirection !== -1 && availableDirectionIndexes.includes(exitDirection)) {
                return exitDirection;
            }
        }
        
        // Считаем количество бегунков в каждом направлении (избегаем скоплений)
        const crowdedScore = availableDirectionIndexes.map(dirIndex => {
            const dir = directions[dirIndex];
            const newX = x + dir.dx;
            const newY = y + dir.dy;
            
            // Проверяем окрестность
            let nearbyEntities = 0;
            for (let dx = -2; dx <= 2; dx++) {
                for (let dy = -2; dy <= 2; dy++) {
                    const checkX = newX + dx;
                    const checkY = newY + dy;
                    const posKey = `${checkX},${checkY}`;
                    
                    if (this.visitedPositions.has(posKey)) {
                        // Подсчитываем количество уникальных сущностей в этой области
                        nearbyEntities += this.visitedPositions.get(posKey).size;
                    }
                }
            }
            
            return { dirIndex, crowdScore: nearbyEntities };
        });
        
        // Предпочитаем направления с меньшим скоплением бегунков
        crowdedScore.sort((a, b) => a.crowdScore - b.crowdScore);
        
        // Разделяем непосещенные и посещенные направления
        const unvisitedDirections = [];
        const visitedDirections = [];
        
        for (const { dirIndex } of crowdedScore) {
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
        
        // Выбираем непосещенное направление, если доступно, иначе посещенное
        if (unvisitedDirections.length > 0) {
            // Предпочитаем направления с меньшим скоплением, но с элементом случайности
            const randomIndex = Math.floor(Math.random() * Math.min(2, unvisitedDirections.length));
            return unvisitedDirections[randomIndex];
        } else if (visitedDirections.length > 0) {
            const randomIndex = Math.floor(Math.random() * Math.min(2, visitedDirections.length));
            return visitedDirections[randomIndex];
        }
        
        // Если ничего не подошло, выбираем случайное направление
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
}
