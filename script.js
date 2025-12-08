// ============================================
// SUDOKU MASTER - COMPREHENSIVE JAVASCRIPT
// ============================================

// ============================================
// GLOBAL CONSTANTS & CONFIGURATION
// ============================================

const CONFIG = {
    GRID_SIZE: 9,
    BOX_SIZE: 3,
    TOTAL_CELLS: 81,
    STORAGE_KEY: 'sudoku_game_data',
    STATS_KEY: 'sudoku_stats',
    SETTINGS_KEY: 'sudoku_settings',
    ACHIEVEMENTS_KEY: 'sudoku_achievements',
    
    DIFFICULTY: {
        easy: { min: 38, max: 42, name: 'Easy', multiplier: 1 },
        medium: { min: 32, max: 37, name: 'Medium', multiplier: 1.5 },
        hard: { min: 28, max: 31, name: 'Hard', multiplier: 2 },
        expert: { min: 22, max: 27, name: 'Expert', multiplier: 3 },
        master: { min: 17, max: 21, name: 'Master', multiplier: 5 }
    },
    
    POINTS: {
        CORRECT_CELL: 10,
        HINT_PENALTY: -20,
        ERROR_PENALTY: -5,
        TIME_BONUS_THRESHOLD: 300, // 5 minutes
        PERFECT_GAME_BONUS: 500
    }
};

// ============================================
// GAME STATE
// ============================================

const GameState = {
    grid: [],
    solution: [],
    initialGrid: [],
    selectedCell: null,
    notesMode: false,
    isPaused: false,
    isGameOver: false,
    startTime: null,
    elapsedTime: 0,
    timerInterval: null,
    score: 0,
    hints: 3,
    errors: 0,
    difficulty: 'easy',
    gameMode: 'classic',
    moves: [],
    currentMoveIndex: -1
};

// ============================================
// SETTINGS
// ============================================

const Settings = {
    autoCheckErrors: true,
    highlightSame: true,
    highlightArea: true,
    autoRemoveNotes: true,
    colorScheme: 'blue',
    animationsEnabled: true,
    showTimer: true,
    soundEnabled: true,
    volume: 50,
    highContrast: false,
    largeNumbers: false,
    
    load() {
        const saved = localStorage.getItem(CONFIG.SETTINGS_KEY);
        if (saved) {
            Object.assign(this, JSON.parse(saved));
            this.apply();
        }
    },
    
    save() {
        const settings = { ...this };
        delete settings.load;
        delete settings.save;
        delete settings.apply;
        localStorage.setItem(CONFIG.SETTINGS_KEY, JSON.stringify(settings));
    },
    
    apply() {
        document.getElementById('autoCheckErrors').checked = this.autoCheckErrors;
        document.getElementById('highlightSame').checked = this.highlightSame;
        document.getElementById('highlightArea').checked = this.highlightArea;
        document.getElementById('autoRemoveNotes').checked = this.autoRemoveNotes;
        document.getElementById('colorScheme').value = this.colorScheme;
        document.getElementById('animationsEnabled').checked = this.animationsEnabled;
        document.getElementById('showTimer').checked = this.showTimer;
        document.getElementById('soundEnabled').checked = this.soundEnabled;
        document.getElementById('volumeSlider').value = this.volume;
        document.getElementById('volumeValue').textContent = this.volume + '%';
        document.getElementById('highContrast').checked = this.highContrast;
        document.getElementById('largeNumbers').checked = this.largeNumbers;
        
        if (this.highContrast) {
            document.body.classList.add('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }
        
        if (this.largeNumbers) {
            document.body.classList.add('large-numbers');
        } else {
            document.body.classList.remove('large-numbers');
        }
    }
};

// ============================================
// STATISTICS
// ============================================

const Statistics = {
    gamesPlayed: 0,
    gamesWon: 0,
    totalScore: 0,
    bestTime: Infinity,
    currentStreak: 0,
    longestStreak: 0,
    hintsUsed: 0,
    byDifficulty: {
        easy: { played: 0, won: 0 },
        medium: { played: 0, won: 0 },
        hard: { played: 0, won: 0 },
        expert: { played: 0, won: 0 },
        master: { played: 0, won: 0 }
    },
    
    load() {
        const saved = localStorage.getItem(CONFIG.STATS_KEY);
        if (saved) {
            Object.assign(this, JSON.parse(saved));
        }
    },
    
    save() {
        const stats = { ...this };
        delete stats.load;
        delete stats.save;
        delete stats.update;
        delete stats.display;
        localStorage.setItem(CONFIG.STATS_KEY, JSON.stringify(stats));
    },
    
    update(won) {
        this.gamesPlayed++;
        this.byDifficulty[GameState.difficulty].played++;
        
        if (won) {
            this.gamesWon++;
            this.byDifficulty[GameState.difficulty].won++;
            this.currentStreak++;
            this.longestStreak = Math.max(this.longestStreak, this.currentStreak);
            this.totalScore += GameState.score;
            
            if (GameState.elapsedTime < this.bestTime) {
                this.bestTime = GameState.elapsedTime;
            }
        } else {
            this.currentStreak = 0;
        }
        
        this.save();
        this.display();
    },
    
    display() {
        const winRate = this.gamesPlayed > 0 ? 
            Math.round((this.gamesWon / this.gamesPlayed) * 100) : 0;
        
        document.getElementById('totalGames').textContent = this.gamesPlayed;
        document.getElementById('winRate').textContent = winRate + '%';
        document.getElementById('bestTime').textContent = 
            this.bestTime === Infinity ? '--:--' : formatTime(this.bestTime);
        document.getElementById('currentStreak').textContent = this.currentStreak;
        
        document.getElementById('statsGamesPlayed').textContent = this.gamesPlayed;
        document.getElementById('statsGamesWon').textContent = this.gamesWon;
        document.getElementById('statsWinRate').textContent = winRate + '%';
        document.getElementById('statsBestTime').textContent = 
            this.bestTime === Infinity ? '--:--' : formatTime(this.bestTime);
        document.getElementById('statsCurrentStreak').textContent = this.currentStreak;
        document.getElementById('statsLongestStreak').textContent = this.longestStreak;
        document.getElementById('statsTotalScore').textContent = this.totalScore.toLocaleString();
        document.getElementById('statsHintsUsed').textContent = this.hintsUsed;
    },
    
    reset() {
        if (confirm('Are you sure you want to reset all statistics? This cannot be undone.')) {
            Object.assign(this, {
                gamesPlayed: 0,
                gamesWon: 0,
                totalScore: 0,
                bestTime: Infinity,
                currentStreak: 0,
                longestStreak: 0,
                hintsUsed: 0,
                byDifficulty: {
                    easy: { played: 0, won: 0 },
                    medium: { played: 0, won: 0 },
                    hard: { played: 0, won: 0 },
                    expert: { played: 0, won: 0 },
                    master: { played: 0, won: 0 }
                }
            });
            this.save();
            this.display();
            showNotification('Statistics reset successfully', 'success');
        }
    }
};

// ============================================
// ACHIEVEMENTS SYSTEM
// ============================================

const ACHIEVEMENTS = [
    { id: 'first_game', name: 'First Steps', description: 'Complete your first game', icon: '🎮', unlocked: false },
    { id: 'speed_demon', name: 'Speed Demon', description: 'Complete a game in under 5 minutes', icon: '⚡', unlocked: false },
    { id: 'perfect_game', name: 'Perfectionist', description: 'Complete a game without errors', icon: '💯', unlocked: false },
    { id: 'no_hints', name: 'Pure Skill', description: 'Win without using hints', icon: '🧠', unlocked: false },
    { id: 'streak_5', name: 'On Fire', description: 'Win 5 games in a row', icon: '🔥', unlocked: false },
    { id: 'streak_10', name: 'Unstoppable', description: 'Win 10 games in a row', icon: '🌟', unlocked: false },
    { id: 'master_win', name: 'Master Mind', description: 'Complete a Master difficulty game', icon: '👑', unlocked: false },
    { id: 'games_10', name: 'Dedicated', description: 'Play 10 games', icon: '🎯', unlocked: false },
    { id: 'games_50', name: 'Enthusiast', description: 'Play 50 games', icon: '🏆', unlocked: false },
    { id: 'games_100', name: 'Legend', description: 'Play 100 games', icon: '⭐', unlocked: false },
    { id: 'high_score', name: 'High Scorer', description: 'Score over 1000 points in a game', icon: '💰', unlocked: false },
    { id: 'early_bird', name: 'Early Bird', description: 'Complete daily challenge', icon: '🌅', unlocked: false }
];

const Achievements = {
    list: [...ACHIEVEMENTS],
    
    load() {
        const saved = localStorage.getItem(CONFIG.ACHIEVEMENTS_KEY);
        if (saved) {
            const unlocked = JSON.parse(saved);
            this.list.forEach(achievement => {
                if (unlocked.includes(achievement.id)) {
                    achievement.unlocked = true;
                }
            });
        }
    },
    
    save() {
        const unlocked = this.list.filter(a => a.unlocked).map(a => a.id);
        localStorage.setItem(CONFIG.ACHIEVEMENTS_KEY, JSON.stringify(unlocked));
    },
    
    unlock(id) {
        const achievement = this.list.find(a => a.id === id);
        if (achievement && !achievement.unlocked) {
            achievement.unlocked = true;
            this.save();
            showNotification(`Achievement Unlocked: ${achievement.name}!`, 'achievement');
            playSound('achievement');
            return achievement;
        }
        return null;
    },
    
    check() {
        const newAchievements = [];
        
        // First game
        if (Statistics.gamesWon >= 1) {
            const a = this.unlock('first_game');
            if (a) newAchievements.push(a);
        }
        
        // Speed demon
        if (GameState.elapsedTime < 300 && GameState.isGameOver) {
            const a = this.unlock('speed_demon');
            if (a) newAchievements.push(a);
        }
        
        // Perfect game
        if (GameState.errors === 0 && GameState.isGameOver) {
            const a = this.unlock('perfect_game');
            if (a) newAchievements.push(a);
        }
        
        // No hints
        if (GameState.hints === 3 && GameState.isGameOver) {
            const a = this.unlock('no_hints');
            if (a) newAchievements.push(a);
        }
        
        // Streaks
        if (Statistics.currentStreak >= 5) {
            const a = this.unlock('streak_5');
            if (a) newAchievements.push(a);
        }
        if (Statistics.currentStreak >= 10) {
            const a = this.unlock('streak_10');
            if (a) newAchievements.push(a);
        }
        
        // Master win
        if (GameState.difficulty === 'master' && GameState.isGameOver) {
            const a = this.unlock('master_win');
            if (a) newAchievements.push(a);
        }
        
        // Games played
        if (Statistics.gamesPlayed >= 10) {
            const a = this.unlock('games_10');
            if (a) newAchievements.push(a);
        }
        if (Statistics.gamesPlayed >= 50) {
            const a = this.unlock('games_50');
            if (a) newAchievements.push(a);
        }
        if (Statistics.gamesPlayed >= 100) {
            const a = this.unlock('games_100');
            if (a) newAchievements.push(a);
        }
        
        // High score
        if (GameState.score > 1000) {
            const a = this.unlock('high_score');
            if (a) newAchievements.push(a);
        }
        
        return newAchievements;
    },
    
    display() {
        const grid = document.getElementById('achievementsGrid');
        grid.innerHTML = '';
        
        this.list.forEach(achievement => {
            const card = document.createElement('div');
            card.className = `achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`;
            card.innerHTML = `
                <div class="achievement-badge">${achievement.icon}</div>
                <h3>${achievement.name}</h3>
                <p>${achievement.description}</p>
                ${achievement.unlocked ? '<span class="achievement-date">Unlocked</span>' : '<span class="achievement-date">Locked</span>'}
            `;
            grid.appendChild(card);
        });
        
        // Display recent achievements
        const recent = this.list.filter(a => a.unlocked).slice(-3).reverse();
        const recentContainer = document.getElementById('recentAchievements');
        
        if (recent.length > 0) {
            recentContainer.innerHTML = '';
            recent.forEach(achievement => {
                const item = document.createElement('div');
                item.className = 'achievement-item';
                item.innerHTML = `
                    <div class="achievement-icon">${achievement.icon}</div>
                    <div class="achievement-info">
                        <h4>${achievement.name}</h4>
                        <p>${achievement.description}</p>
                    </div>
                `;
                recentContainer.appendChild(item);
            });
        }
    }
};

// ============================================
// SUDOKU GENERATOR & SOLVER
// ============================================

class SudokuGenerator {
    constructor() {
        this.grid = Array(9).fill(null).map(() => Array(9).fill(0));
    }
    
    // Check if number is valid in position
    isValid(grid, row, col, num) {
        // Check row
        for (let x = 0; x < 9; x++) {
            if (grid[row][x] === num) return false;
        }
        
        // Check column
        for (let x = 0; x < 9; x++) {
            if (grid[x][col] === num) return false;
        }
        
        // Check 3x3 box
        const startRow = row - (row % 3);
        const startCol = col - (col % 3);
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (grid[i + startRow][j + startCol] === num) return false;
            }
        }
        
        return true;
    }
    
    // Solve sudoku using backtracking
    solve(grid) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === 0) {
                    const numbers = this.shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
                    for (const num of numbers) {
                        if (this.isValid(grid, row, col, num)) {
                            grid[row][col] = num;
                            if (this.solve(grid)) {
                                return true;
                            }
                            grid[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }
    
    // Shuffle array
    shuffleArray(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
    
    // Generate complete sudoku
    generate() {
        this.grid = Array(9).fill(null).map(() => Array(9).fill(0));
        
        // Fill diagonal 3x3 boxes
        for (let box = 0; box < 9; box += 3) {
            const numbers = this.shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
            let index = 0;
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    this.grid[box + i][box + j] = numbers[index++];
                }
            }
        }
        
        // Solve the rest
        this.solve(this.grid);
        return this.grid;
    }
    
    // Create puzzle by removing numbers
    createPuzzle(difficulty) {
        const solution = this.generate();
        const puzzle = solution.map(row => [...row]);
        
        const config = CONFIG.DIFFICULTY[difficulty];
        const cellsToKeep = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
        const cellsToRemove = 81 - cellsToKeep;
        
        let removed = 0;
        const attempts = [];
        
        while (removed < cellsToRemove) {
            const row = Math.floor(Math.random() * 9);
            const col = Math.floor(Math.random() * 9);
            const key = `${row},${col}`;
            
            if (!attempts.includes(key) && puzzle[row][col] !== 0) {
                puzzle[row][col] = 0;
                removed++;
                attempts.push(key);
            }
        }
        
        return { puzzle, solution };
    }
    
    // Count solutions (to verify unique solution)
    countSolutions(grid, limit = 2) {
        let count = 0;
        
        const solve = (g) => {
            if (count >= limit) return;
            
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    if (g[row][col] === 0) {
                        for (let num = 1; num <= 9; num++) {
                            if (this.isValid(g, row, col, num)) {
                                g[row][col] = num;
                                solve(g);
                                g[row][col] = 0;
                            }
                        }
                        return;
                    }
                }
            }
            count++;
        };
        
        const gridCopy = grid.map(row => [...row]);
        solve(gridCopy);
        return count;
    }
}

// ============================================
// GAME LOGIC
// ============================================

function initGame() {
    Settings.load();
    Statistics.load();
    Achievements.load();
    
    createGrid();
    setupEventListeners();
    Statistics.display();
    Achievements.display();
    
    // Hide loading screen and show game
    setTimeout(() => {
        document.getElementById('loadingScreen').style.display = 'none';
        document.getElementById('mainContainer').style.display = 'block';
        startNewGame('easy');
    }, 2000);
}

function startNewGame(difficulty = GameState.difficulty, mode = GameState.gameMode) {
    // Reset game state
    GameState.difficulty = difficulty;
    GameState.gameMode = mode;
    GameState.selectedCell = null;
    GameState.notesMode = false;
    GameState.isPaused = false;
    GameState.isGameOver = false;
    GameState.startTime = Date.now();
    GameState.elapsedTime = 0;
    GameState.score = 0;
    GameState.hints = 3;
    GameState.errors = 0;
    GameState.moves = [];
    GameState.currentMoveIndex = -1;
    
    // Generate new puzzle
    const generator = new SudokuGenerator();
    const { puzzle, solution } = generator.createPuzzle(difficulty);
    
    GameState.grid = puzzle.map(row => [...row]);
    GameState.solution = solution;
    GameState.initialGrid = puzzle.map(row => [...row]);
    
    // Update UI
    renderGrid();
    updateDisplay();
    startTimer();
    
    document.getElementById('currentDifficulty').textContent = CONFIG.DIFFICULTY[difficulty].name;
    
    // Update difficulty buttons
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.difficulty === difficulty);
    });
    
    playSound('start');
    showNotification('New game started! Good luck!', 'info');
}

function createGrid() {
    const gridContainer = document.getElementById('sudokuGrid');
    gridContainer.innerHTML = '';
    
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener('click', () => selectCell(row, col));
            gridContainer.appendChild(cell);
        }
    }
}

function renderGrid() {
    const cells = document.querySelectorAll('.cell');
    
    cells.forEach((cell, index) => {
        const row = Math.floor(index / 9);
        const col = index % 9;
        const value = GameState.grid[row][col];
        const isInitial = GameState.initialGrid[row][col] !== 0;
        
        cell.className = 'cell';
        cell.textContent = '';
        cell.innerHTML = '';
        
        if (isInitial) {
            cell.classList.add('cell-fixed');
        }
        
        if (value !== 0) {
            cell.textContent = value;
            
            // Check if error
            if (Settings.autoCheckErrors && !isInitial && value !== GameState.solution[row][col]) {
                cell.classList.add('cell-error');
            }
        }
        
        // Highlight selected cell
        if (GameState.selectedCell && 
            GameState.selectedCell.row === row && 
            GameState.selectedCell.col === col) {
            cell.classList.add('cell-selected');
        }
        
        // Highlight related cells
        if (Settings.highlightArea && GameState.selectedCell) {
            const selRow = GameState.selectedCell.row;
            const selCol = GameState.selectedCell.col;
            
            if (row === selRow || col === selCol ||
                (Math.floor(row / 3) === Math.floor(selRow / 3) && 
                 Math.floor(col / 3) === Math.floor(selCol / 3))) {
                cell.classList.add('cell-highlighted');
            }
        }
        
        // Highlight same numbers
        if (Settings.highlightSame && GameState.selectedCell && value !== 0) {
            const selectedValue = GameState.grid[GameState.selectedCell.row][GameState.selectedCell.col];
            if (value === selectedValue) {
                cell.classList.add('cell-same-number');
            }
        }
    });
    
    updateProgress();
}

function selectCell(row, col) {
    if (GameState.isPaused || GameState.isGameOver) return;
    
    // Don't allow selecting fixed cells
    if (GameState.initialGrid[row][col] !== 0) {
        playSound('error');
        return;
    }
    
    GameState.selectedCell = { row, col };
    renderGrid();
    playSound('click');
}

function setNumber(num) {
    if (!GameState.selectedCell || GameState.isPaused || GameState.isGameOver) return;
    
    const { row, col } = GameState.selectedCell;
    
    // Don't allow changing fixed cells
    if (GameState.initialGrid[row][col] !== 0) return;
    
    const oldValue = GameState.grid[row][col];
    
    if (GameState.notesMode) {
        // Notes functionality (simplified for this version)
        playSound('note');
        return;
    }
    
    // Save move for undo
    addMove({ row, col, oldValue, newValue: num });
    
    GameState.grid[row][col] = num;
    
    // Check if correct
    if (num === GameState.solution[row][col]) {
        GameState.score += CONFIG.POINTS.CORRECT_CELL * CONFIG.DIFFICULTY[GameState.difficulty].multiplier;
        playSound('success');
    } else if (Settings.autoCheckErrors) {
        GameState.errors++;
        GameState.score += CONFIG.POINTS.ERROR_PENALTY;
        playSound('error');
    }
    
    renderGrid();
    updateDisplay();
    checkWin();
}

function eraseCell() {
    if (!GameState.selectedCell || GameState.isPaused || GameState.isGameOver) return;
    
    const { row, col } = GameState.selectedCell;
    
    // Don't allow erasing fixed cells
    if (GameState.initialGrid[row][col] !== 0) return;
    
    const oldValue = GameState.grid[row][col];
    if (oldValue !== 0) {
        addMove({ row, col, oldValue, newValue: 0 });
        GameState.grid[row][col] = 0;
        renderGrid();
        playSound('erase');
    }
}

function toggleNotes() {
    GameState.notesMode = !GameState.notesMode;
    document.getElementById('notesBtn').classList.toggle('active', GameState.notesMode);
    playSound('click');
    showNotification(GameState.notesMode ? 'Notes mode enabled' : 'Notes mode disabled', 'info');
}

function getHint() {
    if (GameState.hints <= 0 || GameState.isPaused || GameState.isGameOver) {
        showNotification('No hints remaining!', 'error');
        playSound('error');
        return;
    }
    
    // Find empty cells
    const emptyCells = [];
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (GameState.grid[row][col] === 0 && GameState.initialGrid[row][col] === 0) {
                emptyCells.push({ row, col });
            }
        }
    }
    
    if (emptyCells.length === 0) return;
    
    // Choose random empty cell
    const cell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const correctNumber = GameState.solution[cell.row][cell.col];
    
    addMove({ row: cell.row, col: cell.col, oldValue: 0, newValue: correctNumber });
    GameState.grid[cell.row][cell.col] = correctNumber;
    GameState.hints--;
    GameState.score += CONFIG.POINTS.HINT_PENALTY;
    Statistics.hintsUsed++;
    
    // Highlight hint cell
    const cellElement = document.querySelector(`[data-row="${cell.row}"][data-col="${cell.col}"]`);
    cellElement.classList.add('cell-hint');
    setTimeout(() => cellElement.classList.remove('cell-hint'), 500);
    
    renderGrid();
    updateDisplay();
    playSound('hint');
    showNotification('Hint used!', 'info');
    checkWin();
}

function validateSolution() {
    let correct = 0;
    let incorrect = 0;
    
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (GameState.grid[row][col] !== 0) {
                if (GameState.grid[row][col] === GameState.solution[row][col]) {
                    correct++;
                } else {
                    incorrect++;
                }
            }
        }
    }
    
    if (incorrect > 0) {
        showNotification(`${incorrect} incorrect cells found!`, 'error');
        playSound('error');
    } else if (correct === 81) {
        showNotification('Perfect! All cells are correct!', 'success');
        playSound('success');
    } else {
        showNotification(`${correct} cells correct, ${81 - correct} remaining`, 'info');
        playSound('click');
    }
}

function checkWin() {
    // Check if all cells are filled
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (GameState.grid[row][col] === 0) return false;
        }
    }
    
    // Check if solution is correct
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (GameState.grid[row][col] !== GameState.solution[row][col]) {
                showNotification('Puzzle complete but has errors!', 'error');
                playSound('error');
                return false;
            }
        }
    }
    
    // Win!
    winGame();
    return true;
}

function winGame() {
    GameState.isGameOver = true;
    stopTimer();
    
    // Calculate final score
    if (GameState.errors === 0) {
        GameState.score += CONFIG.POINTS.PERFECT_GAME_BONUS;
    }
    
    if (GameState.elapsedTime < CONFIG.POINTS.TIME_BONUS_THRESHOLD) {
        const bonus = Math.floor((CONFIG.POINTS.TIME_BONUS_THRESHOLD - GameState.elapsedTime) * 2);
        GameState.score += bonus;
    }
    
    // Update statistics
    Statistics.update(true);
    
    // Check achievements
    const newAchievements = Achievements.check();
    Achievements.display();
    
    // Show victory modal
    showVictoryModal(newAchievements);
    playSound('victory');
}

function showVictoryModal(achievements = []) {
    const modal = document.getElementById('victoryModal');
    
    document.getElementById('victoryTime').textContent = formatTime(GameState.elapsedTime);
    document.getElementById('victoryScore').textContent = GameState.score.toLocaleString();
    
    const accuracy = GameState.errors === 0 ? 100 : 
        Math.round((1 - (GameState.errors / 81)) * 100);
    document.getElementById('victoryAccuracy').textContent = accuracy + '%';
    
    // Show new achievements
    const achievementsContainer = document.getElementById('victoryAchievements');
    if (achievements.length > 0) {
        achievementsContainer.innerHTML = achievements.map(a => `
            <div class="achievement-item">
                <div class="achievement-icon">${a.icon}</div>
                <div class="achievement-info">
                    <h4>${a.name}</h4>
                    <p>${a.description}</p>
                </div>
            </div>
        `).join('');
    } else {
        achievementsContainer.innerHTML = '';
    }
    
    showModal('victoryModal');
}

function undoMove() {
    if (GameState.currentMoveIndex < 0) {
        showNotification('Nothing to undo', 'info');
        return;
    }
    
    const move = GameState.moves[GameState.currentMoveIndex];
    GameState.grid[move.row][move.col] = move.oldValue;
    GameState.currentMoveIndex--;
    
    renderGrid();
    playSound('click');
}

function addMove(move) {
    // Remove any moves after current index
    GameState.moves = GameState.moves.slice(0, GameState.currentMoveIndex + 1);
    GameState.moves.push(move);
    GameState.currentMoveIndex++;
    
    // Limit move history
    if (GameState.moves.length > 100) {
        GameState.moves.shift();
        GameState.currentMoveIndex--;
    }
}

function pauseGame() {
    if (GameState.isGameOver) return;
    
    GameState.isPaused = !GameState.isPaused;
    
    if (GameState.isPaused) {
        stopTimer();
        document.getElementById('pauseTime').textContent = formatTime(GameState.elapsedTime);
        document.getElementById('pauseProgress').textContent = 
            Math.round((getFilledCells() / 81) * 100) + '%';
        showModal('pauseModal');
        playSound('pause');
    } else {
        startTimer();
        hideModal('pauseModal');
    }
    
    document.getElementById('pauseBtn').innerHTML = GameState.isPaused ?
        `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"/>
        </svg><span>Resume</span>` :
        `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="6" y="4" width="4" height="16"/>
            <rect x="14" y="4" width="4" height="16"/>
        </svg><span>Pause</span>`;
}

// ============================================
// TIMER
// ============================================

function startTimer() {
    if (GameState.timerInterval) {
        clearInterval(GameState.timerInterval);
    }
    
    GameState.startTime = Date.now() - (GameState.elapsedTime * 1000);
    
    GameState.timerInterval = setInterval(() => {
        if (!GameState.isPaused && !GameState.isGameOver) {
            GameState.elapsedTime = Math.floor((Date.now() - GameState.startTime) / 1000);
            updateDisplay();
        }
    }, 1000);
}

function stopTimer() {
    if (GameState.timerInterval) {
        clearInterval(GameState.timerInterval);
        GameState.timerInterval = null;
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// ============================================
// UI UPDATES
// ============================================

function updateDisplay() {
    document.getElementById('timer').textContent = formatTime(GameState.elapsedTime);
    document.getElementById('score').textContent = GameState.score.toLocaleString();
    document.getElementById('hintsRemaining').textContent = GameState.hints;
    updateProgress();
}

function updateProgress() {
    const filled = getFilledCells();
    const percentage = Math.round((filled / 81) * 100);
    
    document.getElementById('progressPercentage').textContent = percentage + '%';
    document.getElementById('progressFill').style.width = percentage + '%';
    document.getElementById('filledCells').textContent = filled;
    document.getElementById('remainingCells').textContent = 81 - filled;
}

function getFilledCells() {
    let count = 0;
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (GameState.grid[row][col] !== 0) count++;
        }
    }
    return count;
}

// ============================================
// MODAL MANAGEMENT
// ============================================

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('active');
    playSound('click');
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
}

// ============================================
// SOUND EFFECTS
// ============================================

const Sounds = {
    click: [800, 0.1],
    success: [1000, 0.2],
    error: [400, 0.2],
    hint: [1200, 0.15],
    achievement: [1500, 0.3],
    victory: [2000, 0.5],
    start: [600, 0.15],
    pause: [700, 0.15],
    erase: [500, 0.1],
    note: [900, 0.1]
};

function playSound(type) {
    if (!Settings.soundEnabled) return;
    
    const [frequency, duration] = Sounds[type] || [800, 0.1];
    
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(Settings.volume / 100 * 0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    } catch (e) {
        console.log('Audio not supported');
    }
}

// ============================================
// NOTIFICATIONS
// ============================================

function showNotification(message, type = 'info') {
    const toast = document.getElementById('notificationToast');
    const icon = toast.querySelector('.toast-icon');
    const messageEl = toast.querySelector('.toast-message');
    
    const icons = {
        success: '✓',
        error: '✗',
        info: 'ℹ',
        achievement: '🏆'
    };
    
    icon.textContent = icons[type] || icons.info;
    messageEl.textContent = message;
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ============================================
// TIPS SYSTEM
// ============================================

const TIPS = [
    "Start by scanning for numbers that appear frequently in the puzzle.",
    "Look for rows, columns, or boxes with only one empty cell.",
    "Use the process of elimination to narrow down possibilities.",
    "Focus on one number at a time and find all its positions.",
    "Use notes to keep track of possible candidates for each cell.",
    "Look for 'naked pairs' - two cells in a row/column/box with same two candidates.",
    "Check if a number can only go in one place within a box.",
    "Practice regularly to improve pattern recognition.",
    "Take breaks if you get stuck - fresh eyes often spot solutions.",
    "Master easier puzzles before moving to harder difficulties."
];

let currentTipIndex = 0;

function showNextTip() {
    currentTipIndex = (currentTipIndex + 1) % TIPS.length;
    const tipCard = document.querySelector('.tip-card');
    tipCard.style.animation = 'none';
    setTimeout(() => {
        document.querySelector('.tip-text').textContent = TIPS[currentTipIndex];
        tipCard.style.animation = 'slideInRight 0.3s ease-out';
    }, 10);
}

// ============================================
// THEME TOGGLE
// ============================================

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');
    
    if (newTheme === 'dark') {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    } else {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    }
    
    playSound('click');
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
    // Number pad
    document.querySelectorAll('.number-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setNumber(parseInt(btn.dataset.number));
        });
    });
    
    // Action buttons
    document.getElementById('undoBtn').addEventListener('click', undoMove);
    document.getElementById('eraseBtn').addEventListener('click', eraseCell);
    document.getElementById('notesBtn').addEventListener('click', toggleNotes);
    document.getElementById('hintBtn').addEventListener('click', getHint);
    document.getElementById('validateBtn').addEventListener('click', validateSolution);
    document.getElementById('pauseBtn').addEventListener('click', pauseGame);
    
    // Header buttons
    document.getElementById('newGameBtn').addEventListener('click', () => showModal('newGameModal'));
    document.getElementById('statisticsBtn').addEventListener('click', () => showModal('statisticsModal'));
    document.getElementById('achievementsBtn').addEventListener('click', () => showModal('achievementsModal'));
    document.getElementById('settingsBtn').addEventListener('click', () => showModal('settingsModal'));
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Difficulty selection
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const difficulty = btn.dataset.difficulty;
            document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            startNewGame(difficulty);
        });
    });
    
    // New game modal
    document.querySelectorAll('.difficulty-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.difficulty-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
        });
    });
    
    document.getElementById('startNewGameBtn').addEventListener('click', () => {
        const selectedCard = document.querySelector('.difficulty-card.selected');
        const difficulty = selectedCard ? selectedCard.dataset.difficulty : 'easy';
        const mode = document.querySelector('input[name="gameMode"]:checked').value;
        
        hideModal('newGameModal');
        startNewGame(difficulty, mode);
    });
    
    // Modal close buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            hideModal(btn.dataset.modal);
        });
    });
    
    document.querySelectorAll('[data-modal]').forEach(btn => {
        if (!btn.classList.contains('close-modal')) {
            btn.addEventListener('click', () => {
                hideModal(btn.dataset.modal);
            });
        }
    });
    
    // Settings
    document.getElementById('saveSettingsBtn').addEventListener('click', () => {
        Settings.autoCheckErrors = document.getElementById('autoCheckErrors').checked;
        Settings.highlightSame = document.getElementById('highlightSame').checked;
        Settings.highlightArea = document.getElementById('highlightArea').checked;
        Settings.autoRemoveNotes = document.getElementById('autoRemoveNotes').checked;
        Settings.colorScheme = document.getElementById('colorScheme').value;
        Settings.animationsEnabled = document.getElementById('animationsEnabled').checked;
        Settings.showTimer = document.getElementById('showTimer').checked;
        Settings.soundEnabled = document.getElementById('soundEnabled').checked;
        Settings.volume = parseInt(document.getElementById('volumeSlider').value);
        Settings.highContrast = document.getElementById('highContrast').checked;
        Settings.largeNumbers = document.getElementById('largeNumbers').checked;
        
        Settings.save();
        Settings.apply();
        hideModal('settingsModal');
        showNotification('Settings saved!', 'success');
    });
    
    document.getElementById('volumeSlider').addEventListener('input', (e) => {
        document.getElementById('volumeValue').textContent = e.target.value + '%';
    });
    
    // Statistics
    document.getElementById('resetStatsBtn').addEventListener('click', () => {
        Statistics.reset();
    });
    
    // Victory modal
    document.getElementById('playAgainBtn').addEventListener('click', () => {
        hideModal('victoryModal');
        startNewGame();
    });
    
    document.getElementById('shareBtn').addEventListener('click', () => {
        const text = `I completed a ${CONFIG.DIFFICULTY[GameState.difficulty].name} Sudoku in ${formatTime(GameState.elapsedTime)} with a score of ${GameState.score}!`;
        
        if (navigator.share) {
            navigator.share({ text });
        } else {
            navigator.clipboard.writeText(text);
            showNotification('Results copied to clipboard!', 'success');
        }
    });
    
    // Pause modal
    document.getElementById('resumeBtn').addEventListener('click', pauseGame);
    
    // Tips
    document.getElementById('nextTipBtn').addEventListener('click', showNextTip);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (GameState.isPaused || GameState.isGameOver) return;
        
        // Number keys
        if (e.key >= '1' && e.key <= '9') {
            setNumber(parseInt(e.key));
        }
        
        // Delete/Backspace
        if (e.key === 'Delete' || e.key === 'Backspace') {
            eraseCell();
        }
        
        // Arrow keys
        if (GameState.selectedCell) {
            let { row, col } = GameState.selectedCell;
            
            switch (e.key) {
                case 'ArrowUp':
                    if (row > 0) selectCell(row - 1, col);
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                    if (row < 8) selectCell(row + 1, col);
                    e.preventDefault();
                    break;
                case 'ArrowLeft':
                    if (col > 0) selectCell(row, col - 1);
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                    if (col < 8) selectCell(row, col + 1);
                    e.preventDefault();
                    break;
            }
        }
        
        // Shortcuts
        if (e.ctrlKey || e.metaKey) {
            if (e.key === 'z') {
                undoMove();
                e.preventDefault();
            }
        }
        
        if (e.key === 'h' || e.key === 'H') {
            getHint();
        }
        
        if (e.key === 'n' || e.key === 'N') {
            toggleNotes();
        }
        
        if (e.key === 'v' || e.key === 'V') {
            validateSolution();
        }
        
        if (e.key === 'p' || e.key === 'P') {
            pauseGame();
        }
    });
    
    // Close modals on background click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    if (savedTheme === 'dark') {
        document.querySelector('.sun-icon').style.display = 'none';
        document.querySelector('.moon-icon').style.display = 'block';
    }
}

// ============================================
// INITIALIZE
// ============================================

document.addEventListener('DOMContentLoaded', initGame);
