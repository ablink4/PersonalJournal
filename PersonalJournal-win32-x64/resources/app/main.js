const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = require('electron').ipcMain;

var appWindows = {};

app.on('ready', () => {
    appWindows.mainWindow = new BrowserWindow({show: false});
    appWindows.mainWindow.maximize();
    appWindows.mainWindow.show();
    appWindows.mainWindow.loadURL('file://' + __dirname + '/index.html');
});

app.on('window-all-closed', () => {
    app.quit();
});

ipcMain.on('show-browse-window', (event, arg) => {
    appWindows.browseWindow = new BrowserWindow({show: true});
    appWindows.browseWindow.loadURL('file://' + __dirname + '/browse.html');
});

ipcMain.on('show-entry-by-id', (event, arg) => {
    appWindows.mainWindow.webContents.send('show-entry-by-id', arg);
});

ipcMain.on('search-for-text', (event, arg) => {
    appWindows.searchWindow = new BrowserWindow({show: true});
    appWindows.searchWindow.searchText = arg;  // not sure if this is best practice, but it works
    appWindows.searchWindow.loadURL('file://' + __dirname + '/search.html');
});

