class ChessGame {
    constructor(playerColor = 'white', aiDifficulty = 2) {
        this.board = this.createBoard();
        this.currentPlayer = 'white';
        this.selectedSquare = null;
        this.validMoves = [];
        this.capturedPieces = { white: [], black: [] };
        this.pieceValues = {
            'K': 100,
            'Q': 8,
            'H': 9,
            'C': 4,
            'B': 2,
            'N': 3,
            'P': 1
        };
        
        // Setup sounds
        this.moveSound = new Audio('move.wav');
        this.captureSound = new Audio('capture.wav');
        this.checkSound = new Audio('check.wav');
        
        this.moveHistory = [];
        this.moveNumber = 1;
        
        this.playerColor = playerColor;
        this.ai = new ChessAI(this, aiDifficulty);
        this.gameActive = true;
        
        this.initializeBoard();
    }

    createBoard() {
        const board = [];
        for (let i = 0; i < 6; i++) {
            board[i] = [];
            for (let j = 0; j < 6; j++) {
                board[i][j] = { piece: null };
            }
        }
        return board;
    }    initializeBoard() {
        // Setup black pieces (Q K H C B N)
        this.board[0][0].piece = new Queen('black');
        this.board[0][1].piece = new King('black');
        this.board[0][2].piece = new Hawk('black');
        this.board[0][3].piece = new ColorSwitcherBishop('black');
        this.board[0][4].piece = new Bishop('black');
        this.board[0][5].piece = new Knight('black');

        // Setup black pawns
        for (let i = 0; i < 6; i++) {
            this.board[1][i].piece = new Pawn('black');
        }

        // Setup white pawns
        for (let i = 0; i < 6; i++) {
            this.board[4][i].piece = new Pawn('white');
        }

        // Setup white pieces (Q K H C B N)
        this.board[5][0].piece = new Queen('white');
        this.board[5][1].piece = new King('white');
        this.board[5][2].piece = new Hawk('white');
        this.board[5][3].piece = new ColorSwitcherBishop('white');
        this.board[5][4].piece = new Bishop('white');
        this.board[5][5].piece = new Knight('white');

        this.renderBoard();
    }

    renderBoard() {
        const boardElement = document.getElementById('board');
        boardElement.innerHTML = '';
        
        for (let y = 0; y < 6; y++) {
            for (let x = 0; x < 6; x++) {
                const square = document.createElement('div');
                square.className = `square ${(x + y) % 2 === 0 ? 'white' : 'black'}`;
                
                if (this.board[y][x].piece) {
                    square.textContent = this.board[y][x].piece.symbol;
                }
                
                square.addEventListener('click', () => this.handleSquareClick(x, y));
                boardElement.appendChild(square);
            }
        }

        this.updateCapturedPieces();
    }    async handleSquareClick(x, y) {
        if (!this.gameActive || this.currentPlayer !== this.playerColor) return;

        const square = this.board[y][x];
        
        if (this.selectedSquare) {
            if (this.validMoves.some(([mx, my]) => mx === x && my === y)) {
                const [fromX, fromY] = this.selectedSquare;
                const piece = this.board[fromY][fromX].piece;
                
                // Try the move
                const capturedPiece = this.board[y][x].piece;
                this.board[y][x].piece = piece;
                this.board[fromY][fromX].piece = null;
                
                // Check if move puts/leaves us in check
                const inCheck = this.isInCheck(piece.color);
                
                // Undo the move
                this.board[fromY][fromX].piece = piece;
                this.board[y][x].piece = capturedPiece;
                
                if (!inCheck) {
                    this.movePiece(this.selectedSquare, [x, y]);
                    // After player's move, make AI move
                    if (this.gameActive && this.currentPlayer !== this.playerColor) {
                        await this.ai.makeMove();
                    }
                } else {
                    document.getElementById('status').textContent = 'Invalid move: King is in check!';
                }
            }
            this.clearSelection();
        } else if (square.piece && square.piece.color === this.currentPlayer) {
            this.selectedSquare = [x, y];
            this.validMoves = square.piece.getValidMoves(this.board, x, y);
            // Filter out moves that would put/leave us in check
            this.validMoves = this.validMoves.filter(([mx, my]) => {
                const piece = square.piece;
                const capturedPiece = this.board[my][mx].piece;
                this.board[my][mx].piece = piece;
                this.board[y][x].piece = null;
                const inCheck = this.isInCheck(piece.color);
                this.board[y][x].piece = piece;
                this.board[my][mx].piece = capturedPiece;
                return !inCheck;
            });
            this.highlightMoves();
        }
    }

    movePiece(from, to) {
        const [fromX, fromY] = from;
        const [toX, toY] = to;
        const piece = this.board[fromY][fromX].piece;
        const isCapture = this.board[toY][toX].piece !== null;
        
        // Handle captures
        if (isCapture) {
            const capturedPiece = this.board[toY][toX].piece;
            this.capturedPieces[capturedPiece.color].push(capturedPiece.symbol);
            this.playSound('capture');
        } else {
            this.playSound('move');
        }

        // Record the move
        this.addMoveToHistory(from, to, piece, isCapture);

        this.board[toY][toX].piece = piece;
        this.board[fromY][fromX].piece = null;
        piece.hasMoved = true;

        // Pawn promotion
        if (piece instanceof Pawn) {
            if ((piece.color === 'white' && toY === 0) || (piece.color === 'black' && toY === 5)) {
                this.board[toY][toX].piece = new Queen(piece.color);
            }
        }
        
        // Switch player
        const opponent = this.currentPlayer;
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        
        // Check game status after move
        if (!this.gameActive) return;
        
        // Check if the opponent is in check
        const opponentInCheck = this.isInCheck(opponent);
        
        const opponentHasMoves = this.hasLegalMoves(opponent);
        
        if (opponentInCheck) {
            if (!opponentHasMoves) {
                // Checkmate - current player wins
                document.getElementById('status').textContent = `Checkmate! ${this.currentPlayer === 'white' ? 'Black' : 'White'} wins!`;
                this.gameActive = false;
                this.playSound('check');
                return;
            } else {
                // Just a check
                document.getElementById('status').textContent = `${opponent}'s king is in check!`;
                this.playSound('check');
            }
        } else if (!opponentHasMoves) {
            // Stalemate - no legal moves but not in check
            document.getElementById('status').textContent = 'Stalemate! Game drawn.';
            this.gameActive = false;
        } else {
            // Normal move
            document.getElementById('status').textContent = `${this.currentPlayer}'s turn`;
        }
        
        this.renderBoard();
    }

    clearSelection() {
        this.selectedSquare = null;
        this.validMoves = [];
        this.renderBoard();
    }

    highlightMoves() {
        const squares = document.querySelectorAll('.square');
        const [selectedX, selectedY] = this.selectedSquare;
        squares[selectedY * 6 + selectedX].classList.add('selected');
        
        this.validMoves.forEach(([x, y]) => {
            squares[y * 6 + x].classList.add('valid-move');
        });
    }

    updateCapturedPieces() {
        const capturedElement = document.getElementById('captured');
        capturedElement.innerHTML = `
            <div>Captured by White: ${this.capturedPieces.white.join(' ')}</div>
            <div>Captured by Black: ${this.capturedPieces.black.join(' ')}</div>
        `;
    }

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
        return score;
    }

    isInCheck(color) {
        // Find the king's position
        let kingX = -1, kingY = -1;
        for (let y = 0; y < 6; y++) {
            for (let x = 0; x < 6; x++) {
                const piece = this.board[y][x].piece;
                if (piece instanceof King && piece.color === color) {
                    kingX = x;
                    kingY = y;
                    break;
                }
            }
            if (kingX !== -1) break;
        }
        
        if (kingX === -1) return false; // No king found (shouldn't happen in a valid game)

        
        const opponentColor = color === 'white' ? 'black' : 'white';
        
        // Check for attacking pieces
        for (let y = 0; y < 6; y++) {
            for (let x = 0; x < 6; x++) {
                const piece = this.board[y][x].piece;
                if (piece && piece.color === opponentColor) {
                    // For each piece, get its valid moves
                    const moves = piece.getValidMoves(this.board, x, y);
                    // Check if any move can capture the king
                    if (moves.some(([mx, my]) => mx === kingX && my === kingY)) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }

    hasLegalMoves(color) {
        // Check all pieces of the current color
        for (let y = 0; y < 6; y++) {
            for (let x = 0; x < 6; x++) {
                const piece = this.board[y][x].piece;
                if (piece && piece.color === color) {
                    // Get all possible moves for this piece
                    const moves = piece.getValidMoves(this.board, x, y);
                    
                    // Check each move to see if it's legal
                    for (const [nx, ny] of moves) {
                        // Skip if trying to capture own piece
                        const targetPiece = this.board[ny][nx].piece;
                        if (targetPiece && targetPiece.color === color) {
                            continue;
                        }
                        
                        // Save the current state
                        const originalPiece = targetPiece;
                        
                        // Make the move
                        this.board[ny][nx].piece = piece;
                        this.board[y][x].piece = null;
                        
                        // Check if the king is in check after the move
                        const stillInCheck = this.isInCheck(color);
                        
                        // Undo the move
                        this.board[y][x].piece = piece;
                        this.board[ny][nx].piece = originalPiece;
                        
                        // If this move doesn't leave us in check, it's a legal move
                        if (!stillInCheck) {
                            return true;
                        }
                    }
                }
            }
        }
        
        // No legal moves found
        return false;
    }

    playSound(soundType) {
        try {
            switch(soundType) {
                case 'move':
                    this.moveSound.play();
                    break;
                case 'capture':
                    this.captureSound.play();
                    break;
                case 'check':
                    this.checkSound.play();
                    break;
            }
        } catch (e) {
            console.log('Sound not available:', e);
        }
    }

    addMoveToHistory(from, to, piece, capture) {
        const [fromX, fromY] = from;
        const [toX, toY] = to;
        const fromSquare = String.fromCharCode(97 + fromX) + (6 - fromY);
        const toSquare = String.fromCharCode(97 + toX) + (6 - toY);
        
        const move = {
            number: Math.ceil(this.moveHistory.length / 2) + 1,
            color: piece.color,
            piece: piece.type,
            from: fromSquare,
            to: toSquare,
            capture: capture
        };

        this.moveHistory.push(move);
        this.updateMoveHistory();
    }

    updateMoveHistory() {
        const movesDiv = document.getElementById('moves');
        movesDiv.innerHTML = '';
        
        for (let i = 0; i < this.moveHistory.length; i += 2) {
            const moveNumber = Math.ceil((i + 1) / 2);
            const whiteMove = this.moveHistory[i];
            const blackMove = this.moveHistory[i + 1];
            
            const entry = document.createElement('div');
            entry.className = 'moveEntry';
            
            const numberSpan = document.createElement('span');
            numberSpan.className = 'moveNumber';
            numberSpan.textContent = moveNumber + '.';
            
            const movesSpan = document.createElement('span');
            movesSpan.textContent = `${whiteMove.piece}${whiteMove.capture ? 'x' : ''}${whiteMove.to} ${
                blackMove ? blackMove.piece + (blackMove.capture ? 'x' : '') + blackMove.to : ''
            }`;
            
            entry.appendChild(numberSpan);
            entry.appendChild(movesSpan);
            movesDiv.appendChild(entry);
        }
        
        movesDiv.scrollTop = movesDiv.scrollHeight;
    }
}
