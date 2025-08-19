let board = [];
let gameActive = false;
let playerTurn = 'X';
let startTime;
let currentMode = 'pvp';
let player1 = "Игрок 1", player2 = "Игрок 2";
let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

function initGame(mode) {
    currentMode = mode;
    board = Array.from({ length: 15 }, () => Array(15).fill(''));
    gameActive = true;
    playerTurn = 'X';
    startTime = Date.now();
    createBoard();
}

function createBoard() {
    const boardDiv = document.getElementById('board');
    boardDiv.innerHTML = '';
    const table = document.createElement('table');
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < 15; i++) {
        const tr = document.createElement('tr');
        for (let j = 0; j < 15; j++) {
            const td = document.createElement('td');
            td.className = 'cell';
            td.dataset.x = i;
            td.dataset.y = j;
            td.onclick = handleCellClick;
            tr.appendChild(td);
        }
        fragment.appendChild(tr);
    }
    table.appendChild(fragment);
    boardDiv.appendChild(table);
}

function checkWin(x, y, symbol) {
    const directions = [
        [[0, 1], [0, -1]],  
        [[1, 0], [-1, 0]],  
        [[1, 1], [-1, -1]], 
        [[1, -1], [-1, 1]]
    ];

    return directions.some(([dir1, dir2]) => {
        let count = 1;
        [dir1, dir2].forEach(([dx, dy]) => {
            for (let i = 1; i < 5; i++) {
                let nx = x + dx * i, ny = y + dy * i;
                if (nx < 0 || nx >= 15 || ny < 0 || ny >= 15 || board[nx][ny] !== symbol) break;
                count++;
            }
        });
        return count >= 5;
    });
}

function computerMove() {
    const emptyCells = board.flatMap((row, i) =>
        row.map((cell, j) => (cell === '' ? { x: i, y: j } : null))
    ).filter(Boolean);

    if (emptyCells.length) {
        const { x, y } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        setTimeout(() => {
            board[x][y] = 'O';
            document.querySelector(`[data-x="${x}"][data-y="${y}"]`).textContent = 'O';

            if (checkWin(x, y, 'O')) return endGame('O');
            if (isBoardFull()) return endGame(null);

            playerTurn = 'X';
        }, 100);
    }
}

function endGame(winner) {
    gameActive = false;
    const timeElapsed = Math.floor((Date.now() - startTime) / 1000);
    const score = Math.max(10000 - timeElapsed * 10, 0);
    const playerName = winner === 'X' ? player1 : player2;

    setTimeout(() => {
        if (winner) {
            if (currentMode === 'pvp' || (currentMode === 'pvc' && winner === 'X')) {
                const save = confirm(`${playerName} победил! Очки: ${score}, Время: ${timeElapsed} сек.\nСохранить результат?`);
                if (save) updateLeaderboard(playerName, score, timeElapsed);
            } else {
                alert('Компьютер победил!');
            }
        } else {
            alert(`Ничья! Время: ${timeElapsed} сек.`);
        }
    }, 500);
}

function updateLeaderboard(playerName, score, timeElapsed) {
    leaderboard.push({ playerName, score, time: timeElapsed });
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 10);
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}

function showLeaderboard() {
    const message = leaderboard
        .slice(0, 10)
        .map((entry, i) => `${i + 1}. ${entry.playerName}: ${entry.score} (${entry.time} сек.)`)
        .join("\n");

    alert(`Лучшие результаты:\n\n${message || "Пока нет результатов."}`);
}

function resetLeaderboardConfirm() {
    if (confirm('Вы уверены, что хотите сбросить таблицу рекордов?')) {
        localStorage.removeItem('leaderboard');
        leaderboard = [];
        alert('Таблица рекордов сброшена!');
    }
}

function handleCellClick(e) {
    if (!gameActive) return;

    const x = +e.target.dataset.x;
    const y = +e.target.dataset.y;

    if (board[x][y] === '') {
        board[x][y] = playerTurn;
        e.target.textContent = playerTurn;

        if (checkWin(x, y, playerTurn)) return endGame(playerTurn);
        if (isBoardFull()) return endGame(null);

        playerTurn = playerTurn === 'X' ? 'O' : 'X';
        if (currentMode === 'pvc' && playerTurn === 'O') computerMove();
    }
}

function startGamePVC() {
    player1 = prompt('Введите имя игрока (Компьютер будет играть за "O"):', 'Игрок 1') || 'Игрок 1';
    initGame('pvc');
}

function startGamePVP() {
    player1 = prompt('Введите имя первого игрока (X):', 'Игрок 1') || 'Игрок 1';
    player2 = prompt('Введите имя второго игрока (O):', 'Игрок 2') || 'Игрок 2';
    initGame('pvp');
}

function isBoardFull() {
    return board.every(row => row.every(cell => cell !== ''));
}
