import { app, shell, BrowserWindow } from 'electron'
import { join } from 'node:path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { autoUpdater } from 'electron-updater'
import { registerSettingsHandlers } from './ipc/settingsHandlers'
import { registerPlayerHandlers } from './ipc/playerHandlers'
import { registerProfileHandlers } from './ipc/profileHandlers'
import { registerMemberHandlers } from './ipc/memberHandlers'
import { registerResourceHandlers } from './ipc/resourceHandlers'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 640,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#15181a',
    // Custom titlebar: hide the native title/menu chrome but keep the
    // native min/max/close buttons (themed to match) via titleBarOverlay,
    // rather than reimplementing window controls over IPC.
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#1a1e20',
      symbolColor: '#9b9c8f',
      height: 40
    },
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.itsnemogames.skyprofile')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  registerSettingsHandlers()
  registerPlayerHandlers()
  registerProfileHandlers()
  registerMemberHandlers()
  registerResourceHandlers()

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  // Only checks against real GitHub Releases metadata, which doesn't exist
  // for a dev build — skip there, and never let a network/update hiccup
  // take the app down.
  if (!is.dev) {
    autoUpdater.checkForUpdatesAndNotify().catch((error) => {
      console.error('Update check failed:', error)
    })
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
