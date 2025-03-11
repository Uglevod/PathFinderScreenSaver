// Управление игровым меню
class GameMenu {
    constructor(game) {
        this.game = game;
        this.menuElement = document.getElementById('gameMenu');
        this.visible = false;
        
        // Элементы управления
        this.mazeSizeSlider = document.getElementById('mazeSizeSlider');
        this.mazeSizeValue = document.getElementById('mazeSizeValue');
        this.runnerSpeedSlider = document.getElementById('runnerSpeedSlider');
        this.runnerSpeedValue = document.getElementById('runnerSpeedValue');
        this.maxRunnersSlider = document.getElementById('maxRunnersSlider');
        this.maxRunnersValue = document.getElementById('maxRunnersValue');
        this.startButton = document.getElementById('startButton');
        this.trailLengthSlider = document.getElementById('trailLengthSlider');
        this.trailLengthValue = document.getElementById('trailLengthValue');
        this.trailLifetimeSlider = document.getElementById('trailLifetimeSlider');
        this.trailLifetimeValue = document.getElementById('trailLifetimeValue');
        this.trailGlowSlider = document.getElementById('trailGlowSlider');
        this.trailGlowValue = document.getElementById('trailGlowValue');
        this.explosionChanceSlider = document.getElementById('explosionChanceSlider');
        this.explosionChanceValue = document.getElementById('explosionChanceValue');
        this.explosionRadiusSlider = document.getElementById('explosionRadiusSlider');
        this.explosionRadiusValue = document.getElementById('explosionRadiusValue');
        
        // Инициализация значений
        this.mazeSizeSlider.value = MAZE_SIZE;
        this.mazeSizeValue.textContent = MAZE_SIZE;
        this.runnerSpeedSlider.value = this.game.runnerSpeed;
        this.runnerSpeedValue.textContent = this.game.runnerSpeed;
        this.maxRunnersSlider.value = MAX_RUNNERS;
        this.maxRunnersValue.textContent = MAX_RUNNERS;
        this.trailLengthSlider.value = TRAIL_MAX_LENGTH;
        this.trailLengthValue.textContent = TRAIL_MAX_LENGTH;
        this.trailLifetimeSlider.value = TRAIL_LIFETIME;
        this.trailLifetimeValue.textContent = TRAIL_LIFETIME;
        this.trailGlowSlider.value = TRAIL_GLOW_INTENSITY;
        this.trailGlowValue.textContent = TRAIL_GLOW_INTENSITY;
        this.explosionChanceSlider.value = EXPLOSION_CHANCE;
        this.explosionChanceValue.textContent = EXPLOSION_CHANCE;
        this.explosionRadiusSlider.value = EXPLOSION_RADIUS;
        this.explosionRadiusValue.textContent = EXPLOSION_RADIUS;
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Обработка клавиши Alt+M
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key === 'm') {
                this.toggleMenu();
                e.preventDefault(); // Предотвращаем стандартное поведение браузера
            }
        });
        
        // Обновление значений при перемещении ползунков
        this.mazeSizeSlider.addEventListener('input', () => {
            this.mazeSizeValue.textContent = this.mazeSizeSlider.value;
        });
        
        this.runnerSpeedSlider.addEventListener('input', () => {
            this.runnerSpeedValue.textContent = this.runnerSpeedSlider.value;
        });
        
        this.maxRunnersSlider.addEventListener('input', () => {
            this.maxRunnersValue.textContent = this.maxRunnersSlider.value;
        });
        
        this.trailLengthSlider.addEventListener('input', () => {
            this.trailLengthValue.textContent = this.trailLengthSlider.value;
        });
        
        this.trailLifetimeSlider.addEventListener('input', () => {
            this.trailLifetimeValue.textContent = this.trailLifetimeSlider.value;
        });
        
        this.trailGlowSlider.addEventListener('input', () => {
            this.trailGlowValue.textContent = this.trailGlowSlider.value;
        });
        
        this.explosionChanceSlider.addEventListener('input', () => {
            this.explosionChanceValue.textContent = this.explosionChanceSlider.value;
        });
        
        this.explosionRadiusSlider.addEventListener('input', () => {
            this.explosionRadiusValue.textContent = this.explosionRadiusSlider.value;
        });
        
        // Запуск игры с новыми параметрами
        this.startButton.addEventListener('click', () => {
            this.applySettings();
            this.toggleMenu();
        });
    }
    
    toggleMenu() {
        this.visible = !this.visible;
        if (this.visible) {
            this.menuElement.classList.add('visible');
        } else {
            this.menuElement.classList.remove('visible');
        }
    }
    
    applySettings() {
        // Применяем новые настройки
        window.MAZE_SIZE = parseInt(this.mazeSizeSlider.value);
        window.MAX_RUNNERS = parseInt(this.maxRunnersSlider.value);
        
        // Обновляем константы канваса
        window.CANVAS_SIZE = MAZE_SIZE * CELL_SIZE;
        
        // Обновляем параметры игры
        this.game.runnerSpeed = parseFloat(this.runnerSpeedSlider.value);
        
        // Перезапускаем игру с новыми параметрами
        this.game.canvas.width = CANVAS_SIZE;
        this.game.canvas.height = CANVAS_SIZE;
        this.game.resetGame();
        
        // Обновляем константы шлейфа
        window.TRAIL_MAX_LENGTH = parseInt(this.trailLengthSlider.value);
        window.TRAIL_LIFETIME = parseFloat(this.trailLifetimeSlider.value);
        window.TRAIL_GLOW_INTENSITY = parseFloat(this.trailGlowSlider.value);
        
        // Обновляем настройки взрывов
        window.EXPLOSION_CHANCE = parseFloat(this.explosionChanceSlider.value);
        window.EXPLOSION_RADIUS = parseInt(this.explosionRadiusSlider.value);
    }
} 