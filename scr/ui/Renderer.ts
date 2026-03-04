import { GameController } from "../controllers/GameController";
import { GameState, Player } from "../models/GameTypes";

export class Renderer {
    private app: HTMLElement;
    private controller: GameController;

    constructor(controller: GameController) {
        this.app = document.getElementById('app')!;
        this.controller = controller;
    }

    public renderMenu() {
        this.app.innerHTML = `
            <div class="glass-panel p-8 w-full max-w-md text-center space-y-6 animate-pop-in">
                <h1 class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-game-accent to-purple-500">
                    TIC TAC TOE
                </h1>
                <p class="text-slate-400">Advanced Multi-Board Edition</p>
                
                <div class="space-y-4 text-left">
                    <div>
                        <label class="block text-sm font-bold mb-2 text-slate-300">Board Size</label>
                        <select id="size-select" class="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white focus:ring-2 focus:ring-game-accent outline-none">
                            ${Array.from({length: 8}, (_, i) => i + 3).map(n => 
                                `<option value="${n}">${n}x${n} ${n >= 6 ? '(Advanced)' : ''}</option>`
                            ).join('')}
                        </select>
                    </div>

                    <div>
                        <label class="block text-sm font-bold mb-2 text-slate-300">Game Mode</label>
                        <div class="flex gap-2">
                            <button type="button" id="mode-pvp" class="flex-1 py-2 rounded bg-game-accent text-game-dark font-bold ring-2 ring-game-accent transition-all">PvP</button>
                            <button type="button" id="mode-pvai" class="flex-1 py-2 rounded bg-slate-700 text-slate-300 font-bold hover:bg-slate-600 transition-all">PvAI</button>
                        </div>
                    </div>

                    <div id="difficulty-section" class="hidden">
                        <label class="block text-sm font-bold mb-2 text-slate-300">AI Difficulty</label>
                        <select id="difficulty-select" class="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white focus:ring-2 focus:ring-game-accent outline-none">
                            <option value="Easy">Easy (Random)</option>
                            <option value="Medium">Medium (Smart)</option>
                            <option value="Hard">Hard (Minimax)</option>
                        </select>
                    </div>
                </div>

                <button id="start-btn" class="btn-primary w-full text-lg mt-4">Start Game</button>
            </div>
        `;

        this.attachMenuListeners();
    }

    private attachMenuListeners() {
        let selectedMode: 'PvP' | 'PvAI' = 'PvP';
        const pvpBtn = document.getElementById('mode-pvp')!;
        const pvaiBtn = document.getElementById('mode-pvai')!;
        const diffSection = document.getElementById('difficulty-section')!;

        const updateModeUI = (mode: 'PvP' | 'PvAI') => {
            selectedMode = mode;
            if (mode === 'PvP') {
                pvpBtn.className = "flex-1 py-2 rounded bg-game-accent text-game-dark font-bold ring-2 ring-game-accent transition-all";
                pvaiBtn.className = "flex-1 py-2 rounded bg-slate-700 text-slate-300 font-bold hover:bg-slate-600 transition-all";
                diffSection.classList.add('hidden');
            } else {
                pvaiBtn.className = "flex-1 py-2 rounded bg-game-accent text-game-dark font-bold ring-2 ring-game-accent transition-all";
                pvpBtn.className = "flex-1 py-2 rounded bg-slate-700 text-slate-300 font-bold hover:bg-slate-600 transition-all";
                diffSection.classList.remove('hidden');
            }
        };

        pvpBtn.addEventListener('click', () => updateModeUI('PvP'));
        pvaiBtn.addEventListener('click', () => updateModeUI('PvAI'));

        document.getElementById('start-btn')!.addEventListener('click', () => {
            const size = parseInt((document.getElementById('size-select') as HTMLSelectElement).value);
            const difficulty = (document.getElementById('difficulty-select') as HTMLSelectElement).value as any;
            this.controller.startGame(size, selectedMode, difficulty);
        });
    }

    public renderGame(state: GameState) {
        this.app.innerHTML = `
            <div class="w-full max-w-2xl flex flex-col items-center gap-6 animate-pop-in">
                <div class="flex justify-between items-center w-full glass-panel p-4">
                    <button id="back-btn" class="text-slate-400 hover:text-white transition-colors">← Menu</button>
                    <div class="text-xl font-bold">
                        <span class="${state.currentPlayer === 'X' ? 'text-game-x' : 'text-slate-500'}">X</span>
                        <span class="mx-2 text-slate-600">vs</span>
                        <span class="${state.currentPlayer === 'O' ? 'text-game-o' : 'text-slate-500'}">O</span>
                    </div>
                    <button id="reset-btn" class="text-game-accent hover:text-sky-300 transition-colors">Reset ⟳</button>
                </div>

                <div id="game-board" class="glass-panel p-4 grid gap-2 mx-auto shadow-2xl" 
                     style="grid-template-columns: repeat(${state.boardSize}, minmax(0, 1fr)); aspect-ratio: 1/1; width: min(80vh, 100%);">
                    <!-- Cells injected here -->
                </div>

                <div class="text-slate-400 text-sm">
                    Win Condition: <span class="text-white font-bold">${state.winLength}</span> in a row
                </div>
            </div>

            <!-- Result Modal -->
            <div id="result-modal" class="fixed inset-0 bg-black/80 backdrop-blur-sm hidden flex items-center justify-center z-50">
                <div class="glass-panel p-8 text-center space-y-6 max-w-sm w-full mx-4 transform scale-90 transition-all" id="result-content">
                    <h2 id="result-title" class="text-4xl font-black text-white"></h2>
                    <div class="flex gap-4 justify-center">
                        <button id="modal-reset" class="btn-primary">Play Again</button>
                        <button id="modal-menu" class="btn-secondary">Menu</button>
                    </div>
                </div>
            </div>
        `;

        this.updateBoard(state);

        document.getElementById('back-btn')!.onclick = () => this.controller.returnToMenu();
        document.getElementById('reset-btn')!.onclick = () => this.controller.resetGame();
        document.getElementById('modal-reset')!.onclick = () => {
            document.getElementById('result-modal')!.classList.add('hidden');
            this.controller.resetGame();
        };
        document.getElementById('modal-menu')!.onclick = () => {
            document.getElementById('result-modal')!.classList.add('hidden');
            this.controller.returnToMenu();
        };
    }

    public updateBoard(state: GameState) {
        const boardEl = document.getElementById('game-board');
        if (!boardEl) return;

        boardEl.innerHTML = '';
        state.board.forEach((row, r) => {
            row.forEach((cell, c) => {
                const cellEl = document.createElement('div');
                cellEl.className = `cell bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors ${cell === 'X' ? 'text-game-x' : cell === 'O' ? 'text-game-o' : ''}`;
                cellEl.textContent = cell;
                cellEl.onclick = () => this.controller.handleMove(r, c);
                
                // Dynamic font size based on board size
                const fontSize = state.boardSize > 6 ? 'text-xl' : state.boardSize > 4 ? 'text-2xl' : 'text-4xl';
                cellEl.classList.add(fontSize);
                
                boardEl.appendChild(cellEl);
            });
        });
    }

    public showResult(winner: Player | 'Draw') {
        const modal = document.getElementById('result-modal')!;
        const title = document.getElementById('result-title')!;
        modal.classList.remove('hidden');
        title.textContent = winner === 'Draw' ? "It's a Draw!" : `${winner} Wins!`;
        title.className = `text-4xl font-black ${winner === 'X' ? 'text-game-x' : winner === 'O' ? 'text-game-o' : 'text-white'}`;
    }
}
