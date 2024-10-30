const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

let arduinoConnected = false;
let port, parser;

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.webContents.openDevTools();
  win.loadURL('http://localhost:5173');
  Menu.setApplicationMenu(null);

  checkArduinoStatus();

  ipcMain.on('send-command', (event, command) => {
    if (arduinoConnected && port) {
      port.write(`${command}\n`, (err) => {
        if (err) {
          console.log('Помилка при відправці:', err.message);
          event.reply('arduino-response', `Помилка: ${err.message}`);
        } else {
          console.log('Команда відправлена на Arduino:', command);
        }
      });
    } else {
      event.reply('arduino-response', 'Arduino не підключена');
    }
  });

  ipcMain.handle('check-arduino-status', () => {
    return arduinoConnected;
  });
}

function checkArduinoStatus() {
  setInterval(async () => {
    const ports = await SerialPort.list();

    const arduinoPort = ports.find((p) =>
      p.vendorId === '2341' &&  
      p.productId === '0043'    
    );

    if (arduinoPort && !arduinoConnected) {
      connectToArduino(arduinoPort.path); 
    } else if (!arduinoPort && arduinoConnected) {
      disconnectArduino();
    }
  }, 5000);
}

function connectToArduino(portPath) {
  port = new SerialPort({
    path: portPath,  
    baudRate: 9600,
  });

  parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

  port.on('open', () => {
    arduinoConnected = true;
    console.log('Arduino підключена на порту:', portPath);
    
    BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.send('arduino-connected', true);
    });
  });

  port.on('close', () => {
    arduinoConnected = false;
    console.log('Arduino відключена');

    BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.send('arduino-connected', false);
    });
  });

  parser.on('data', (data) => {
    console.log('Отримано дані від Arduino:', data);
    if (typeof data === 'string') {
      BrowserWindow.getAllWindows().forEach((win) => {
        win.webContents.send('arduino-response', data);
      });
    }
  });

  port.on('error', (err) => {
    arduinoConnected = false;
    console.log('Помилка підключення до Arduino:', err.message);
  });
}

function disconnectArduino() {
  if (port) {
    port.close((err) => {
      if (err) {
        console.log('Помилка при закритті порту:', err.message);
      }
    });
    arduinoConnected = false;
    console.log('Arduino відключена вручну');
    
    BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.send('arduino-connected', false);
    });
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
