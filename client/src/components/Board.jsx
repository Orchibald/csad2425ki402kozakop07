/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from 'react';

// Board.jsx
const Board = ({ board, onCellClick, gameOver, pendingMove, disabled }) => {
  return (
    <div className="board">
      {board.map((cell, index) => (
        <div
          key={index}
          className={`cell ${cell} ${(gameOver || disabled) ? 'disabled' : ''} ${pendingMove === index ? 'pending' : ''}`}
          onClick={() => !gameOver && !disabled && onCellClick(index)}
        >
          {cell}
        </div>
      ))}
    </div>
  );
};

export default Board;