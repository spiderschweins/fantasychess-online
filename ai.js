class ChessAI {
    constructor(game, depth = 3) {
        this.game = game;
        this.depth = depth;
    }

    async makeMove() {
        const bestMove = await this.findBestMove();
        if (bestMove) {
            this.game.movePiece(bestMove.from, bestMove.to);
        }
    }

    async findBestMove() {
        const color = this.game.currentPlayer;
        let bestScore = color === 'white' ? -Infinity : Infinity;
        let bestMove = null;

        for (let y = 0; y < 6; y++) {
            for (let x = 0; x < 6; x++) {
                const piece = this.game.board[y][x].piece;
                if (piece && piece.color === color) {
                    const moves = piece.getValidMoves(this.game.board, x, y);
                    
                    for (const [toX, toY] of moves) {
                        // Try move
                        const capturedPiece = this.game.board[toY][toX].piece;
                        this.game.board[toY][toX].piece = piece;
                        this.game.board[y][x].piece = null;

                        // Skip if move puts us in check
                        if (!this.game.isInCheck(color)) {
                            const score = this.minimax(this.depth - 1, false, -Infinity, Infinity);
                            
                            if (color === 'white' && score > bestScore) {
                                bestScore = score;
                                bestMove = { from: [x, y], to: [toX, toY] };
                            } else if (color === 'black' && score < bestScore) {
                                bestScore = score;
                                bestMove = { from: [x, y], to: [toX, toY] };
                            }
                        }

                        // Undo move
                        this.game.board[y][x].piece = piece;
                        this.game.board[toY][toX].piece = capturedPiece;
                    }
                }
            }
        }

        return bestMove;
    }

    minimax(depth, isMaximizing, alpha, beta) {
        if (depth === 0) {
            return this.game.evaluatePosition();
        }

        const color = isMaximizing ? 'white' : 'black';
        let bestScore = isMaximizing ? -Infinity : Infinity;

        for (let y = 0; y < 6; y++) {
            for (let x = 0; x < 6; x++) {
                const piece = this.game.board[y][x].piece;
                if (piece && piece.color === color) {
                    const moves = piece.getValidMoves(this.game.board, x, y);
                    
                    for (const [toX, toY] of moves) {
                        // Try move
                        const capturedPiece = this.game.board[toY][toX].piece;
                        this.game.board[toY][toX].piece = piece;
                        this.game.board[y][x].piece = null;

                        // Skip if move puts us in check
                        if (!this.game.isInCheck(color)) {
                            const score = this.minimax(depth - 1, !isMaximizing, alpha, beta);
                            
                            if (isMaximizing) {
                                bestScore = Math.max(score, bestScore);
                                alpha = Math.max(alpha, bestScore);
                            } else {
                                bestScore = Math.min(score, bestScore);
                                beta = Math.min(beta, bestScore);
                            }
                        }

                        // Undo move
                        this.game.board[y][x].piece = piece;
                        this.game.board[toY][toX].piece = capturedPiece;

                        if (beta <= alpha) {
                            break;
                        }
                    }
                }
            }
        }

        return bestScore;
    }
}
