/* eslint-disable */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

test('renders Arduino Control Panel UI elements', () => {
  render(<App />);

  expect(screen.getByText('Arduino Control Panel')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('Введіть команду')).toBeInTheDocument();
  expect(screen.getByText('Надіслати')).toBeInTheDocument();
});

test('updates command input field when text is entered', () => {
  render(<App />);

  const input = screen.getByPlaceholderText('Введіть команду');
  fireEvent.change(input, { target: { value: 'Test Command' } });

  expect(input).toHaveValue('Test Command');
});

test('clears command input field when send button is clicked', () => {
  render(<App />);

  const input = screen.getByPlaceholderText('Введіть команду');
  const button = screen.getByText('Надіслати');

  fireEvent.change(input, { target: { value: 'Test Command' } });
  fireEvent.click(button);

  expect(input).toHaveValue('');
});
