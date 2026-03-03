# 🎮 Advanced Tic-Tac-Toe (Multi-Board Mode)

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

A modern, scalable web-based Tic-Tac-Toe game built with **TypeScript** and **Vite**. This project goes beyond the classic 3x3 grid, offering dynamic board sizes up to 10x10, intelligent AI opponents, and a beautiful glassmorphism UI.

---

## ✨ Key Features

### 📏 Dynamic Board Sizes
*   **Classic 3x3**: The traditional game you know.
*   **Expanded Grids**: Play on 4x4, 5x5, and up to **10x10** boards.
*   **Adaptive Rules**: Win conditions automatically adjust (e.g., 5-in-a-row for larger boards).

### 🤖 Intelligent AI Modes
*   **Easy**: Makes random moves (great for kids).
*   **Medium**: Blocks your winning moves and tries to win when possible.
*   **Hard**: Uses the **Minimax algorithm** with Alpha-Beta pruning for unbeatable gameplay on smaller boards and optimized heuristics for larger grids.

### 🎨 Modern UI/UX
*   **Glassmorphism Design**: Sleek, semi-transparent panels using Tailwind CSS.
*   **Responsive**: Works seamlessly on desktop and mobile.
*   **Animations**: Smooth entry animations and interactive hover states.

---

## 📂 Project Structure

The project follows a modular **Model-View-Controller (MVC)** architecture for maintainability and scalability.

```text
Tic_Tac_Toe_Game/
├── index.html              # Entry HTML file
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── style.css               # Global styles & Tailwind directives
└── scr/                    # Source Code
    ├── main.ts             # Application entry point
    │
    ├── controllers/        # Handles game flow and user input
    │   └── GameController.ts
    │
    ├── engine/             # Core game logic
    │   ├── AI.ts           # Minimax algorithm & AI logic
    │   ├── Board.ts        # Board generation & validation
    │   └── WinChecker.ts   # Victory detection algorithms
    │
    ├── models/             # TypeScript interfaces & types
    │   └── GameTypes.ts
    │
    └── ui/                 # DOM manipulation & rendering
        └── Renderer.ts
```

---

## 🚀 Getting Started

Follow these steps to run the project locally.

### Prerequisites
*   **Node.js** (v14 or higher)
*   **npm** (Node Package Manager)

### Installation

1.  **Clone the repository** (or navigate to the project folder):
    ```bash
    cd Tic_Tac_Toe_Game
    ```
1.  **Clone the repository and navigate into the project directory.**
    ```bash
    git clone https://github.com/bikram73/Tic_Tac_Toe_Game.git
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Start the development server**:
    ```bash
    npm run dev
    ```

4.  **Play the game**:
    Open your browser and visit the URL shown in the terminal (usually `http://localhost:5173`).

---

## 🛠️ Technologies Used

*   **Language**: TypeScript (Strict typing for robust logic)
*   **Build Tool**: Vite (Fast HMR and bundling)
*   **Styling**: Tailwind CSS (Utility-first styling)
*   **Architecture**: MVC Pattern