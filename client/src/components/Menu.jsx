/* eslint-disable react/prop-types */
import React from 'react';

const Menu = ({ onNewGame, onSaveGame, onLoadGame, currentMode, currentAIMode, disabled }) => {
  const gameModes = ['Man vs AI', 'Man vs Man', 'AI vs AI'];
  const aiModes = ['Random move', 'Win strategy'];

  const [selectedMode, setSelectedMode] = React.useState(currentMode);
  const [selectedAIMode, setSelectedAIMode] = React.useState(currentAIMode);

  React.useEffect(() => {
    setSelectedMode(currentMode);
    setSelectedAIMode(currentAIMode);
  }, [currentMode, currentAIMode]);

  const handleModeChange = (e) => {
    setSelectedMode(e.target.value);
  };

  const handleAIModeChange = (e) => {
    setSelectedAIMode(e.target.value);
  };

  const handleNewGame = () => {
    onNewGame(selectedMode, selectedAIMode);
  };

  return (
    <div className="menu">
      <div className="mode-select">
        <label>
          Game Mode:
          <select value={selectedMode} onChange={handleModeChange} disabled={disabled}>
            {gameModes.map(mode => (
              <option key={mode} value={mode}>{mode}</option>
            ))}
          </select>
        </label>
        
        {selectedMode.includes('AI') && (
          <label>
            AI Mode:
            <select value={selectedAIMode} onChange={handleAIModeChange} disabled={disabled}>
              {aiModes.map(mode => (
                <option key={mode} value={mode}>{mode}</option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="actions">
        <button onClick={handleNewGame} disabled={disabled}>New Game</button>
        <button onClick={onSaveGame} disabled={disabled}>Save Game</button>
        <button onClick={onLoadGame} disabled={disabled}>Load Game</button>
      </div>
    </div>
  );
};

export default Menu;