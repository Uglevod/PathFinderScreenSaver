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
        // Разделить доступные направления на непосещенные и посещенные
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
        
        // Выбираем непосещенное направление, если доступно, иначе посещенное
        if (unvisitedDirections.length > 0) {
            return unvisitedDirections[Math.floor(Math.random() * unvisitedDirections.length)];
        } else if (visitedDirections.length > 0) {
            return visitedDirections[Math.floor(Math.random() * visitedDirections.length)];
        }
        
        return -1; // Нет валидных направлений
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
}
