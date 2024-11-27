/* eslint-disable no-undef */
// eslint-disable-next-line no-unused-vars
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

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

  // Натискаємо на кнопку "New Game"
  fireEvent.click(screen.getByText('New Game'));

  // Перевіряємо, що sendToArduino був викликаний з командою RESET
  expect(window.api.sendToArduino).toHaveBeenCalledWith(
    JSON.stringify({ command: 'RESET' })
  );
});

test('змінює режим гри при виборі нового режиму', () => {
  render(<App />);

  // Змінюємо режим гри
  fireEvent.change(screen.getByLabelText('Game Mode:'), { target: { value: '2' } });

  // Перевіряємо, що sendToArduino був викликаний з командою MODE
  expect(window.api.sendToArduino).toHaveBeenCalledWith(
    JSON.stringify({ command: 'MODE', mode: 2 })
  );
});
