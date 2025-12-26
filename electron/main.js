const { app, BrowserWindow, dialog } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const log = require('electron-log');
const { autoUpdater } = require('electron-updater');

let backendProcess;
let mainWindow;
const isDev = !app.isPackaged;


function startBackend() {
  try {
    if (app.isPackaged) {
      const backendPath = path.join(process.resourcesPath, 'backend.exe');
      log.info('Starting backend:', backendPath);
      backendProcess = spawn(backendPath, [], { detached: true });
    } else {
      backendProcess = spawn('node', ['backend/server.js'], {
        shell: true,
        stdio: 'inherit'
      });
    }
  } catch (e) {
    log.error('Backend error:', e);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800
  });

  if (app.isPackaged) {
    const indexPath = path.join(
      app.getAppPath(),
      'dist/angular/browser/index.html'
    );
    console.log('Loading UI:', indexPath);
    mainWindow.loadFile(indexPath);
  } else {
    mainWindow.loadURL('http://localhost:4200');
  }

  mainWindow.webContents.openDevTools();
}


function initAutoUpdater() {

   autoUpdater.setFeedURL({
    provider: "github",
    owner: "dyazinnovate", // your GitHub username/org
    repo: "dyaz-desktop",   // your repo
    private: true,
   token: process.env.GH_TOKEN, // GitHub personal access token
  });

  autoUpdater.autoDownload = true;
autoUpdater.on("checking-for-update", () => log.info("Checking for updates..."));
  autoUpdater.on("update-available", (info) => log.info("Update available:", info.version));
  autoUpdater.on("update-not-available", (info) => log.info("No update available"));
  autoUpdater.on("error", (err) => log.error("Update error:", err));
  autoUpdater.on("download-progress", (progress) =>
    log.info(`Download progress: ${progress.percent.toFixed(2)}%`)
  );
 autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox({
    type: 'info',
    title: 'Update Ready',
    message: 'A new version has been downloaded. Restart now?',
    buttons: ['Restart', 'Later']
  }).then(result => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});
   if (!isDev){ 
    autoUpdater.checkForUpdatesAndNotify();
  }
}

app.whenReady().then(() => {
  log.info('App ready');
  startBackend();
  createWindow();
   initAutoUpdater();
 log.info("init auto updater");
});

app.on('quit', () => {
  if (backendProcess) backendProcess.kill();
});
