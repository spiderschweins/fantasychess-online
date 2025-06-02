let game;

window.addEventListener('load', () => {
    initGame();
    setupEventListeners();
});

function initGame(playerColor = 'white', aiDifficulty = 2) {
    game = new ChessGame(playerColor, aiDifficulty);
    if (playerColor === 'black') {
        // If player is black, make AI's first move
        setTimeout(() => game.ai.makeMove(), 5000);
    }
}

function setupEventListeners() {
    // Settings controls
    document.getElementById('showSettings').addEventListener('click', () => {
        document.getElementById('gameSettings').style.display = 'block';
    });

    document.getElementById('startGame').addEventListener('click', () => {
        const playerColor = document.getElementById('playerColor').value;
        const aiDifficulty = parseInt(document.getElementById('aiDifficulty').value);
        document.getElementById('gameSettings').style.display = 'none';
        initGame(playerColor, aiDifficulty);
    });

    document.getElementById('cancelSettings').addEventListener('click', () => {
        document.getElementById('gameSettings').style.display = 'none';
    });

    // Rules controls
    document.getElementById('rules').addEventListener('click', () => {
        toggleRules(true);
    });

    document.getElementById('closeRules').addEventListener('click', () => {
        toggleRules(false);
    });

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            toggleRules(false);
        } else if (e.key.toLowerCase() === 'r') {
            initGame();
        } else if (e.key.toLowerCase() === 'q') {
            if (confirm('Are you sure you want to quit?')) {
                window.close();
            }
        }
    });
}

function toggleRules(show) {
    document.getElementById('rulesText').style.display = show ? 'block' : 'none';
    document.getElementById('board').style.display = show ? 'none' : 'grid';
    document.getElementById('status').style.display = show ? 'none' : 'block';
    document.getElementById('captured').style.display = show ? 'none' : 'block';
    document.getElementById('moveHistory').style.display = show ? 'none' : 'block';
    
    // If hiding rules, make sure to re-render the board
    if (!show) {
        game.renderBoard();
    }
}
