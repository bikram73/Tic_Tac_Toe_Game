import { BoardState, Move, Player, Difficulty } from "../models/GameTypes";
import { WinChecker } from "./WinChecker";

export class AI {
    static getBestMove(
        board: BoardState, 
        difficulty: Difficulty, 
        aiPlayer: Player, 
        winLength: number
    ): Move | null {
        const size = board.length;
        const availableMoves: Move[] = [];

        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                if (board[r][c] === "") {
                    availableMoves.push({ row: r, col: c, player: aiPlayer });
                }
            }
        }

        if (availableMoves.length === 0) return null;

        // Easy: Random
        if (difficulty === 'Easy') {
            return availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }

        const opponent = aiPlayer === 'X' ? 'O' : 'X';

        // Medium: Win or Block
        if (difficulty === 'Medium') {
            // 1. Try to win
            for (const move of availableMoves) {
                board[move.row][move.col] = aiPlayer;
                if (WinChecker.checkWin(board, move.row, move.col, aiPlayer, winLength)) {
                    board[move.row][move.col] = "";
                    return move;
                }
                board[move.row][move.col] = "";
            }

            // 2. Block opponent
            for (const move of availableMoves) {
                board[move.row][move.col] = opponent;
                if (WinChecker.checkWin(board, move.row, move.col, opponent, winLength)) {
                    board[move.row][move.col] = "";
                    return { ...move, player: aiPlayer };
                }
                board[move.row][move.col] = "";
            }

            return availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }

        // Hard: Minimax with Alpha-Beta Pruning and Depth Limiting
        if (difficulty === 'Hard') {
            // Performance optimization: If board is empty or very sparse, pick center or random
            if (availableMoves.length >= size * size - 1) {
                 const center = Math.floor(size / 2);
                 if (board[center][center] === "") return { row: center, col: center, player: aiPlayer };
            }
            
            // Dynamic depth limit based on board size to prevent freezing
            const maxDepth = size > 4 ? 3 : 6; 
            
            let bestScore = -Infinity;
            let bestMove = availableMoves[0];

            for (const move of availableMoves) {
                board[move.row][move.col] = aiPlayer;
                const score = this.minimax(board, 0, false, aiPlayer, opponent, winLength, -Infinity, Infinity, maxDepth, move.row, move.col);
                board[move.row][move.col] = "";

                if (score > bestScore) {
                    bestScore = score;
                    bestMove = move;
                }
            }
            return bestMove;
        }

        return availableMoves[0];
    }

    private static minimax(
        board: BoardState, 
        depth: number, 
        isMaximizing: boolean, 
        aiPlayer: Player, 
        humanPlayer: Player,
        winLength: number,
        alpha: number,
        beta: number,
        maxDepth: number,
        lastRow: number,
        lastCol: number
    ): number {
        // Check terminal states
        const currentPlayer = isMaximizing ? humanPlayer : aiPlayer; // The one who just moved
        if (WinChecker.checkWin(board, lastRow, lastCol, currentPlayer, winLength)) {
            return isMaximizing ? -1000 + depth : 1000 - depth;
        }
        if (depth >= maxDepth || WinChecker.isDraw(board)) {
            return 0; // Heuristic evaluation could be added here for better large board performance
        }

        if (isMaximizing) {
            let maxEval = -Infinity;
            for (let r = 0; r < board.length; r++) {
                for (let c = 0; c < board.length; c++) {
                    if (board[r][c] === "") {
                        board[r][c] = aiPlayer;
                        const evalScore = this.minimax(board, depth + 1, false, aiPlayer, humanPlayer, winLength, alpha, beta, maxDepth, r, c);
                        board[r][c] = "";
                        maxEval = Math.max(maxEval, evalScore);
                        alpha = Math.max(alpha, evalScore);
                        if (beta <= alpha) break;
                    }
                }
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (let r = 0; r < board.length; r++) {
                for (let c = 0; c < board.length; c++) {
                    if (board[r][c] === "") {
                        board[r][c] = humanPlayer;
                        const evalScore = this.minimax(board, depth + 1, true, aiPlayer, humanPlayer, winLength, alpha, beta, maxDepth, r, c);
                        board[r][c] = "";
                        minEval = Math.min(minEval, evalScore);
                        beta = Math.min(beta, evalScore);
                        if (beta <= alpha) break;
                    }
                }
            }
            return minEval;
        }
    }
}
