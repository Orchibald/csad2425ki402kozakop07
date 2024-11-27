/* eslint-disable no-undef */
/* eslint-env node */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  sendToArduino: (message) => ipcRenderer.send('send-to-arduino', message),
  onArduinoData: (callback) => {
    ipcRenderer.on('arduino-data', (event, data) => callback(data));
  },
  checkArduinoConnection: () => ipcRenderer.send('check-arduino-connection'),
  onArduinoConnectionStatus: (callback) => {
    ipcRenderer.on('arduino-connection-status', (event, status) => callback(status));
  },
  getVersions: () => ({
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  })
});
