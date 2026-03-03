import { GameState, Player, GameMode, Difficulty } from "../models/GameTypes";
import { Board } from "../engine/Board";
import { WinChecker } from "../engine/WinChecker";
import { AI } from "../engine/AI";
import { Renderer } from "../ui/Renderer";

export class GameController {
    private state: GameState;
    private renderer: Renderer;

    constructor() {
        this.renderer = new Renderer(this);
        // Initial default state
        this.state = this.createInitialState(3, 'PvP', 'Easy');
        this.renderer.renderMenu();
    }

    private createInitialState(size: number, mode: GameMode, difficulty: Difficulty): GameState {
        return {
            board: Board.create(size),
            currentPlayer: 'X',
            boardSize: size,
            winLength: Board.getWinLength(size),
            isGameOver: false,
            winner: null,
            mode: mode,
            difficulty: difficulty
        };
    }

    public startGame(size: number, mode: GameMode, difficulty: Difficulty) {
        this.state = this.createInitialState(size, mode, difficulty);
        this.renderer.renderGame(this.state);
    }

    public resetGame() {
        this.startGame(this.state.boardSize, this.state.mode, this.state.difficulty);
    }

    public returnToMenu() {
        this.renderer.renderMenu();
    }

    public async handleMove(row: number, col: number) {
        if (this.state.isGameOver || !Board.isValidMove(this.state.board, row, col)) return;

        // Player Move
        this.executeMove(row, col);

        // AI Turn
        if (!this.state.isGameOver && this.state.mode === 'PvAI' && this.state.currentPlayer === 'O') {
            // Small delay for realism
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const aiMove = AI.getBestMove(
                this.state.board, 
                this.state.difficulty, 
                'O', 
                this.state.winLength
            );

            if (aiMove) {
                this.executeMove(aiMove.row, aiMove.col);
            }
        }
    }

    private executeMove(row: number, col: number) {
        const player = this.state.currentPlayer;
        this.state.board[row][col] = player;
        
        // Check Win
        if (WinChecker.checkWin(this.state.board, row, col, player, this.state.winLength)) {
            this.state.isGameOver = true;
            this.state.winner = player;
        } 
        // Check Draw
        else if (WinChecker.isDraw(this.state.board)) {
            this.state.isGameOver = true;
            this.state.winner = 'Draw';
        } 
        // Switch Turn
        else {
            this.state.currentPlayer = player === 'X' ? 'O' : 'X';
        }

        this.renderer.updateBoard(this.state);

        if (this.state.isGameOver) {
            this.renderer.showResult(this.state.winner!);
        }
    }
}
