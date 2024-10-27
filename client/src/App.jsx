/* eslint-disable */
import React, { useEffect, useState } from 'react';
import './App.css';

const ipcRenderer = window.electron ? window.electron.ipcRenderer : null;

const App = () => {
  const [command, setCommand] = useState('');
  const [response, setResponse] = useState(null);
  const [arduinoStatus, setArduinoStatus] = useState(false);

  useEffect(() => {
    const checkArduinoStatus = async () => {
      if (ipcRenderer) {
        const status = await ipcRenderer.invoke('check-arduino-status');
        setArduinoStatus(status);
      }
    };

    checkArduinoStatus(); 

    if (ipcRenderer) {
      ipcRenderer.on('arduino-connected', (event, status) => {
        setArduinoStatus(status);
      });

      const handleArduinoResponse = (event, data) => {
        console.log('Отримано відповідь від Arduino:', data);
        setResponse(data);
      };

      ipcRenderer.on('arduino-response', handleArduinoResponse);

      return () => {
        ipcRenderer.removeListener('arduino-response', handleArduinoResponse);
        ipcRenderer.removeListener('arduino-connected', setArduinoStatus);
      };
    }
  }, []);

  const sendCommand = () => {
    if (command.trim() && ipcRenderer) {
      ipcRenderer.send('send-command', command);
    }

    setCommand('');
  };

  return (
    <div className="app-container">
      <h1 className="title">Arduino Control Panel</h1>
      
      <p className="arduino-status">
        Статус Arduino: {arduinoStatus ? 'Підключено' : 'Відключено'}
      </p>

      <div>
        <input
          type="text"
          className="command-input"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="Введіть команду"
        />
        <button onClick={sendCommand} className="send-button">
          Надіслати
        </button>
      </div>

      <div className="response-container">
        <h3>Відповідь від Arduino:</h3>
        <p className="response-text">
          {response ? response : 'Немає відповіді'}
        </p>
      </div>
    </div>
  );
};

export default App;
