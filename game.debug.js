// Debug version of game.js
class ChessGame {
    constructor(playerColor = 'white', aiDifficulty = 2) {
        console.log(`Initializing game - Player: ${playerColor}, AI Difficulty: ${aiDifficulty}`);
        this.board = this.createBoard();
        this.currentPlayer = 'white';
        this.selectedSquare = null;
        this.validMoves = [];
        this.capturedPieces = { white: [], black: [] };
        this.playerColor = playerColor;
        this.ai = new ChessAI(this, aiDifficulty);
        this.gameActive = true;
        this.moveHistory = [];
        this.moveNumber = 1;
        this.initializeBoard();
    }

    // Rest of the methods with debug logging...
    evaluatePosition() {
        let score = 0;
        for (let y = 0; y < 6; y++) {
            for (let x = 0; x < 6; x++) {
                const piece = this.board[y][x].piece;
                if (!piece) continue;

                const value = this.pieceValues[piece.type];
                const centerBonus = (x >= 1 && x <= 4 && y >= 1 && y <= 4) ? 0.2 : 0;
                
                let pawnAdvancement = 0;
                if (piece instanceof Pawn) {
                    pawnAdvancement = piece.color === 'white' ? 
                        (6 - 2 - y) * 0.1 : 
                        (y - 1) * 0.1;
                }

                if (piece.color === 'white') {
                    score += value + centerBonus + pawnAdvancement;
                } else {
                    score -= value + centerBonus + pawnAdvancement;
                }
            }
        }
        console.log(`Position evaluation: ${score}`);
        return score;
    }

    movePiece(from, to) {
        console.log(`Moving piece from [${from}] to [${to}]`);
        const [fromX, fromY] = from;
        const [toX, toY] = to;
        
        if (!this.gameActive) {
            console.log('Game is not active, ignoring move');
            return;
        }

        const piece = this.board[fromY][fromX].piece;
        const isCapture = this.board[toY][toX].piece !== null;
        
        if (isCapture) {
            const capturedPiece = this.board[toY][toX].piece;
            this.capturedPieces[capturedPiece.color].push(capturedPiece.symbol);
            console.log(`Capture! ${capturedPiece.color} ${capturedPiece.type}`);
        }

        // Record the move
        this.addMoveToHistory(from, to, piece, isCapture);

        this.board[toY][toX].piece = piece;
        this.board[fromY][fromX].piece = null;
        piece.hasMoved = true;

        // Check for pawn promotion
        if (piece instanceof Pawn) {
            if ((piece.color === 'white' && toY === 0) || (piece.color === 'black' && toY === 5)) {
                console.log('Pawn promotion!');
                this.board[toY][toX].piece = new Queen(piece.color);
            }
        }
        
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
          // Check status
        const inCheck = this.isInCheck(this.currentPlayer);
        const hasMoves = this.hasLegalMoves(this.currentPlayer);
        if (!hasMoves && inCheck) {
            console.log('Checkmate!');
            document.getElementById('status').textContent = 
                `Checkmate! ${this.currentPlayer === 'white' ? 'Black' : 'White'} wins!`;
            this.gameActive = false;
        } else if (!hasMoves && !inCheck) {
            console.log('Stalemate!');
            document.getElementById('status').textContent = 'Stalemate!';
            this.gameActive = false;
        } else if (inCheck) {
            console.log('Check!');
            document.getElementById('status').textContent = 
                `${this.currentPlayer}'s turn - CHECK!`;
        } else {
            document.getElementById('status').textContent = 
                `${this.currentPlayer}'s turn`;
        }
        
        this.renderBoard();
    }
}
