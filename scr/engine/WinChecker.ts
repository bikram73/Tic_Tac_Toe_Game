import { BoardState, Player } from "../models/GameTypes";

export class WinChecker {
    static checkWin(board: BoardState, row: number, col: number, player: Player, winLength: number): boolean {
        const size = board.length;
        const directions = [
            [0, 1],   // Horizontal
            [1, 0],   // Vertical
            [1, 1],   // Diagonal
            [1, -1]   // Anti-diagonal
        ];

        for (const [dr, dc] of directions) {
            let count = 1;

            // Check forward direction
            for (let i = 1; i < winLength; i++) {
                const r = row + dr * i;
                const c = col + dc * i;
                if (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === player) {
                    count++;
                } else {
                    break;
                }
            }

            // Check backward direction
            for (let i = 1; i < winLength; i++) {
                const r = row - dr * i;
                const c = col - dc * i;
                if (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === player) {
                    count++;
                } else {
                    break;
                }
            }

            if (count >= winLength) return true;
        }

        return false;
    }

    static isDraw(board: BoardState): boolean {
        return board.every(row => row.every(cell => cell !== ""));
    }
}
