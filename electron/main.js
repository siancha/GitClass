const { app, BrowserWindow } = require('electron');
const path = require('path');
const server = require('../src/server/index');

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
            nodeIntegration: false, // 🔥 Seguridad: No exponer Node.js en el renderer
        },
    });

    //mainWindow.loadFile(path.join(__dirname, 'index.html'));

    // Cargar la vista EJS servida por Express
    mainWindow.loadURL('http://localhost:1233/reports');

}

app.on('ready', () => {
    createWindow();
    server.start(); 
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});