import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled, { keyframes } from 'styled-components';

const revealAnimation = keyframes`
  0% {
    transform: scale(0.8);
    background-color: gray;
  }
  50% {
    transform: scale(1.2);
    background-color: lightgray;
  }
  100% {
    transform: scale(1);
    background-color: lightgray;
  }
`;

const explosionAnimation = keyframes`
  0% {
    transform: scale(1);
    background-color: red;
  }
  50% {
    transform: scale(1.5);
    background-color: darkred;
  }
  100% {
    transform: scale(1);
    background-color: red;
  }
`;

const Cell = styled.div<{ isRevealed: boolean; isMine: boolean }>`
  width: 30px;
  height: 30px;
  background-color: ${(props) => (props.isRevealed ? (props.isMine ? 'red' : 'lightgray') : 'gray')};
  display: inline-block;
  text-align: center;
  line-height: 30px;
  font-weight: bold;
  cursor: ${(props) => (props.isRevealed ? 'default' : 'pointer')};
  animation: ${(props) => (props.isRevealed ? (props.isMine ? explosionAnimation : revealAnimation) : 'none')} 0.5s;
`;

const FlaggedCell = styled(Cell)`
  background-color: yellow;
  &::before {
    content: '🚩';
  }
`;

const Board = styled.div`
  display: flex;
  flex-wrap: wrap;
  max-width: 600px;
  margin: 0 auto;
`;

const GameInfo = styled.div`
  text-align: center;
  font-size: 24px;
  margin-bottom: 20px;
`;

function App() {
  const [board, setBoard] = useState<number[][]>([]);
  const [revealed, setRevealed] = useState<boolean[][]>([]);
  const [flagged, setFlagged] = useState<boolean[][]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [mineCount, setMineCount] = useState(0);

  const boardRef = useRef<HTMLDivElement>(null);

  const initializeBoard = useCallback((rows: number, cols: number, mines: number) => {
    const newBoard: number[][] = [];
    const newRevealed: boolean[][] = [];
    const newFlagged: boolean[][] = [];
    let mineCount = 0;

    for (let i = 0; i < rows; i++) {
      newBoard[i] = [];
      newRevealed[i] = [];
      newFlagged[i] = [];
      for (let j = 0; j < cols; j++) {
        newBoard[i][j] = 0;
        newRevealed[i][j] = false;
        newFlagged[i][j] = false;
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
    setFlagged(newFlagged);
    setMineCount(mines);
  }, []);

  useEffect(() => {
    initializeBoard(10, 10, 10);
  }, [initializeBoard]);

  const revealCell = useCallback(
    (row: number, col: number, isRightClick: boolean) => {
      if (gameOver || gameWon) return;

      const newRevealed = [...revealed];
      const newFlagged = [...flagged];

      if (isRightClick) {
        newFlagged[row][col] = !newFlagged[row][col];
        setFlagged(newFlagged);
      } else {
        if (newFlagged[row][col]) return;

        newRevealed[row][col] = true;

        if (board[row][col] === -1) {
          setGameOver(true);
        } else if (board[row][col] === 0) {
          const revealedCells: [number, number][] = [[row, col]];
          while (revealedCells.length > 0) {
            const [r, c] = revealedCells.pop()!;
            for (let x = Math.max(0, r - 1); x <= Math.min(board.length - 1, r + 1); x++) {
              for (let y = Math.max(0, c - 1); y <= Math.min(board[0].length - 1, c + 1); y++) {
                if (!newRevealed[x][y] && board[x][y] !== -1 && !newFlagged[x][y]) {
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
      }
    },
    [board, revealed, flagged, gameOver, gameWon]
  );

  const handleCellClick = (row: number, col: number, event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    revealCell(row, col, event.type === 'contextmenu');
  };

  const renderCell = (row: number, col: number) => {
    const isRevealed = revealed[row][col];
    const isMine = board[row][col] === -1;
    const isFlagged = flagged[row][col];

    return (
      <Cell
        isRevealed={isRevealed}
        isMine={isMine}
        onClick={(event) => handleCellClick(row, col, event)}
        onContextMenu={(event) => handleCellClick(row, col, event)}
      >
        {isRevealed && !isMine ? board[row][col] || '' : isFlagged ? <FlaggedCell /> : ''}
      </Cell>
    );
  };

  return (
    <div>
      <GameInfo>
        {gameOver ? (
          <div>Game Over</div>
        ) : gameWon ? (
          <div>You Win!</div>
        ) : (
          <div>Mines: {mineCount}</div>
        )}
      </GameInfo>
      <Board ref={boardRef}>
        {board.map((row, rowIndex) => (
          <div key={rowIndex}>
            {row.map((_, colIndex) => renderCell(rowIndex, colIndex))}
          </div>
        ))}
      </Board>
    </div>
  );
}

export default App;