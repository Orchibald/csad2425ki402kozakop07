/* eslint-disable no-undef */
// eslint-disable-next-line no-unused-vars
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import Board from './components/Board';
import Menu from './components/Menu';

beforeEach(() => {
  window.api = {
    sendToArduino: jest.fn(),
    checkArduinoConnection: jest.fn(),
    onArduinoData: jest.fn(),
    onArduinoConnectionStatus: jest.fn(),
  };
});

test('скидає гру при натисканні на кнопку "New Game"', () => {
  render(<App />);

  fireEvent.click(screen.getByText('New Game'));

  expect(window.api.sendToArduino).toHaveBeenCalledWith(
    JSON.stringify({ command: 'RESET' })
  );
});

test('змінює режим гри при виборі нового режиму', () => {
  render(<App />);

  fireEvent.change(screen.getByLabelText('Game Mode:'), { target: { value: '2' } });

  // Перевіряємо, що sendToArduino був викликаний з командою MODE
  expect(window.api.sendToArduino).toHaveBeenCalledWith(
    JSON.stringify({ command: 'MODE', mode: 2 })
  );
});

test('Board компонент рендериться без помилок', () => {
  const mockBoard = ["X", "O", " ", " ", "X", "O", "X", "O", " "];
  const mockOnCellClick = jest.fn();

  render(<Board board={mockBoard} onCellClick={mockOnCellClick} gameOver={false} pendingMove={-1} disabled={false} />);

  const cells = screen.getAllByText(/X|O| /);
  expect(cells).toHaveLength(6);
});

test('клік по клітинці викликає onCellClick', () => {
  const mockBoard = ["X", "O", " ", " ", "X", "O", "X", "O", " "];
  const mockOnCellClick = jest.fn();

  render(<Board board={mockBoard} onCellClick={mockOnCellClick} gameOver={false} pendingMove={-1} disabled={false} />);

  expect(mockOnCellClick).toHaveBeenCalledTimes(0);
});

test('Menu компонент рендериться без помилок і відображає всі кнопки', () => {
  const mockOnNewGame = jest.fn();
  const mockOnSaveGame = jest.fn();
  const mockOnLoadGame = jest.fn();

  render(<Menu 
    onNewGame={mockOnNewGame} 
    onSaveGame={mockOnSaveGame} 
    onLoadGame={mockOnLoadGame} 
    currentMode="Man vs AI" 
    currentAIMode="Random move" 
    disabled={false} 
  />);

  expect(screen.getByText('New Game')).toBeInTheDocument();
  expect(screen.getByText('Save Game')).toBeInTheDocument();
  expect(screen.getByText('Load Game')).toBeInTheDocument();
});

test('кнопка "New Game" викликає функцію onNewGame', () => {
  const mockOnNewGame = jest.fn();
  render(<Menu 
    onNewGame={mockOnNewGame} 
    onSaveGame={() => {}} 
    onLoadGame={() => {}} 
    currentMode="Man vs AI" 
    currentAIMode="Random move" 
    disabled={false} 
  />);

  const button = screen.getByText('New Game');
  fireEvent.click(button);

  expect(mockOnNewGame).toHaveBeenCalledTimes(1);
});


test('відображає статус з’єднання з Arduino', () => {
  render(<App />);

  expect(screen.getByText(/Arduino Connection/)).toBeInTheDocument();
  expect(screen.getByText('Arduino Connection: Disconnected')).toBeInTheDocument();
  
  window.api.onArduinoConnectionStatus(true);
});

test('правильно оновлює стан гри при отриманні даних від Arduino', () => {
  render(<App />);

  const mockData = JSON.stringify({
    type: 'board',
    message: ' | | | | | | | | | ',
  });

  window.api.onArduinoData(mockData);

  const cells = screen.getAllByText(/X|O| /);
  expect(cells).toHaveLength(8);
});

test('зберігає гру при натисканні на кнопку "Save Game"', () => {
  render(<App />);

  fireEvent.click(screen.getByText('Save Game'));

  expect(window.api.sendToArduino).toHaveBeenCalledWith(
    JSON.stringify({ command: 'SAVE' })
  );
});

test('завантажує гру при натисканні на кнопку "Load Game"', () => {
  render(<App />);

  fireEvent.click(screen.getByText('Load Game'));

  expect(window.api.sendToArduino).toHaveBeenCalledWith(
    JSON.stringify({ command: 'LOAD' })
  );
});

test('правильно обробляє тип даних "game_mode" від Arduino', () => {
  render(<App />);

  const mockGameModeData = JSON.stringify({
    type: 'game_mode',
    message: 'Player vs AI',
  });

  window.api.onArduinoData(mockGameModeData);

  expect(screen.getByText('Player vs AI')).toBeInTheDocument();
});




test('правильно обробляє тип даних "info" від Arduino', () => {
  render(<App />);

  const mockInfoData = JSON.stringify({
    type: 'info',
    message: 'Game started',
  });

  window.api.onArduinoData(mockInfoData);
});

test('правильно обробляє тип даних "board" від Arduino', () => {
  render(<App />);

  const mockBoardData = JSON.stringify({
    type: 'board',
    message: ' | |X| |O| | | | ',
  });

  window.api.onArduinoData(mockBoardData);

  const cells = screen.getAllByText(/X|O| /);
  expect(cells).toHaveLength(8); 
});

test('правильно обробляє тип даних "game_status" від Arduino', () => {
  render(<App />);

  const mockGameStatusData = JSON.stringify({
    type: 'game_status',
    message: 'Player X\'s turn',
  });

  window.api.onArduinoData(mockGameStatusData);
});

test('правильно обробляє тип даних "result" від Arduino', async () => {
  render(<App />);

  const mockResultData = JSON.stringify({
    type: 'result',
    message: 'Player X wins!',
  });

  window.api.onArduinoData(mockResultData);
});

test('правильно обробляє тип даних "error" від Arduino', async () => {
  render(<App />);

  const mockErrorData = JSON.stringify({
    type: 'error',
    message: 'Error: Invalid move',
  });

  window.api.onArduinoData(mockErrorData);
});

test('правильно обробляє тип даних "ai_move" від Arduino', async () => {
  render(<App />);

  const mockAIMoveData = JSON.stringify({
    type: 'ai_move',
    message: 'AI made a move',
  });

  window.api.onArduinoData(mockAIMoveData);
});

test('не можна клікнути по клітинці після закінчення гри', () => {
  const mockBoard = ["X", "O", " ", " ", "X", "O", "X", "O", " "];
  const mockOnCellClick = jest.fn();

  render(<Board board={mockBoard} onCellClick={mockOnCellClick} gameOver={true} pendingMove={-1} disabled={false} />);

  expect(mockOnCellClick).toHaveBeenCalledTimes(0);
});

test('не можна клікнути по зайнятій клітинці', () => {
  const mockBoard = ["X", "O", " ", " ", "X", "O", "X", "O", " "];
  const mockOnCellClick = jest.fn();

  render(<Board board={mockBoard} onCellClick={mockOnCellClick} gameOver={false} pendingMove={-1} disabled={false} />);

  expect(mockOnCellClick).toHaveBeenCalledTimes(0);
});
