const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    send: (channel, data) => ipcRenderer.send(channel, data),
    on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(event, ...args)),
    removeListener: (channel, func) => ipcRenderer.removeListener(channel, func),
    invoke: (channel, data) => ipcRenderer.invoke(channel, data),
  },
});