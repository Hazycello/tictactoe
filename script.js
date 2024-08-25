document.addEventListener("DOMContentLoaded", () => {
    const gameBoard = document.getElementById("game-board");
    const cells = document.querySelectorAll(".cell");
    const statusDisplay = document.getElementById("status");
    const modeSelection = document.getElementById("mode-selection");
    const difficultySelection = document.getElementById("difficulty-selection");
    const player1Input = document.getElementById("player1-name");
    const player2Input = document.getElementById("player2-name");
    const player1Label = document.getElementById("player1-label");
    const player2Label = document.getElementById("player2-label");
    const player1ScoreDisplay = document.getElementById("player1-score");
    const player2ScoreDisplay = document.getElementById("player2-score");
    const scoreboard = document.getElementById("scoreboard");
    const resetContainer = document.getElementById("reset-container");
    const themeToggle = document.getElementById("toggle-theme");
    
    let currentPlayer = "X";
    let gameActive = true;
    let gameState = ["", "", "", "", "", "", "", "", ""];
    let aiMode = false;
    let aiDifficulty = "easy";
    let player1Name = "Player 1";
    let player2Name = "Player 2";
    let player1Score = 0;
    let player2Score = 0;

    const winningConditions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    function handleCellClick(clickedCellEvent) {
        const clickedCell = clickedCellEvent.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute("data-index"));

        if (gameState[clickedCellIndex] !== "" || !gameActive) {
            return;
        }

        handleCellPlayed(clickedCell, clickedCellIndex);
        handleResultValidation();

        if (aiMode && gameActive && currentPlayer === "O") {
            aiPlay();
            handleResultValidation();
        }
    }

    function handleCellPlayed(clickedCell, clickedCellIndex) {
        gameState[clickedCellIndex] = currentPlayer;
        clickedCell.textContent = currentPlayer;
    }

    function handleResultValidation() {
        let roundWon = false;
        for (let i = 0; i < winningConditions.length; i++) {
            const winCondition = winningConditions[i];
            let a = gameState[winCondition[0]];
            let b = gameState[winCondition[1]];
            let c = gameState[winCondition[2]];
            if (a === '' || b === '' || c === '') {
                continue;
            }
            if (a === b && b === c) {
                roundWon = true;
                break;
            }
        }

        if (roundWon) {
            statusDisplay.textContent = `${currentPlayer === "X" ? player1Name : player2Name} has won!`;
            updateScore(currentPlayer);
            gameActive = false;
            return;
        }

        let roundDraw = !gameState.includes("");
        if (roundDraw) {
            statusDisplay.textContent = `It's a draw!`;
            gameActive = false;
            return;
        }

        currentPlayer = currentPlayer === "X" ? "O" : "X";
        statusDisplay.textContent = `It's ${currentPlayer === "X" ? player1Name : player2Name}'s turn`;
    }

    function aiPlay() {
        let availableCells = gameState.map((cell, index) => cell === "" ? index : null).filter(index => index !== null);

        let move;
        if (aiDifficulty === "easy") {
            move = availableCells[Math.floor(Math.random() * availableCells.length)];
        } else if (aiDifficulty === "medium") {
            move = mediumAIMove(availableCells);
        } else if (aiDifficulty === "hard") {
            move = minimax(gameState, currentPlayer).index;
        }

        if (move !== undefined) {
            gameState[move] = currentPlayer;
            cells[move].textContent = currentPlayer;
        }
    }

    function mediumAIMove(availableCells) {
        return availableCells[Math.floor(Math.random() * availableCells.length)];
    }

    function minimax(newBoard, player) {
        const availSpots = newBoard.map((cell, index) => cell === "" ? index : null).filter(index => index !== null);

        if (checkWin(newBoard, "X")) {
            return { score: -10 };
        } else if (checkWin(newBoard, "O")) {
            return { score: 10 };
        } else if (availSpots.length === 0) {
            return { score: 0 };
        }

        const moves = [];
        for (let i = 0; i < availSpots.length; i++) {
            const move = {};
            move.index = availSpots[i];
            newBoard[availSpots[i]] = player;

            if (player === "O") {
                const result = minimax(newBoard, "X");
                move.score = result.score;
            } else {
                const result = minimax(newBoard, "O");
                move.score = result.score;
            }

            newBoard[availSpots[i]] = "";
            moves.push(move);
        }

        let bestMove;
        if (player === "O") {
            let bestScore = -10000;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score > bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        } else {
            let bestScore = 10000;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score < bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        }

        return moves[bestMove];
    }

    function checkWin(board, player) {
        return winningConditions.some(condition => {
            return condition.every(index => board[index] === player);
        });
    }

    function updateScore(winner) {
        if (winner === "X") {
            player1Score++;
            player1ScoreDisplay.textContent = player1Score;
        } else if (winner === "O") {
            player2Score++;
            player2ScoreDisplay.textContent = player2Score;
        }
    }

    function restartGame() {
        gameActive = true;
        currentPlayer = "X";
        gameState = ["", "", "", "", "", "", "", "", ""];
        statusDisplay.textContent = `It's ${currentPlayer === "X" ? player1Name : player2Name}'s turn`;
        cells.forEach(cell => (cell.textContent = ""));
    }

    modeSelection.addEventListener("click", (event) => {
        if (event.target.id === "human-vs-human") {
            aiMode = false;
            difficultySelection.style.display = "none";
            gameBoard.style.display = "grid";
            player1Name = player1Input.value || "Player 1";
            player2Name = player2Input.value || "Player 2";
            player1Label.textContent = player1Name;
            player2Label.textContent = player2Name;
            scoreboard.style.display = "block";
            resetContainer.style.display = "block";
            restartGame();
        } else if (event.target.id === "ai-vs-human") {
            aiMode = true;
            difficultySelection.style.display = "block";
            gameBoard.style.display = "none";
            scoreboard.style.display = "none";
            resetContainer.style.display = "none";
        }
    });

    difficultySelection.addEventListener("click", (event) => {
        aiDifficulty = event.target.id;
        difficultySelection.style.display = "none";
        gameBoard.style.display = "grid";
        player1Name = player1Input.value || "Player 1";
        player2Name = "Computer";
        player1Label.textContent = player1Name;
        player2Label.textContent = player2Name;
        scoreboard.style.display = "block";
        resetContainer.style.display = "block";
        restartGame();
    });

    cells.forEach(cell => cell.addEventListener("click", handleCellClick));

    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-theme");
    });

    document.getElementById("reset-game").addEventListener("click", restartGame);
});
document.addEventListener("DOMContentLoaded", () => {
    const gameBoard = document.getElementById("game-board");
    const cells = document.querySelectorAll(".cell");
    const statusDisplay = document.getElementById("status");
    const modeSelection = document.getElementById("mode-selection");
    const difficultySelection = document.getElementById("difficulty-selection");
    const player1Input = document.getElementById("player1-name");
    const player2Input = document.getElementById("player2-name");
    const player1Label = document.getElementById("player1-label");
    const player2Label = document.getElementById("player2-label");
    const player1ScoreDisplay = document.getElementById("player1-score");
    const player2ScoreDisplay = document.getElementById("player2-score");
    const scoreboard = document.getElementById("scoreboard");
    const resetContainer = document.getElementById("reset-container");
    const themeToggle = document.getElementById("toggle-theme");
    
    let currentPlayer = "X";
    let gameActive = true;
    let gameState = ["", "", "", "", "", "", "", "", ""];
    let aiMode = false;
    let aiDifficulty = "easy";
    let player1Name = "Player 1";
    let player2Name = "Player 2";
    let player1Score = 0;
    let player2Score = 0;

    const winningConditions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    function handleCellClick(clickedCellEvent) {
        const clickedCell = clickedCellEvent.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute("data-index"));

        if (gameState[clickedCellIndex] !== "" || !gameActive) {
            return;
        }

        handleCellPlayed(clickedCell, clickedCellIndex);
        handleResultValidation();

        if (aiMode && gameActive && currentPlayer === "O") {
            aiPlay();
            handleResultValidation();
        }
    }

    function handleCellPlayed(clickedCell, clickedCellIndex) {
        gameState[clickedCellIndex] = currentPlayer;
        clickedCell.textContent = currentPlayer;
    }

    function handleResultValidation() {
        let roundWon = false;
        for (let i = 0; i < winningConditions.length; i++) {
            const winCondition = winningConditions[i];
            let a = gameState[winCondition[0]];
            let b = gameState[winCondition[1]];
            let c = gameState[winCondition[2]];
            if (a === '' || b === '' || c === '') {
                continue;
            }
            if (a === b && b === c) {
                roundWon = true;
                break;
            }
        }

        if (roundWon) {
            statusDisplay.textContent = `${currentPlayer === "X" ? player1Name : player2Name} has won!`;
            updateScore(currentPlayer);
            gameActive = false;
            return;
        }

        let roundDraw = !gameState.includes("");
        if (roundDraw) {
            statusDisplay.textContent = `It's a draw!`;
            gameActive = false;
            return;
        }

        currentPlayer = currentPlayer === "X" ? "O" : "X";
        statusDisplay.textContent = `It's ${currentPlayer === "X" ? player1Name : player2Name}'s turn`;
    }

    function aiPlay() {
        let availableCells = gameState.map((cell, index) => cell === "" ? index : null).filter(index => index !== null);

        let move;
        if (aiDifficulty === "easy") {
            move = availableCells[Math.floor(Math.random() * availableCells.length)];
        } else if (aiDifficulty === "medium") {
            move = mediumAIMove(availableCells);
        } else if (aiDifficulty === "hard") {
            move = minimax(gameState, currentPlayer).index;
        }

        if (move !== undefined) {
            gameState[move] = currentPlayer;
            cells[move].textContent = currentPlayer;
        }
    }

    function mediumAIMove(availableCells) {
        return availableCells[Math.floor(Math.random() * availableCells.length)];
    }

    function minimax(newBoard, player) {
        const availSpots = newBoard.map((cell, index) => cell === "" ? index : null).filter(index => index !== null);

        if (checkWin(newBoard, "X")) {
            return { score: -10 };
        } else if (checkWin(newBoard, "O")) {
            return { score: 10 };
        } else if (availSpots.length === 0) {
            return { score: 0 };
        }

        const moves = [];
        for (let i = 0; i < availSpots.length; i++) {
            const move = {};
            move.index = availSpots[i];
            newBoard[availSpots[i]] = player;

            if (player === "O") {
                const result = minimax(newBoard, "X");
                move.score = result.score;
            } else {
                const result = minimax(newBoard, "O");
                move.score = result.score;
            }

            newBoard[availSpots[i]] = "";
            moves.push(move);
        }

        let bestMove;
        if (player === "O") {
            let bestScore = -10000;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score > bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        } else {
            let bestScore = 10000;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score < bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        }

        return moves[bestMove];
    }

    function checkWin(board, player) {
        return winningConditions.some(condition => {
            return condition.every(index => board[index] === player);
        });
    }

    function updateScore(winner) {
        if (winner === "X") {
            player1Score++;
            player1ScoreDisplay.textContent = player1Score;
        } else if (winner === "O") {
            player2Score++;
            player2ScoreDisplay.textContent = player2Score;
        }
    }

    function restartGame() {
        gameActive = true;
        currentPlayer = "X";
        gameState = ["", "", "", "", "", "", "", "", ""];
        statusDisplay.textContent = `It's ${currentPlayer === "X" ? player1Name : player2Name}'s turn`;
        cells.forEach(cell => (cell.textContent = ""));
    }

    modeSelection.addEventListener("click", (event) => {
        if (event.target.id === "human-vs-human") {
            aiMode = false;
            difficultySelection.style.display = "none";
            gameBoard.style.display = "grid";
            player1Name = player1Input.value || "Player 1";
            player2Name = player2Input.value || "Player 2";
            player1Label.textContent = player1Name;
            player2Label.textContent = player2Name;
            scoreboard.style.display = "block";
            resetContainer.style.display = "block";
            restartGame();
        } else if (event.target.id === "ai-vs-human") {
            aiMode = true;
            difficultySelection.style.display = "block";
            gameBoard.style.display = "none";
            scoreboard.style.display = "none";
            resetContainer.style.display = "none";
        }
    });

    difficultySelection.addEventListener("click", (event) => {
        aiDifficulty = event.target.id;
        difficultySelection.style.display = "none";
        gameBoard.style.display = "grid";
        player1Name = player1Input.value || "Player 1";
        player2Name = "Computer";
        player1Label.textContent = player1Name;
        player2Label.textContent = player2Name;
        scoreboard.style.display = "block";
        resetContainer.style.display = "block";
        restartGame();
    });

    cells.forEach(cell => cell.addEventListener("click", handleCellClick));

    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-theme");
    });

    document.getElementById("reset-game").addEventListener("click", restartGame);
});
