import { app, BrowserWindow, dialog, ipcMain, protocol } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import fs from 'fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let mainWindow;

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'ovideo',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true
    }
  }
]);

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    backgroundColor: '#0b0f1a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  const isDev = !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
};

app.whenReady().then(() => {
  protocol.registerFileProtocol('ovideo', (request, callback) => {
    const url = request.url.replace('ovideo://', '');
    const decodedPath = decodeURI(url);
    callback({ path: decodedPath });
  });
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('dialog:openImages', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp', 'bmp'] }
    ]
  });
  if (result.canceled) return [];
  return result.filePaths;
});

ipcMain.handle('render:start', async (event, payload) => {
  const tempDir = await fs.mkdtemp(path.join(app.getPath('temp'), 'ovideo-'));
  const payloadPath = path.join(tempDir, 'payload.json');
  await fs.writeFile(payloadPath, JSON.stringify(payload, null, 2));

  const workerPath = path.join(__dirname, 'render-worker.mjs');
  const child = spawn(process.execPath, [workerPath, '--payload', payloadPath], {
    cwd: path.join(__dirname, '..'),
    env: {
      ...process.env
    }
  });

  child.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(Boolean);
    lines.forEach((line) => {
      if (line.startsWith('progress:')) {
        const value = Number(line.replace('progress:', ''));
        event.sender.send('render:progress', value);
      }
      if (line.startsWith('done:')) {
        const output = line.replace('done:', '');
        event.sender.send('render:done', output);
      }
      if (line.startsWith('error:')) {
        const message = line.replace('error:', '');
        event.sender.send('render:error', message);
      }
    });
  });

  child.stderr.on('data', (data) => {
    event.sender.send('render:error', data.toString());
  });

  child.on('exit', async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  return true;
});
