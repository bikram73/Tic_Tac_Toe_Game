import { BoardState, Player, Move } from "../models/GameTypes";

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

    static getWinningLine(board: BoardState, winLength: number): Move[] | null {
        const size = board.length;
        const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];

        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                const player = board[r][c];
                if (player === "") continue;

                for (const [dr, dc] of directions) {
                    const endR = r + dr * (winLength - 1);
                    const endC = c + dc * (winLength - 1);
                    
                    if (endR < 0 || endR >= size || endC < 0 || endC >= size) continue;

                    let line: Move[] = [];
                    for (let i = 0; i < winLength; i++) {
                        if (board[r + dr * i][c + dc * i] !== player) break;
                        line.push({ row: r + dr * i, col: c + dc * i, player: player as Player });
                    }

                    if (line.length === winLength) return line;
                }
            }
        }
        return null;
    }

    static isDraw(board: BoardState): boolean {
        return board.every(row => row.every(cell => cell !== ""));
    }
}
