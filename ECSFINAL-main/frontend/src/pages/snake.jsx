// SnakeGame.js
import React, { useState, useEffect, useRef } from 'react';

const SnakeGame = () => {
  // Board settings
  const boardSize = 20; // 20 x 20 grid
  const cellSize = 25;  // Each cell is 25px square

  // Initial snake: starts at the center of the board
  const initialSnake = [{ x: 10, y: 10 }];
  const [snake, setSnake] = useState(initialSnake);
  const [food, setFood] = useState(generateFood(initialSnake));
  const [direction, setDirection] = useState({ x: 0, y: 0 }); // no movement until key press
  const [gameOver, setGameOver] = useState(false);
  const [speed] = useState(150); // game update speed in milliseconds

  // Ref for managing the game loop interval
  const gameLoopRef = useRef(null);

  // Generates a random food position not overlapping the snake
  function generateFood(snakeBody) {
    let newFood = {
      x: Math.floor(Math.random() * boardSize),
      y: Math.floor(Math.random() * boardSize),
    };
    while (snakeBody.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
      newFood = {
        x: Math.floor(Math.random() * boardSize),
        y: Math.floor(Math.random() * boardSize),
      };
    }
    return newFood;
  }

  // Moves the snake on every game tick
  const moveSnake = () => {
    const newHead = {
      x: snake[0].x + direction.x,
      y: snake[0].y + direction.y,
    };

    // Check for collisions with walls or self
    if (
      newHead.x < 0 ||
      newHead.x >= boardSize ||
      newHead.y < 0 ||
      newHead.y >= boardSize ||
      snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)
    ) {
      setGameOver(true);
      clearInterval(gameLoopRef.current);
      return;
    }

    // Create new snake by adding the new head
    let newSnake = [newHead, ...snake];

    // Check if food is eaten; if so, generate new food, else remove tail
    if (newHead.x === food.x && newHead.y === food.y) {
      setFood(generateFood(newSnake));
    } else {
      newSnake.pop();
    }
    setSnake(newSnake);
  };

  // Start the game loop using useEffect
  useEffect(() => {
    if (!gameOver && (direction.x !== 0 || direction.y !== 0)) {
      gameLoopRef.current = setInterval(() => {
        moveSnake();
      }, speed);
      return () => clearInterval(gameLoopRef.current);
    }
  }, [snake, direction, gameOver, speed]);

  // Listen for arrow key presses to update the snake's direction
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowUp':
          if (direction.y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x !== -1) setDirection({ x: 1, y: 0 });
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  // Resets the game state
  const resetGame = () => {
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setDirection({ x: 0, y: 0 });
    setGameOver(false);
  };

  // Render the board cells (each cell is a div)
  const cells = [];
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      let className = 'cell';
      if (snake.some(segment => segment.x === x && segment.y === y)) {
        className = 'cell snake';
      } else if (food.x === x && food.y === y) {
        className = 'cell food';
      }
      cells.push(
        <div
          key={`${x}-${y}`}
          className={className}
          style={{ width: cellSize, height: cellSize }}
        ></div>
      );
    }
  }

  return (
    <>
      {/* Internal CSS for a modern, attractive design */}
      <style>{`
        body {
          background: linear-gradient(135deg, #1e3c72, #2a5298);
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .game-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          color: #fff;
          padding: 20px;
        }
        h1 {
          margin-bottom: 20px;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }
        .board {
          display: grid;
          grid-template-columns: repeat(${boardSize}, ${cellSize}px);
          grid-template-rows: repeat(${boardSize}, ${cellSize}px);
          gap: 2px;
          background: #444;
          padding: 10px;
          border: 3px solid #fff;
          border-radius: 10px;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
          margin-bottom: 20px;
        }
        .cell {
          background: #eee;
          transition: background 0.3s;
        }
        .cell.snake {
          background: #4caf50;
        }
        .cell.food {
          background: #f44336;
        }
        .menu {
          text-align: center;
        }
        .menu button {
          margin: 0 10px;
          padding: 10px 20px;
          font-size: 16px;
          border: none;
          border-radius: 5px;
          background: #ff9800;
          color: #fff;
          cursor: pointer;
          transition: background 0.3s, transform 0.2s;
        }
        .menu button:hover {
          background: #e68900;
          transform: scale(1.05);
        }
        .game-over {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 20px;
          color: #ffeb3b;
          text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.7);
        }
        p {
          font-size: 18px;
        }
      `}</style>

      <div className="game-container">
        <h1>Snake Game</h1>
        <div className="board">
          {cells}
        </div>
        <div className="menu">
          {gameOver ? (
            <>
              <div className="game-over">Game Over!</div>
              <button onClick={resetGame}>Reset Game</button>
            </>
          ) : (
            <p>Use the arrow keys to control the snake.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default SnakeGame;
