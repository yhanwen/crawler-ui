import { app, BrowserWindow } from 'electron' // eslint-disable-line
import platform from '../utils/platform';
import '../renderer/store';

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\') // eslint-disable-line
}

let mainWindow;
const isDev = process.env.NODE_ENV === 'development';
const winURL = isDev
  ? 'http://localhost:9080'
  : `file://${__dirname}/index.html`;
// const splashURL = isDev
//   ? 'http://localhost:9080/splash.html'
//   : `file://${__dirname}/splash.html`;


function createWindow() {
  /**
   * Initial window options
   */
  const locale = app.getLocale();
  // let splashWin;
  mainWindow = new BrowserWindow({
    height: 1080,
    width: 1920,
    backgroundColor: '#000',
    title: 'CrawlerUI',
    titleBarStyle: 'hidden',
    fullscreenable: false,
    frame: platform.isMacintosh,
    show: false,
  });
  if (!isDev) {
    // splashWin = new BrowserWindow({
    //   height: 481,
    //   width: 803,
    //   frame: false,
    //   transparent: true,
    //   title: 'CrawlerUI',
    //   alwaysOnTop: true,
    //   // hasShadow: false,
    //   maximizable: false,
    //   minimizable: false,
    //   resizable: false,
    //   show: isDev,
    // });
    // splashWin.loadURL(`${splashURL}?locale=${locale}`);
    // splashWin.once('ready-to-show', () => {
    //   splashWin.show();
    // });
  }
  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadURL(`${winURL}?locale=${locale}`);
  mainWindow.once('ready-to-show', () => {
    setTimeout(() => {
      mainWindow.show();
      // if (!isDev) {
      //   splashWin.hide();
      // }
    }, 2000);
  });
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
