const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    mainWindow.loadFile(path.join(__dirname, 'index.html'));
    // Ruta absoluta al archivo index.html dentro de lcov-report
    //const reportPath = path.join('C:', 'Users', 'Fktech', 'OneDrive - FK TECH SRL', 'Escritorio', 'GitClass', 'coverage', 'lcov-report', 'index.html');
    //mainWindow.loadFile(reportPath);
}

app.on('ready', createWindow);

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