// Управление игровым меню
class GameMenu {
    constructor(game) {
        this.game = game;
        this.menuElement = document.getElementById('gameMenu');
        this.visible = false;
        
        // Элементы управления
        //this.mazeSizeSlider = document.getElementById('mazeSizeSlider');
        //this.mazeSizeValue = document.getElementById('mazeSizeValue');
        this.runnerSpeedSlider = document.getElementById('runnerSpeedSlider');
        this.runnerSpeedValue = document.getElementById('runnerSpeedValue');
        this.maxRunnersSlider = document.getElementById('maxRunnersSlider');
        this.maxRunnersValue = document.getElementById('maxRunnersValue');
        this.startButton = document.getElementById('startButton');
        
        // Инициализация значений
        //this.mazeSizeSlider.value = MAZE_SIZE;
        //this.mazeSizeValue.textContent = MAZE_SIZE;
        this.runnerSpeedSlider.value = this.game.runnerSpeed;
        this.runnerSpeedValue.textContent = this.game.runnerSpeed;
        this.maxRunnersSlider.value = MAX_RUNNERS;
        this.maxRunnersValue.textContent = MAX_RUNNERS;
        
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
        //this.mazeSizeSlider.addEventListener('input', () => {
        //    this.mazeSizeValue.textContent = this.mazeSizeSlider.value;
        //});
        
        this.runnerSpeedSlider.addEventListener('input', () => {
            this.runnerSpeedValue.textContent = this.runnerSpeedSlider.value;
        });
        
        this.maxRunnersSlider.addEventListener('input', () => {
            this.maxRunnersValue.textContent = this.maxRunnersSlider.value;
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
        //window.MAZE_SIZE = parseInt(this.mazeSizeSlider.value);
        window.MAX_RUNNERS = parseInt(this.maxRunnersSlider.value);
        
        // Обновляем константы канваса
        window.CANVAS_SIZE = MAZE_SIZE * CELL_SIZE;
        
        // Обновляем параметры игры
        this.game.runnerSpeed = parseFloat(this.runnerSpeedSlider.value);
        
        // Перезапускаем игру с новыми параметрами
        this.game.canvas.width = CANVAS_SIZE;
        this.game.canvas.height = CANVAS_SIZE;
        this.game.resetGame();
    }
} 