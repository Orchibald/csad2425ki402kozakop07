/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const emptyBoard = Array(9).fill(" "); // Use ' ' to match Arduino's board representation
  const [board, setBoard] = useState(emptyBoard);
  const [gameMode, setGameMode] = useState(0); // 0: Player vs AI, 1: AI vs AI, 2: Player vs Player
  const [gameStatus, setGameStatus] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState("X");

  useEffect(() => {
    // Listen for Arduino data
    window.api.onArduinoData(handleArduinoData);

    // Check Arduino connection status
    window.api.onArduinoConnectionStatus((status) => {
      setConnectionStatus(status);
    });

    window.api.checkArduinoConnection();

    // Start a new game on load
    resetGame();

    return () => {
      // Cleanup listeners on unmount
      window.api.onArduinoData(null);
      window.api.onArduinoConnectionStatus(null);
    };
  }, []);

  const handleArduinoData = (data) => {
    try {
      const jsonData = JSON.parse(data);
      const { type, message } = jsonData;

      if (type === 'info') {
        setGameStatus(message);
      } else if (type === 'board') {
        // Update the board
        const newBoard = message.replace(/\n/g, '').split('|').join('').split('');
        setBoard(newBoard);
      } else if (type === 'game_status') {
        setGameStatus(message);
        // Update current player based on the message
        const playerMatch = message.match(/Player (\w)'s turn/);
        if (playerMatch && playerMatch[1]) {
          setCurrentPlayer(playerMatch[1]);
        }
      } else if (type === 'result') {
        setGameStatus(message);
        setGameOver(true);
      } else if (type === 'error') {
        alert(message);
      } else if (type === 'ai_move') {
        setGameStatus(message);
      } else if (type === 'game_mode') {
        setGameStatus(message);
      }
    } catch (error) {
      console.error('Error parsing Arduino data:', error);
    }
  };


  const handleCellClick = (index) => {
    if (gameOver || board[index] !== " ") return;

    // Determine if it's the player's turn
    if (
      (gameMode === 0 && currentPlayer === "X") || // Player vs AI, player's turn
      gameMode === 2 // Player vs Player
    ) {
      const command = {
        command: "PLAY",
        position: index,
      };

      window.api.sendToArduino(JSON.stringify(command));
    } else {
      // Not player's turn
      alert("It's not your turn.");
    }
  };

  const resetGame = () => {
    setGameOver(false);
    setGameStatus("");
    setBoard(emptyBoard);
    setCurrentPlayer("X");

    const command = {
      command: "RESET",
    };

    window.api.sendToArduino(JSON.stringify(command));
  };

  const changeGameMode = (mode) => {
    setGameMode(mode);
    setGameOver(false);
    setBoard(emptyBoard);
    setCurrentPlayer("X");

    const command = {
      command: "MODE",
      mode: mode,
    };

    window.api.sendToArduino(JSON.stringify(command));
  };

  const saveGame = () => {
    const command = {
      command: 'SAVE'
    };
    window.api.sendToArduino(JSON.stringify(command));
  };

  const loadGame = () => {
    const command = {
      command: 'LOAD'
    };
    window.api.sendToArduino(JSON.stringify(command));
    setGameOver(false); // Reset game over state
  };


  return (
    <div className="game">
      <div className="status">
        <p className="title">
          Arduino Connection: {connectionStatus ? "Connected" : "Disconnected"}
        </p>
        <p>{gameStatus}</p>
      </div>
      <div className="board">
        {board.map((value, index) => (
          <div
            key={index}
            className={`cell ${value === "X" ? "x" : value === "O" ? "o" : ""}`}
            onClick={() => handleCellClick(index)}
          >
            {value !== " " ? value : ""}
          </div>
        ))}
      </div>
      <div className="controls">
        <button onClick={resetGame} className="btn">New Game</button>
        <button onClick={saveGame} className="btn">Save Game</button>
        <button onClick={loadGame} className="btn">Load Game</button>
        <label>
          Game Mode:
          <select
            value={gameMode}
            onChange={(e) => changeGameMode(parseInt(e.target.value))}
          >
            <option value={0}>Player vs AI</option>
            <option value={1}>AI vs AI</option>
            <option value={2}>Player vs Player</option>
          </select>
        </label>
      </div>
    </div >
  );
}

export default App;
