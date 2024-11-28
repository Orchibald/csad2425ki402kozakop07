/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from 'react';

/**
 * Board Component for rendering the Tic-Tac-Toe game board.
 * 
 * @param {Object} props - Component props.
 * @param {Array<string>} props.board - Array representing the game board state. 
 * Each element is either "X", "O", or " " (empty).
 * @param {Function} props.onCellClick - Callback function triggered when a cell is clicked.
 * @param {boolean} props.gameOver - Flag indicating whether the game is over.
 * @param {number|null} props.pendingMove - Index of the cell for a pending move (highlighted).
 * @param {boolean} props.disabled - Flag indicating whether the board is disabled (e.g., during AI processing).
 * 
 * @returns {JSX.Element} - Rendered game board.
 */
const Board = ({ board, onCellClick, gameOver, pendingMove, disabled }) => {
  return (
    <div className="board">
      {board.map((cell, index) => (
        <div
          key={index} // Unique key for each cell
          className={`cell ${cell} ${(gameOver || disabled) ? 'disabled' : ''} ${pendingMove === index ? 'pending' : ''}`}
          // Add click handler only if the game is not over and the board is not disabled
          onClick={() => !gameOver && !disabled && onCellClick(index)}
        >
          {/* Render the cell's content if it's not empty */}
          {cell}
        </div>
      ))}
    </div>
  );
};

export default Board;
