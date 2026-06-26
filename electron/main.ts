import { app, BrowserWindow, dialog, ipcMain, Menu, type OpenDialogOptions, type SaveDialogOptions } from 'electron'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'

/** 主窗口实例 */
let mainWindow: BrowserWindow | null = null

/** 打开文件返回结构 */
interface OpenFileResult {
  filePath: string
  content: string
  format: 'json' | 'yaml'
}

/**
 * 获取当前可用窗口（用于挂载文件对话框）
 */
function getTargetWindow(): BrowserWindow | null {
  return BrowserWindow.getFocusedWindow() ?? mainWindow
}

/**
 * 打开文件对话框并读取内容
 */
async function openFileDialog(win: BrowserWindow | null): Promise<OpenFileResult | null> {
  const options: OpenDialogOptions = {
    title: '打开 JSON/YAML 文件',
    filters: [
      { name: 'JSON/YAML', extensions: ['json', 'yaml', 'yml'] },
      { name: '所有文件', extensions: ['*'] },
    ],
    properties: ['openFile'],
  }

  const result = win
    ? await dialog.showOpenDialog(win, options)
    : await dialog.showOpenDialog(options)

  if (result.canceled || result.filePaths.length === 0) {
    return null
  }

  const filePath = result.filePaths[0]
  const content = await readFile(filePath, 'utf-8')
  const ext = filePath.split('.').pop()?.toLowerCase() ?? 'json'

  return { filePath, content, format: ext === 'yaml' || ext === 'yml' ? 'yaml' : 'json' }
}

/**
 * 通知渲染进程打开文件
 */
async function triggerOpenFile(): Promise<void> {
  const win = getTargetWindow()
  const file = await openFileDialog(win)
  if (file && win) {
    win.webContents.send('file:opened', file)
  }
}

/**
 * 通知渲染进程执行保存操作
 */
function triggerSave(asNew = false): void {
  const win = getTargetWindow()
  win?.webContents.send('menu:action', asNew ? 'save-as' : 'save')
}

/**
 * 创建应用菜单（File 菜单绑定打开/保存）
 */
function createApplicationMenu(): void {
  const isMac = process.platform === 'darwin'

  const template: Electron.MenuItemConstructorOptions[] = [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about' as const },
              { type: 'separator' as const },
              { role: 'services' as const },
              { type: 'separator' as const },
              { role: 'hide' as const },
              { role: 'hideOthers' as const },
              { role: 'unhide' as const },
              { type: 'separator' as const },
              { role: 'quit' as const },
            ],
          },
        ]
      : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'Open...',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            void triggerOpenFile()
          },
        },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => triggerSave(false),
        },
        {
          label: 'Save As...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => triggerSave(true),
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Window',
      submenu: [{ role: 'minimize' }, { role: 'zoom' }, ...(isMac ? [{ type: 'separator' as const }, { role: 'front' as const }] : [{ role: 'close' as const }])],
    },
  ]

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

/**
 * 创建应用主窗口
 */
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'NodeView',
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    backgroundColor: '#1e1e1e',
  })

  // 开发环境加载 Vite 开发服务器，生产环境加载打包后的 HTML
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// 应用就绪后创建菜单和窗口
app.whenReady().then(() => {
  createApplicationMenu()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

/**
 * IPC：打开文件对话框并读取内容
 */
ipcMain.handle('dialog:openFile', async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  return openFileDialog(win)
})

/**
 * IPC：保存文件（覆盖已有路径）
 */
ipcMain.handle('file:save', async (_event, filePath: string, content: string) => {
  await writeFile(filePath, content, 'utf-8')
  return { success: true, filePath }
})

/**
 * IPC：另存为对话框
 */
ipcMain.handle('dialog:saveFileAs', async (event, content: string, format: 'json' | 'yaml') => {
  const win = BrowserWindow.fromWebContents(event.sender)
  const options: SaveDialogOptions = {
    title: '另存为',
    filters: [
      {
        name: format === 'yaml' ? 'YAML' : 'JSON',
        extensions: format === 'yaml' ? ['yaml', 'yml'] : ['json'],
      },
    ],
    defaultPath: `untitled.${format === 'yaml' ? 'yaml' : 'json'}`,
  }

  const result = win
    ? await dialog.showSaveDialog(win, options)
    : await dialog.showSaveDialog(options)

  if (result.canceled || !result.filePath) {
    return null
  }

  await writeFile(result.filePath, content, 'utf-8')
  return { success: true, filePath: result.filePath }
})
