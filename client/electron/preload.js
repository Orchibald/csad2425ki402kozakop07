/* eslint-disable no-undef */
/* eslint-env node */
const { contextBridge, ipcRenderer } = require('electron');

/**
 * Exposes an API to the renderer process, allowing communication with the main process.
 * This is done using `contextBridge` for safe and controlled access to Electron's IPC.
 */
contextBridge.exposeInMainWorld('api', {
  /**
   * Sends a message to the Arduino via the main process.
   * @param {string} message - The message to be sent to Arduino.
   */
  sendToArduino: (message) => ipcRenderer.send('send-to-arduino', message),

  /**
   * Listens for data from Arduino and calls the provided callback when data is received.
   * @param {function} callback - A function that will be called with the data received from Arduino.
   * @example
   * api.onArduinoData((data) => {
   *   console.log(data);
   * });
   */
  onArduinoData: (callback) => {
    ipcRenderer.on('arduino-data', (event, data) => callback(data));
  },

  /**
   * Sends a request to check the current status of the Arduino connection.
   */
  checkArduinoConnection: () => ipcRenderer.send('check-arduino-connection'),

  /**
   * Listens for Arduino connection status changes and calls the provided callback.
   * @param {function} callback - A function that will be called with the status of the Arduino connection (true/false).
   * @example
   * api.onArduinoConnectionStatus((status) => {
   *   console.log('Connection status:', status);
   * });
   */
  onArduinoConnectionStatus: (callback) => {
    ipcRenderer.on('arduino-connection-status', (event, status) => callback(status));
  },

  /**
   * Retrieves the versions of Node.js, Chrome, and Electron.
   * @returns {Object} An object containing the versions of Node.js, Chrome, and Electron.
   * @example
   * const versions = api.getVersions();
   * console.log(versions.node); // Node.js version
   * console.log(versions.chrome); // Chrome version
   * console.log(versions.electron); // Electron version
   */
  getVersions: () => ({
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  })
});
