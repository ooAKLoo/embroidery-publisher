import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('ovideo', {
  openImages: () => ipcRenderer.invoke('dialog:openImages'),
  renderVideo: (payload) => ipcRenderer.invoke('render:start', payload),
  onRenderProgress: (callback) => {
    ipcRenderer.removeAllListeners('render:progress');
    ipcRenderer.on('render:progress', (_event, value) => callback(value));
  },
  onRenderDone: (callback) => {
    ipcRenderer.removeAllListeners('render:done');
    ipcRenderer.on('render:done', (_event, value) => callback(value));
  },
  onRenderError: (callback) => {
    ipcRenderer.removeAllListeners('render:error');
    ipcRenderer.on('render:error', (_event, value) => callback(value));
  }
});
