/* eslint-disable no-undef */
const path = require('path');
const { app, BrowserWindow, ipcMain } = require('electron');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const isDev = process.env.IS_DEV === 'true';

let mainWindow;
let arduinoPort;
let parser;
let checkInterval;

// Get the port from command-line arguments or environment variable
const args = process.argv.slice(1);
let specifiedPort = null;

/**
 * Parse command line arguments to extract the specified port.
 */
args.forEach((arg) => {
  if (arg.startsWith('--port=')) {
    specifiedPort = arg.split('=')[1];
  }
});

if (!specifiedPort && process.env.ARDUINO_PORT) {
  specifiedPort = process.env.ARDUINO_PORT;
}

/**
 * Create the main Electron window.
 * This function initializes the BrowserWindow and loads the appropriate URL.
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1324,
    height: 850,
    minHeight: 650,
    minWidth: 600,
    autoHideMenuBar: true,
    resizable: true,
    frame: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadURL(
    isDev ? 'http://localhost:5173' : `file://${path.join(__dirname, '../dist/index.html')}`
  );
}

/**
 * Find the Arduino port by checking the connected serial devices.
 * @returns {Promise<string|null>} The path to the Arduino serial port or null if not found.
 */
async function findArduinoPort() {
  if (specifiedPort) {
    return specifiedPort;
  }

  const ports = await SerialPort.list();
  for (let port of ports) {
    if (port.manufacturer && port.manufacturer.includes('Arduino')) {
      return port.path;
    }
  }
  return null;
}

/**
 * Set up serial communication with the Arduino.
 * This function initializes the SerialPort and the parser, then listens for incoming data.
 */
async function setupSerialCommunication() {
  try {
    const portPath = await findArduinoPort();
    if (!portPath) {
      console.error('Arduino port not found');
      mainWindow.webContents.send('arduino-connection-status', false);
      return;
    }

    arduinoPort = new SerialPort({ path: portPath, baudRate: 9600 });
    parser = arduinoPort.pipe(new ReadlineParser({ delimiter: '\n' }));

    arduinoPort.on('open', () => {
      console.log('Serial port opened successfully');
      mainWindow.webContents.send('arduino-connection-status', true);
    });

    arduinoPort.on('error', (err) => {
      console.error('Error opening serial port:', err.message);
      mainWindow.webContents.send('arduino-connection-status', false);
    });

    arduinoPort.on('close', () => {
      console.log('Serial port closed');
      mainWindow.webContents.send('arduino-connection-status', false);
    });

    /**
     * Listen for incoming data from Arduino and send it to the main window.
     * @param {string} data - Data received from the Arduino.
     */
    parser.on('data', (data) => {
      console.log('Received from Arduino:', data.trim());
      mainWindow.webContents.send('arduino-data', data.trim());
    });

    /**
     * Send a message to the Arduino via the serial port.
     * @param {string} message - The message to send to the Arduino.
     */
    ipcMain.on('send-to-arduino', (event, message) => {
      console.log('Sending to Arduino:', message);
      arduinoPort.write(message + '\n');
    });

    /**
     * Check the Arduino connection status.
     * Sends a message to the main window indicating whether the connection is open.
     */
    ipcMain.on('check-arduino-connection', () => {
      const isOpen = arduinoPort && arduinoPort.isOpen;
      mainWindow.webContents.send('arduino-connection-status', isOpen);
    });

  } catch (error) {
    console.error('Error in setupSerialCommunication:', error);
    mainWindow.webContents.send('arduino-connection-status', false);
  }
}

/**
 * Monitor the Arduino connection status and attempt to reconnect if necessary.
 * The connection is checked every 5 seconds.
 */
function monitorArduinoConnection() {
  // Check connection every 5 seconds
  checkInterval = setInterval(async () => {
    if (!arduinoPort || !arduinoPort.isOpen) {
      console.log('Attempting to reconnect to Arduino...');
      await setupSerialCommunication();
    }
  }, 5000); // Every 5 seconds
}

app.whenReady().then(() => {
  createWindow();
  setupSerialCommunication();
  monitorArduinoConnection(); // Start monitoring connection

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  clearInterval(checkInterval); // Clear interval when window is closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
