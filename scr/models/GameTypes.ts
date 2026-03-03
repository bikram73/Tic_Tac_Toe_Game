export type Player = 'X' | 'O';
export type CellValue = Player | '';
export type BoardState = CellValue[][];
export type GameMode = 'PvP' | 'PvAI';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Move {
    row: number;
    col: number;
    player: Player;
}

export interface GameState {
    board: BoardState;
    currentPlayer: Player;
    boardSize: number;
    winLength: number;
    isGameOver: boolean;
    winner: Player | 'Draw' | null;
    mode: GameMode;
    difficulty: Difficulty;
}
