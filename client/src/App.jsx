/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import "./App.css";

/**
 * Main game component built with React.
 * Implements the "Tic-Tac-Toe" game with Arduino integration.
 */
function App() {
  const emptyBoard = Array(9).fill(" "); // Use ' ' for compatibility with Arduino's board format
  const [board, setBoard] = useState(emptyBoard); // State for the game board
  const [gameMode, setGameMode] = useState(0); // Game mode: 0 - Player vs AI, 1 - AI vs AI, 2 - Player vs Player
  const [gameStatus, setGameStatus] = useState(""); // Current game status message
  const [gameOver, setGameOver] = useState(false); // Flag for game over state
  const [connectionStatus, setConnectionStatus] = useState(false); // Arduino connection status
  const [currentPlayer, setCurrentPlayer] = useState("X"); // Tracks the current player

  // Lifecycle hook for component initialization and cleanup
  useEffect(() => {
    // Listen for data from Arduino
    window.api.onArduinoData(handleArduinoData);

    // Listen for Arduino connection status updates
    window.api.onArduinoConnectionStatus((status) => {
      /* istanbul ignore next */
      setConnectionStatus(status);
    });

    // Check Arduino connection status
    window.api.checkArduinoConnection();

    // Start a new game on component load
    resetGame();

    return () => {
      // Cleanup listeners on component unmount
      window.api.onArduinoData(null);
      window.api.onArduinoConnectionStatus(null);
    };
  }, []);

  /**
   * Handles incoming data from Arduino.
   * Parses and updates the app state based on the data type.
   * @param {string} data - JSON string received from Arduino.
   */

  const handleArduinoData = (data) => {
    try {
      const jsonData = JSON.parse(data);
      const { type, message } = jsonData;

      if (type === 'info') {
        /* istanbul ignore next */
        setGameStatus(message);
      } else if (type === 'board') {
        // Update the board with new data
        const newBoard = message.replace(/\n/g, '').split('|').join('').split('');
        /* istanbul ignore next */
        setBoard(newBoard);
      } else if (type === 'game_status') {
        /* istanbul ignore next */
        setGameStatus(message);
        // Update the current player based on the status message
        const playerMatch = message.match(/Player (\w)'s turn/);
        if (playerMatch && playerMatch[1]) {
          /* istanbul ignore next */
          setCurrentPlayer(playerMatch[1]);
        }
      } else if (type === 'result') {
        /* istanbul ignore next */
        setGameStatus(message);
        setGameOver(true); // Mark the game as over
      } else if (type === 'error') {
        alert(message); // Display error message
      } else if (type === 'ai_move') {
        /* istanbul ignore next */
        setGameStatus(message);
      } else if (type === 'game_mode') {
        /* istanbul ignore next */
        setGameStatus(message);
      }
    } catch (error) {
      console.error('Error parsing Arduino data:', error);
    }

  };

  /**
   * Handles cell clicks by players.
   * Sends a "PLAY" command to Arduino if the move is valid.
   * @param {number} index - The index of the clicked cell on the board.
   */
  const handleCellClick = (index) => {
    if (gameOver || board[index] !== " ") return;

    // Check if it's the player's turn
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
      // Not the player's turn
      alert("It's not your turn.");
    }
  };

  /**
   * Resets the game state and sends a "RESET" command to Arduino.
   */
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

  /**
   * Changes the game mode and resets the game state.
   * Sends a "MODE" command to Arduino to update the mode.
   * @param {number} mode - The selected game mode.
   */
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

  /**
   * Sends a "SAVE" command to Arduino to save the current game state.
   */
  const saveGame = () => {
    const command = {
      command: 'SAVE'
    };
    window.api.sendToArduino(JSON.stringify(command));
  };

  /**
   * Sends a "LOAD" command to Arduino to load a previously saved game state.
   * Resets the game over state after loading.
   */
  const loadGame = () => {
    const command = {
      command: 'LOAD'
    };
    window.api.sendToArduino(JSON.stringify(command));
    setGameOver(false); // Reset game over state
  };

  // Render the game UI
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
    </div>
  );
}

export default App;
