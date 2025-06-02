class Piece {
    constructor(color) {
        this.color = color;
        this.hasMoved = false;
        this.type = ''; // This will be set by child classes
    }

    isInBounds(x, y) {
        return x >= 0 && x < 6 && y >= 0 && y < 6;
    }
    
    get symbol() {
        return this.color === 'white' ? this.type : this.type.toLowerCase();
    }
}

class Pawn extends Piece {
    constructor(color) {
        super(color);
        this.type = 'P';
    }

    getValidMoves(board, x, y) {
        const moves = [];
        const dir = this.color === 'white' ? -1 : 1;

        // Forward move
        const ny = y + dir;
        if (this.isInBounds(x, ny) && !board[ny][x].piece) {
            moves.push([x, ny]);
        }

        // Captures
        for (let dx of [-1, 1]) {
            const nx = x + dx;
            const ny = y + dir;
            if (this.isInBounds(nx, ny)) {
                const targetPiece = board[ny][nx].piece;
                if (targetPiece && targetPiece.color !== this.color) {
                    moves.push([nx, ny]);
                }
            }
        }
        return moves;
    }
}

class Knight extends Piece {
    constructor(color) {
        super(color);
        this.type = 'N';
    }

    getValidMoves(board, x, y) {
        const moves = [];
        const knightMoves = [
            [-2,-1], [-2,1], [2,-1], [2,1],
            [-1,-2], [-1,2], [1,-2], [1,2]
        ];

        for (let [dx, dy] of knightMoves) {
            const nx = x + dx;
            const ny = y + dy;
            if (this.isInBounds(nx, ny)) {
                if (!board[ny][nx].piece || board[ny][nx].piece.color !== this.color) {
                    moves.push([nx, ny]);
                }
            }
        }
        return moves;
    }
}

class Bishop extends Piece {
    constructor(color) {
        super(color);
        this.type = 'B';
    }

    getValidMoves(board, x, y) {
        const moves = [];
        const directions = [[1,1], [1,-1], [-1,1], [-1,-1]];

        for (let [dx, dy] of directions) {
            let newX = x + dx;
            let newY = y + dy;
            while (newX >= 0 && newX < 6 && newY >= 0 && newY < 6) {
                if (board[newY][newX].piece === null) {
                    moves.push([newX, newY]);
                } else if (board[newY][newX].piece.color !== this.color) {
                    moves.push([newX, newY]);
                    break;
                } else {
                    break;
                }
                newX += dx;
                newY += dy;
            }
        }

        return moves;
    }
}

class Rook extends Piece {
    constructor(color) {
        super(color);
        this.type = 'R';
    }

    getValidMoves(board, x, y) {
        const moves = [];
        const directions = [[0,1], [1,0], [0,-1], [-1,0]];

        for (let [dx, dy] of directions) {
            let newX = x + dx;
            let newY = y + dy;
            while (newX >= 0 && newX < 6 && newY >= 0 && newY < 6) {
                if (board[newY][newX].piece === null) {
                    moves.push([newX, newY]);
                } else if (board[newY][newX].piece.color !== this.color) {
                    moves.push([newX, newY]);
                    break;
                } else {
                    break;
                }
                newX += dx;
                newY += dy;
            }
        }

        return moves;
    }
}

class Queen extends Piece {
    constructor(color) {
        super(color);
        this.type = 'Q';
    }

    getValidMoves(board, x, y) {
        const moves = [];
        const directions = [
            [0,1], [1,0], [0,-1], [-1,0],
            [1,1], [1,-1], [-1,1], [-1,-1]
        ];

        for (let [dx, dy] of directions) {
            let newX = x + dx;
            let newY = y + dy;
            while (newX >= 0 && newX < 6 && newY >= 0 && newY < 6) {
                if (board[newY][newX].piece === null) {
                    moves.push([newX, newY]);
                } else if (board[newY][newX].piece.color !== this.color) {
                    moves.push([newX, newY]);
                    break;
                } else {
                    break;
                }
                newX += dx;
                newY += dy;
            }
        }

        return moves;
    }
}

class King extends Piece {
    constructor(color) {
        super(color);
        this.type = 'K';
    }

    getValidMoves(board, x, y) {
        const moves = [];
        const directions = [
            [0,1], [1,0], [0,-1], [-1,0],
            [1,1], [1,-1], [-1,1], [-1,-1]
        ];

        for (let [dx, dy] of directions) {
            const newX = x + dx;
            const newY = y + dy;
            if (newX >= 0 && newX < 6 && newY >= 0 && newY < 6) {
                if (board[newY][newX].piece === null || 
                    board[newY][newX].piece.color !== this.color) {
                    moves.push([newX, newY]);
                }
            }
        }

        return moves;
    }
}

class Hawk extends Piece {
    constructor(color) {
        super(color);
        this.type = 'H';
    }

    getValidMoves(board, x, y) {
        const moves = [];
        const directions = [
            [0,1], [1,0], [0,-1], [-1,0],
            [1,1], [1,-1], [-1,1], [-1,-1]
        ];

        for (let [dx, dy] of directions) {
            for (let dist = 2; dist < 6; dist++) { // minimum radius is 2
                const nx = x + dx * dist;
                const ny = y + dy * dist;
                
                // Skip if target is out of bounds
                if (!this.isInBounds(nx, ny)) continue;
                
                // Skip if target square has a friendly piece
                if (board[ny][nx].piece && board[ny][nx].piece.color === this.color) {
                    continue;
                }

                let piecesInBetween = 0;
                let lastPiecePos = null;
                let blocked = false;

                // Check pieces in between
                for (let step = 1; step < dist; step++) {
                    const tx = x + dx * step;
                    const ty = y + dy * step;
                    if (board[ty][tx].piece) {
                        piecesInBetween++;
                        if (piecesInBetween > 1) {
                            blocked = true;
                            break;
                        }
                        lastPiecePos = [tx, ty];
                    }
                }

                // Valid move if no pieces in between
                if (!blocked && piecesInBetween === 0) {
                    moves.push([nx, ny]);
                }
                // Or if jumping over exactly one piece
                else if (!blocked && piecesInBetween === 1) {
                    // Only add if not landing on the jumped piece
                    if (!lastPiecePos || (nx !== lastPiecePos[0] || ny !== lastPiecePos[1])) {
                        moves.push([nx, ny]);
                    }
                }
            }
        }
        return moves;
    }
}

class ColorSwitcherBishop extends Piece {
    constructor(color) {
        super(color);
        this.type = 'C';
    }

    getBishopMoves(board, x, y) {
        const moves = [];
        const directions = [[1,1], [1,-1], [-1,1], [-1,-1]];
        
        for (let [dx, dy] of directions) {
            let newX = x + dx;
            let newY = y + dy;
            while (this.isInBounds(newX, newY)) {
                if (!board[newY][newX].piece) {
                    moves.push([newX, newY]);
                } else if (board[newY][newX].piece.color !== this.color) {
                    moves.push([newX, newY]);
                    break;
                } else {
                    break;
                }
                newX += dx;
                newY += dy;
            }
        }
        return moves;
    }

    getKingMoves(board, x, y) {
        const moves = [];
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) continue;
                const nx = x + dx;
                const ny = y + dy;
                if (this.isInBounds(nx, ny)) {
                    if (!board[ny][nx].piece || board[ny][nx].piece.color !== this.color) {
                        moves.push([nx, ny]);
                    }
                }
            }
        }
        return moves;
    }

    getValidMoves(board, x, y) {
        // Combines bishop and king moves
        return [...this.getBishopMoves(board, x, y), ...this.getKingMoves(board, x, y)];
    }
}
