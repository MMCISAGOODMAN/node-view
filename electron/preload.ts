import { contextBridge, ipcRenderer } from 'electron'

/** 打开文件返回的数据结构 */
export interface OpenFileResult {
  filePath: string
  content: string
  format: 'json' | 'yaml'
}

/** 保存文件返回的数据结构 */
export interface SaveFileResult {
  success: boolean
  filePath: string
}

/** 菜单动作类型 */
export type MenuAction = 'save' | 'save-as'

/**
 * 暴露安全的 Electron API 给渲染进程
 */
contextBridge.exposeInMainWorld('electronAPI', {
  /** 打开文件对话框 */
  openFile: (): Promise<OpenFileResult | null> => ipcRenderer.invoke('dialog:openFile'),

  /** 保存到指定路径 */
  saveFile: (filePath: string, content: string): Promise<SaveFileResult> =>
    ipcRenderer.invoke('file:save', filePath, content),

  /** 另存为 */
  saveFileAs: (content: string, format: 'json' | 'yaml'): Promise<SaveFileResult | null> =>
    ipcRenderer.invoke('dialog:saveFileAs', content, format),

  /** 监听菜单栏 File 操作（Save / Save As） */
  onMenuAction: (callback: (action: MenuAction) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, action: MenuAction): void => {
      callback(action)
    }
    ipcRenderer.on('menu:action', handler)
    return () => ipcRenderer.removeListener('menu:action', handler)
  },

  /** 监听菜单栏 Open 打开的文件 */
  onFileOpened: (callback: (result: OpenFileResult) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, result: OpenFileResult): void => {
      callback(result)
    }
    ipcRenderer.on('file:opened', handler)
    return () => ipcRenderer.removeListener('file:opened', handler)
  },
})
