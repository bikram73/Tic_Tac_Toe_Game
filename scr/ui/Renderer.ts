import { GameController } from "../controllers/GameController";
import { GameState, Player, Move } from "../models/GameTypes";
import { WinChecker } from "../engine/WinChecker";

export class Renderer {
    private app: HTMLElement;
    private controller: GameController;
    private lastPlayer: Player | null = null;
    private audioContext: AudioContext | null = null;

    constructor(controller: GameController) {
        this.app = document.getElementById('app')!;
        this.controller = controller;
        this.injectStyles();
    }

    private injectStyles() {
        if (document.getElementById('game-styles')) return;
        const style = document.createElement('style');
        style.id = 'game-styles';
        style.textContent = `
            .winning-line {
                stroke-dasharray: 1;
                stroke-dashoffset: 1;
                animation: drawLine 0.5s ease-out forwards;
            }
            @keyframes drawLine {
                to { stroke-dashoffset: 0; }
            }
            .winning-cell {
                animation: glow 1s ease-in-out infinite alternate;
                background-color: rgba(59, 130, 246, 0.1) !important;
            }
            @keyframes glow {
                from { box-shadow: 0 0 5px #3b82f6, inset 0 0 5px #3b82f6; }
                to { box-shadow: 0 0 20px #3b82f6, inset 0 0 10px #3b82f6; }
            }
        `;
        document.head.appendChild(style);
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
                        <span class="text-red-500">X</span>
                        <span class="mx-2 text-slate-600">vs</span>
                        <span class="text-green-500">O</span>
                    </div>
                    <button id="reset-btn" class="text-game-accent hover:text-sky-300 transition-colors">Reset ⟳</button>
                </div>

                <div id="turn-indicator" class="text-xl font-bold text-slate-300"></div>

                <div id="game-board" class="glass-panel p-4 grid gap-2 mx-auto shadow-2xl relative" 
                     style="grid-template-columns: repeat(${state.boardSize}, minmax(0, 1fr)); aspect-ratio: 1/1; width: min(80vh, 100%);">
                    <!-- Cells injected here -->
                </div>

                <div class="flex flex-col items-center gap-2">
                    <div class="text-slate-400 text-sm">
                        Win Condition: <span class="text-white font-bold">${state.winLength}</span> in a row
                    </div>
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

        let winningLine: Move[] | null = null;
        if (state.winner && state.winner !== 'Draw') {
            winningLine = WinChecker.getWinningLine(state.board, state.winLength);
        }

        state.board.forEach((row, r) => {
            row.forEach((cell, c) => {
                const cellEl = document.createElement('div');
                cellEl.className = `cell bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors ${cell === 'X' ? 'text-game-x' : cell === 'O' ? 'text-game-o' : ''}`;
                
                if (winningLine && winningLine.some(m => m.row === r && m.col === c)) {
                    cellEl.classList.add('winning-cell');
                }

                cellEl.textContent = cell;
                cellEl.onclick = () => this.controller.handleMove(r, c);
                
                // Dynamic font size based on board size
                const fontSize = state.boardSize > 6 ? 'text-xl' : state.boardSize > 4 ? 'text-2xl' : 'text-4xl';
                cellEl.classList.add(fontSize);
                
                boardEl.appendChild(cellEl);
            });
        });

        if (winningLine) {
            this.drawWinningLine(boardEl, winningLine, state.boardSize);
        }

        const turnEl = document.getElementById('turn-indicator');
        if (turnEl) {
            turnEl.innerHTML = `Current Turn: <span class="${state.currentPlayer === 'X' ? 'text-red-500' : 'text-green-500'}">${state.currentPlayer}</span>`;

            turnEl.classList.remove('animate-pop');
            void turnEl.offsetWidth; // Trigger reflow
            turnEl.classList.add('animate-pop');

            if (this.lastPlayer && this.lastPlayer !== state.currentPlayer) {
                this.playTurnSound();
            }
            this.lastPlayer = state.currentPlayer;
        }
    }

    private playTurnSound() {
        try {
            if (!this.audioContext) {
                this.audioContext = new AudioContext();
            }
            
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }

            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            // Create a pleasant "pop" sound
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, this.audioContext.currentTime);
            osc.frequency.exponentialRampToValueAtTime(300, this.audioContext.currentTime + 0.1);

            gain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

            osc.start();
            osc.stop(this.audioContext.currentTime + 0.1);
        } catch (e) {
            console.error("Audio play failed", e);
        }
    }

    private playWinSound() {
        try {
            if (!this.audioContext) {
                this.audioContext = new AudioContext();
            }
            
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }

            const now = this.audioContext.currentTime;
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio

            notes.forEach((freq, i) => {
                const osc = this.audioContext!.createOscillator();
                const gain = this.audioContext!.createGain();

                osc.connect(gain);
                gain.connect(this.audioContext!.destination);

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now + i * 0.1);

                gain.gain.setValueAtTime(0, now + i * 0.1);
                gain.gain.linearRampToValueAtTime(0.1, now + i * 0.1 + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.3);

                osc.start(now + i * 0.1);
                osc.stop(now + i * 0.1 + 0.3);
            });
        } catch (e) {
            console.error("Audio play failed", e);
        }
    }

    private drawWinningLine(boardEl: HTMLElement, line: Move[], boardSize: number) {
        const start = line[0];
        const end = line[line.length - 1];
        const x1 = (start.col + 0.5) / boardSize * 100;
        const y1 = (start.row + 0.5) / boardSize * 100;
        const x2 = (end.col + 0.5) / boardSize * 100;
        const y2 = (end.row + 0.5) / boardSize * 100;

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("class", "absolute inset-0 w-full h-full pointer-events-none z-10");
        svg.innerHTML = `
            <line x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%" 
                  stroke="#3b82f6" stroke-width="10" stroke-linecap="round"
                  pathLength="1" class="winning-line" />
        `;
        boardEl.appendChild(svg);
    }

    public showResult(winner: Player | 'Draw') {
        if (winner !== 'Draw') {
            this.playWinSound();
        }
        setTimeout(() => {
            const modal = document.getElementById('result-modal')!;
            const title = document.getElementById('result-title')!;
            modal.classList.remove('hidden');
            title.textContent = winner === 'Draw' ? "It's a Draw!" : `${winner} Wins!`;
            title.className = `text-4xl font-black ${winner === 'X' ? 'text-game-x' : winner === 'O' ? 'text-game-o' : 'text-white'}`;
        }, 800);
    }
}
