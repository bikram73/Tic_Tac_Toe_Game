import { BoardState } from "../models/GameTypes";

export class Board {
    static create(size: number): BoardState {
        return Array.from({ length: size }, () => Array(size).fill(""));
    }

    static getWinLength(size: number): number {
        if (size <= 4) return size;
        return 5;
    }

    static isValidMove(board: BoardState, row: number, col: number): boolean {
        return board[row] && board[row][col] === "";
    }
}
