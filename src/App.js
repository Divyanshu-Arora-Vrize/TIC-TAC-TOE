import { useState, useEffect } from "react";
import './index.css';
import clickSound from './click-47609.mp3';
import winSound from './win.mp3';
import Confetti from 'react-confetti';

function Board({ xIsNext, squares, onPlay, winningLine, playerNames }) {
  function handleClick(i) {
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = 'X';
    } else {
      nextSquares[i] = 'O';
    }
    onPlay(nextSquares);
  }

  const winnerInfo = calculateWinner(squares);
  let status;
  if (winnerInfo) {
    status = `Winner: ${playerNames[winnerInfo.player]}`;
    const audio = new Audio(winSound);
    audio.play();
    setTimeout(() => {
    }, 1000);
  } else if (squares.every(square => square !== null)) {
    status = "No Winners!";
  } else {
    status = `Next player: ${playerNames[xIsNext ? 'X' : 'O']}`;
  }

  return (
    <>
      <div className="status">{status}</div>
      <div className="board">
        {squares.map((square, i) => (
          <Square
            key={i}
            value={square}
            onSquareClick={() => handleClick(i)}
            highlight={winningLine && winningLine.includes(i)}
          />
        ))}
      </div>
    </>
  );
}

function Square({ value, onSquareClick, highlight }) {
  const handleClick = () => {
    if (value === null) {
      const audio = new Audio(clickSound);
      audio.play();
    }
    onSquareClick();
  };

  return (
    <button
      className={`square ${highlight ? 'highlight' : ''}`}
      onClick={handleClick}
    >
      {value}
    </button>
  );
}

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [playerNames, setPlayerNames] = useState({ X: '', O: '' });
  const [showConfetti, setShowConfetti] = useState(false);
  const [gameStatus, setGameStatus] = useState(null); // For displaying status
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];
  const winnerInfo = calculateWinner(currentSquares);

  useEffect(() => {
    if (currentMove === 0) {
      setGameStarted(true);
    }
  }, [currentMove]);

  useEffect(() => {
    if (winnerInfo) {
      setShowConfetti(true);
      setGameStatus(`Congratulations ${playerNames[winnerInfo.player]}!`);
      setTimeout(() => {
        setShowConfetti(false);
        setGameStatus(null);
      }, 3000);
    } else if (currentSquares.every(square => square !== null)) {
      setGameStatus("No Winners!");
    } else {
      setGameStatus(null);
    }
  }, [winnerInfo, currentSquares, playerNames]);

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function resetGame() {
    setHistory([Array(9).fill(null)]);
    setCurrentMove(0);
    setGameStarted(false);
    setShowConfetti(false);
    setPlayerNames({ X: '', O: '' });
    setGameStatus(null); // Reset game status
  }

  function handlePlayerNameChange(e, player) {
    setPlayerNames({
      ...playerNames,
      [player]: e.target.value
    });
  }

  return (
    <div className={`game ${gameStarted ? 'game-started' : ''}`}>
      <h1>TIC-TAC-TOE</h1>
      <div className="game-board">
        <Board
          xIsNext={xIsNext}
          squares={currentSquares}
          onPlay={handlePlay}
          winningLine={winnerInfo ? winnerInfo.line : null}
          playerNames={playerNames}
        />
        {showConfetti && <Confetti />}
      </div>
      <div className="game-info">
        <div className="player-names">
          <h3>Enter Player Names:</h3>
          <input
            type="text"
            placeholder="Player X"
            value={playerNames.X}
            onChange={(e) => handlePlayerNameChange(e, 'X')}
          />
          <input
            type="text"
            placeholder="Player O"
            value={playerNames.O}
            onChange={(e) => handlePlayerNameChange(e, 'O')}
          />
        </div>
        <button onClick={resetGame}>Reset Game</button>
        {gameStatus && (
          <div className="winner-popup">
            <div className="winner-message">
              {gameStatus}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { player: squares[a], line: [a, b, c] };
    }
  }
  return null;
}
