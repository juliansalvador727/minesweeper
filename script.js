// Easy - Width: 10, Height: 8, mines: 10
// Medium - Width: 18, Height: 14, mines: 40
// Hard - Width: 24, Height: 20, mines: 99

// No Guessing algorithm
// No 50/50 boards and guessing probabilities

// First guess must be safe
// If first guess is a mine, move mine to an empty cell, starting with top left corner

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

const board = document.querySelector("#board");
const container = document.querySelector("#container");
const scoreboard = document.querySelector("#scoreboard");
const flags = document.querySelector("#flags");
const timer = document.querySelector("#timer");

function placeMines(mines, rows, cols, safeRow, safeCol) {
  let placed = 0;

  while (placed < mines) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);

    // Skip the safe cell and its 8 neighbors
    if (isInSafeZone(r, c, safeRow, safeCol)) continue;

    if (!grid[r][c].mine) {
      grid[r][c].mine = true;
      placed++;
    }
  }
}

let grid = [];
let firstClick = true;

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

function revealCell(row, col) {
  const cell = grid[row][col];
  if (cell.revealed || cell.flagged) return;

  cell.revealed = true;
  cell.element.classList.add("revealed");
  cell.element.style.backgroundColor = "#eee";

  if (cell.mine) {
    cell.element.textContent = "💣";
    cell.element.style.backgroundColor = "red";
    alert("Game Over! You hit a mine.");
    return;
  }

  if (cell.adjacentMines > 0) {
    cell.element.textContent = cell.adjacentMines;
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
}

function isInSafeZone(r, c, safeRow, safeCol) {
  if (r === safeRow && c === safeCol) return true;
  if (Math.abs(r - safeRow) <= 1 && Math.abs(c - safeCol) <= 1) return true;
  return false;
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
      cell.style.backgroundColor = isEven
        ? "rgb(170,215,81)"
        : "rgb(162,209,73)";

      // event listener logic
      cell.addEventListener("click", () => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        if (firstClick) {
          placeMines(mines, rows, cols, row, col);
          calculateAdjacentMines(rows, cols);
          firstClick = false;
          // show mines - debugging
          // for (let row = 0; row < grid.length; row++) {
          //   for (let col = 0; col < grid[row].length; col++) {
          //     if (grid[row][col].mine) {
          //       grid[row][col].element.textContent = "💣";
          //     }
          //   }
          // }
          revealCell(row, col);
        } else {
          revealCell(row, col);
        }
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

generateBoard(HARD);
