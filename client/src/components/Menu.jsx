/* eslint-disable react/prop-types */
import React from 'react';

/**
 * Menu Component for managing game settings and actions.
 * 
 * @param {Object} props - Component props.
 * @param {Function} props.onNewGame - Callback function to start a new game.
 * @param {Function} props.onSaveGame - Callback function to save the current game.
 * @param {Function} props.onLoadGame - Callback function to load a saved game.
 * @param {string} props.currentMode - The currently selected game mode.
 * @param {string} props.currentAIMode - The currently selected AI mode.
 * @param {boolean} props.disabled - Flag to disable all controls (e.g., during AI processing).
 * 
 * @returns {JSX.Element} - Rendered game menu.
 */
const Menu = ({ onNewGame, onSaveGame, onLoadGame, currentMode, currentAIMode, disabled }) => {
  const gameModes = ['Man vs AI', 'Man vs Man', 'AI vs AI']; // Available game modes
  const aiModes = ['Random move', 'Win strategy']; // Available AI modes

  const [selectedMode, setSelectedMode] = React.useState(currentMode); // State for selected game mode
  const [selectedAIMode, setSelectedAIMode] = React.useState(currentAIMode); // State for selected AI mode

  // Update selected modes when props change
  React.useEffect(() => {
    setSelectedMode(currentMode);
    setSelectedAIMode(currentAIMode);
  }, [currentMode, currentAIMode]);

  /**
   * Handles changes to the game mode selection.
   * @param {Object} e - The change event from the dropdown.
   */
  const handleModeChange = (e) => {
    setSelectedMode(e.target.value);
  };

  /**
   * Handles changes to the AI mode selection.
   * @param {Object} e - The change event from the dropdown.
   */
  const handleAIModeChange = (e) => {
    setSelectedAIMode(e.target.value);
  };

  /**
   * Starts a new game with the selected game and AI modes.
   */
  const handleNewGame = () => {
    onNewGame(selectedMode, selectedAIMode);
  };

  return (
    <div className="menu">
      {/* Section for game mode selection */}
      <div className="mode-select">
        <label>
          Game Mode:
          <select value={selectedMode} onChange={handleModeChange} disabled={disabled}>
            {gameModes.map((mode) => (
              <option key={mode} value={mode}>{mode}</option>
            ))}
          </select>
        </label>

        {/* Display AI mode selection only if the game mode involves AI */}
        {selectedMode.includes('AI') && (
          <label>
            AI Mode:
            <select value={selectedAIMode} onChange={handleAIModeChange} disabled={disabled}>
              {aiModes.map((mode) => (
                <option key={mode} value={mode}>{mode}</option>
              ))}
            </select>
          </label>
        )}
      </div>

      {/* Section for game actions */}
      <div className="actions">
        <button onClick={handleNewGame} disabled={disabled}>New Game</button>
        <button onClick={onSaveGame} disabled={disabled}>Save Game</button>
        <button onClick={onLoadGame} disabled={disabled}>Load Game</button>
      </div>
    </div>
  );
};

export default Menu;
