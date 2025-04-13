import React, { useState, useEffect, useCallback } from 'react';

function App() {
  const [board, setBoard] = useState<number[][]>([]);
  const [revealed, setRevealed] = useState<boolean[][]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [mineCount, setMineCount] = useState(0);

  const initializeBoard = useCallback((rows: number, cols: number, mines: number) => {
    const newBoard: number[][] = [];
    const newRevealed: boolean[][] = [];
    let mineCount = 0;

    for (let i = 0; i < rows; i++) {
      newBoard[i] = [];
      newRevealed[i] = [];
      for (let j = 0; j < cols; j++) {
        newBoard[i][j] = 0;
        newRevealed[i][j] = false;
      }
    }

    while (mineCount < mines) {
      const row = Math.floor(Math.random() * rows);
      const col = Math.floor(Math.random() * cols);
      if (newBoard[row][col] !== -1) {
        newBoard[row][col] = -1;
        mineCount++;
      }
    }

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (newBoard[i][j] !== -1) {
          let count = 0;
          for (let x = Math.max(0, i - 1); x <= Math.min(rows - 1, i + 1); x++) {
            for (let y = Math.max(0, j - 1); y <= Math.min(cols - 1, j + 1); y++) {
              if (newBoard[x][y] === -1) {
                count++;
              }
            }
          }
          newBoard[i][j] = count;
        }
      }
    }

    setBoard(newBoard);
    setRevealed(newRevealed);
    setMineCount(mines);
  }, []);

  useEffect(() => {
    initializeBoard(10, 10, 10);
  }, [initializeBoard]);

  const revealCell = useCallback(
    (row: number, col: number) => {
      if (revealed[row][col] || gameOver || gameWon) return;

      const newRevealed = [...revealed];
      newRevealed[row][col] = true;

      if (board[row][col] === -1) {
        setGameOver(true);
      } else if (board[row][col] === 0) {
        const revealedCells: [number, number][] = [[row, col]];
        while (revealedCells.length > 0) {
          const [r, c] = revealedCells.pop()!;
          for (let x = Math.max(0, r - 1); x <= Math.min(board.length - 1, r + 1); x++) {
            for (let y = Math.max(0, c - 1); y <= Math.min(board[0].length - 1, c + 1); y++) {
              if (!newRevealed[x][y] && board[x][y] !== -1) {
                newRevealed[x][y] = true;
                if (board[x][y] === 0) {
                  revealedCells.push([x, y]);
                }
              }
            }
          }
        }
      }

      let unrevealed = 0;
      for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
          if (!newRevealed[i][j] && board[i][j] !== -1) {
            unrevealed++;
          }
        }
      }

      if (unrevealed === 0) {
        setGameWon(true);
      }

      setRevealed(newRevealed);
    },
    [board, revealed, gameOver, gameWon]
  );

  const renderCell = (row: number, col: number) => {
    if (revealed[row][col]) {
      if (board[row][col] === -1) {
        return <div style={{ width: 20, height: 20, backgroundColor: 'red', display: 'inline-block' }} />;
      } else {
        return <div style={{ width: 20, height: 20, backgroundColor: 'lightgray', display: 'inline-block' }}>{board[row][col] || ''}</div>;
      }
    } else {
      return <div style={{ width: 20, height: 20, backgroundColor: 'gray', display: 'inline-block' }} onClick={() => revealCell(row, col)} />;
    }
  };

  return (
    <div>
      <div>
        {gameOver ? (
          <div>Game Over</div>
        ) : gameWon ? (
          <div>You Win!</div>
        ) : (
          <div>Mines: {mineCount}</div>
        )}
      </div>
      <div>
        {board.map((row, rowIndex) => (
          <div key={rowIndex} style={{ display: 'flex' }}>
            {row.map((_, colIndex) => renderCell(rowIndex, colIndex))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;