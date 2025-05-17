// Easy - Width: 10, Height: 8, mines: 10
// Medium - Width: 18, Height: 14, mines: 40
// Hard - Width: 24, Height: 20, mines: 99

// No Guessing algorithm
// No 50/50 boards and guessing probabilities

// First guess must be safe
// If first guess is a mine, regenerate the board

const board = document.querySelector("#board");
const container = document.querySelector("#container");
const scoreboard = document.querySelector("#scoreboard");
const flags = document.querySelector("#flag");
const stopwatch = document.querySelector("#stopwatch");

const EASY = {
  cols: 10,
  rows: 8,
  mines: 10,
  boardWidthPx: 450,
  boardHeightPx: 360,
  boxWidthPx: 45,
  boxHeightPx: 45,
};

const MEDIUM = {
  cols: 18,
  rows: 14,
  mines: 40,
  boardWidthPx: 540,
  boardHeightPx: 420,
  boxWidthPx: 30,
  boxHeightPx: 30,
};

const HARD = {
  cols: 24,
  rows: 20,
  mines: 99,
  boardWidthPx: 600,
  boardHeightPx: 500,
  boxWidthPx: 25,
  boxHeightPx: 25,
};

const BOARD_COLOR = {
  even: "rgb(170,215,81)",
  odd: "rgb(162,209,73)",
  evenRevealed: "rgb(229,194,159)",
  oddRevealed: "rgb(215,184,153)",
};

const CELL_TEXT_COLOR = {
  1: "rgb(25,118,210)",
  2: "rgb(56,142, 60)",
  3: "rgb(211, 69, 64)",
  4: "rgb(123, 31, 162)",
  5: "rgb(253, 145, 7)",
  6: "rgb(0, 151,167)",
  7: "black",
  8: "black",
};

function placeMines(mines, rows, cols, safeRow, safeCol) {
  let placed = 0;

  while (placed < mines) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);

    if (isInSafeZone(r, c, safeRow, safeCol)) continue;

    if (!grid[r][c].mine) {
      grid[r][c].mine = true;
      grid[r][c].element.style.textAlign = "center";
      placed++;
    }
  }
}

function resetGame() {
  // Reset the game state
  seconds = 0;
  firstClick = true;
  currentMineCount = 0;
  currentDifficulty = MEDIUM;

  // Clear the board and reset the timer
  board.innerHTML = "";
  stopwatch.textContent = "⏱️: 0";
}

let seconds = 0;
let grid = [];
let firstClick = true;
let currentMineCount = 0;
let currentDifficulty = MEDIUM;

function calculateAdjacentMines(rows, cols) {
  const directions = [-1, 0, 1];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = grid[r][c];
      if (cell.mine) continue;

      let count = 0;

      for (let dr of directions) {
        for (let dc of directions) {
          if (dr === 0 && dc === 0) continue;

          const nr = r + dr;
          const nc = c + dc;

          if (
            nr >= 0 &&
            nr < rows &&
            nc >= 0 &&
            nc < cols &&
            grid[nr][nc].mine
          ) {
            count++;
          }
        }
      }

      cell.adjacentMines = count;
    }
  }
}

function checkWinCondition() {
  for (let row of grid) {
    for (let cell of row) {
      if (!cell.revealed && !cell.mine) {
        console.log("win condition not met");
        return false;
      }
    }
  }
  endGame(true);
  console.log("win condition met");
  return true;
}

function revealCell(row, col) {
  const cell = grid[row][col];
  if (cell.revealed || cell.flagged) return;

  cell.revealed = true;
  cell.element.classList.add("revealed");
  const isEven = (row + col) % 2 === 0;
  cell.element.style.backgroundColor = isEven
    ? BOARD_COLOR.evenRevealed
    : BOARD_COLOR.oddRevealed;
  cell.element.style.color = "white";
  if (cell.mine) {
    cell.element.textContent = "💣";
    cell.element.classList.add("exploded");
    cell.element.style.backgroundColor = "red";
    setTimeout(() => {
      alert("Game Over! You hit a mine.");
      resetGame();
      generateBoard(currentDifficulty);
    }, 1000);
    return;
  }

  if (cell.adjacentMines > 0) {
    cell.element.textContent = cell.adjacentMines;
    cell.element.style.color = CELL_TEXT_COLOR[cell.adjacentMines];
    cell.element.style.fontWeight = "bold";
    cell.element.style.fontSize = "1.2em";
    cell.element.style.textAlign = "center";
    return;
  }

  const directions = [-1, 0, 1];

  for (let dr of directions) {
    for (let dc of directions) {
      const nr = row + dr;
      const nc = col + dc;

      if (
        (dr !== 0 || dc !== 0) &&
        nr >= 0 &&
        nr < grid.length &&
        nc >= 0 &&
        nc < grid[0].length
      ) {
        revealCell(nr, nc);
      }
    }
  }
  checkWinCondition();
}

function toggleFlag(row, col) {
  const cell = grid[row][col];
  if (cell.revealed) return;
  if (cell.flagged) {
    cell.flagged = false;
    cell.element.textContent = "";
  } else {
    cell.flagged = true;
    cell.element.style.textAlign = "center";
    cell.element.textContent = "🚩";
  }

  updateFlagCount();
}

function updateFlagCount() {
  const flaggedCount = countFlaggedCells();
  const remaining = currentMineCount - flaggedCount;
  document.getElementById("flag").textContent = `🚩: ${remaining}`;
}

function countFlaggedCells() {
  let count = 0;
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c].flagged) count++;
    }
  }
  return count;
}
function isInSafeZone(r, c, safeRow, safeCol) {
  if (r === safeRow && c === safeCol) return true;
  if (Math.abs(r - safeRow) <= 1 && Math.abs(c - safeCol) <= 1) return true;
  return false;
}

function endGame(win) {
  console.log("endGame called!");
  for (let row of grid) {
    for (let cell of row) {
      if (cell.mine) {
        cell.element.textContent = "💣";
        cell.element.style.backgroundColor = win ? "#bdf" : "red";
      }
    }
  }
  for (let row of grid) {
    for (let cell of row) {
      cell.element.onclick = null;
      cell.element.oncontextmenu = null;
    }
  }
  setTimeout(() => {
    alert(win ? "🎉 You Win!" : "💥 Game Over!");
  }, 100);
}

function stopWatch() {
  if (seconds <= 999 && seconds >= 1) {
    document.getElementById("stopwatch").textContent = `⏱️: ${seconds}`;
    setTimeout(stopWatch, 1000);
    ++seconds;
  }
}

function generateBoard({
  cols,
  rows,
  mines,
  boardWidthPx,
  boardHeightPx,
  boxWidthPx,
  boxHeightPx,
}) {
  //
  document.getElementById("flag").textContent = `🚩: ${mines}`;
  currentMineCount = mines;
  // layout dimensions
  board.style.width = `${boardWidthPx}px`;
  board.style.height = `${boardHeightPx}px`;
  scoreboard.style.width = `${boardWidthPx}px`;
  container.style.width = `${boardWidthPx}px`;

  // prepare board styles
  board.innerHTML = "";
  grid = [];
  for (let r = 0; r < rows; r++) {
    grid[r] = [];
    for (let c = 0; c < cols; c++) {
      // cell creation and styling
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.style.width = `${boxWidthPx}px`;
      cell.style.height = `${boxHeightPx}px`;
      cell.style.lineHeight = `${boxHeightPx}px`;
      cell.style.boxSizing = "border-box";
      const isEven = (r + c) % 2 === 0;
      cell.style.backgroundColor = isEven ? BOARD_COLOR.even : BOARD_COLOR.odd;

      // event listener logic, left click
      cell.addEventListener("click", () => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        if (firstClick) {
          placeMines(mines, rows, cols, row, col);
          calculateAdjacentMines(rows, cols);
          seconds++;
          stopWatch();
          firstClick = false;
          revealCell(row, col);
        } else {
          revealCell(row, col);
        }
      });
      // event listener logic, right click
      cell.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        toggleFlag(row, col);
      });

      board.appendChild(cell);

      grid[r][c] = {
        row: r,
        col: c,
        mine: false,
        revealed: false,
        flagged: false,
        adjacentMines: 0,
        element: cell,
      };
    }
  }
}

generateBoard(currentDifficulty);
