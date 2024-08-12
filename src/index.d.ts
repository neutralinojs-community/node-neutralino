// Types for node-neutralino package

import { Manifest } from "./types/api/updater";
import {
  Envs,
  ExecCommandOptions,
  ExecCommandResult,
  FolderDialogOptions,
  KnownPath,
  OpenDialogOptions,
  SaveDialogOptions,
  SpawnedProcess,
  TrayOptions,
} from "./types/api/os";
import {
  CopyOptions,
  DirectoryEntry,
  DirectoryReaderOptions,
  FileReaderOptions,
  OpenedFile,
  Stats,
  Watcher,
} from "./types/api/filesystem";
import { ExtensionStats } from "./types/api/extensions";
import {
  CPUInfo,
  Display,
  KernelInfo,
  MemoryInfo,
  MousePosition,
  OSInfo,
} from "./types/api/computer";
import { ClipboardImage } from "./types/api/clipboard";
import {
  WindowOptions,
  WindowPosOptions,
  WindowSizeOptions,
} from "./types/api/window";
import {
  ClipboardFormat,
  Icon,
  LoggerType,
  MessageBoxChoice,
} from "./types/enums";


declare class NeutralinoApp {
  constructor({
    url,
    windowOptions,
  }: {
    url: string;
    windowOptions?: WindowOptions;
  });
  init(): void;
  close(): void;

  // ----------------- Native Methods -----------------

  exit(code?: number): Promise<void>;
  killProcess(): Promise<void>;
  getConfig(): Promise<any>;
  broadcast(event: string, data?: any): Promise<void>;
  readProcessInput(readAll?: boolean): Promise<string>;
  writeProcessOutput(data: string): Promise<void>;
  writeProcessError(data: string): Promise<void>;

  // ------------ clipboard ------------

  clipboard: {
    getFormat(): Promise<ClipboardFormat>;
    readText(): Promise<string>;
    readImage(): Promise<ClipboardImage | null>;
    writeText(data: string): Promise<void>;
    writeImage(image: ClipboardImage): Promise<void>;
    clear(): Promise<void>;
  };

  // ------------ computer ------------

  computer: {
    getMemoryInfo(): Promise<MemoryInfo>;
    getArch(): Promise<string>;
    getKernelInfo(): Promise<KernelInfo>;
    getOSInfo(): Promise<OSInfo>;
    getCPUInfo(): Promise<CPUInfo>;
    getDisplays(): Promise<Display[]>;
    getMousePosition(): Promise<MousePosition>;
  };

  // ------------ custom ------------

  custom: {
    getMethods(): Promise<string[]>;
  };

  // ------------ debug ------------

  debug: {
    log(message: string, type?: LoggerType): Promise<void>;
  };

  // ------------ events ------------

  events: {
    broadcast(event: string, data?: any): Promise<void>;
    on(event: string, handler: (ev: CustomEvent) => void): Promise<Response>;
    off(event: string, handler: (ev: CustomEvent) => void): Promise<Response>;
    dispatch(event: string, data?: any): Promise<Response>;
  };

  // ------------ extensions ------------

  extensions: {
    dispatch(extensionId: string, event: string, data?: any): Promise<void>;
    broadcast(event: string, data?: any): Promise<void>;
    getStats(): Promise<ExtensionStats>;
  };

  // ------------ filesystem ------------

  filesystem: {
    createDirectory(path: string): Promise<void>;
    remove(path: string): Promise<void>;
    writeFile(path: string, data: string): Promise<void>;
    appendFile(path: string, data: string): Promise<void>;
    writeBinaryFile(path: string, data: ArrayBuffer): Promise<void>;
    appendBinaryFile(path: string, data: ArrayBuffer): Promise<void>;
    readFile(path: string, options?: FileReaderOptions): Promise<string>;
    readBinaryFile(
      path: string,
      options?: FileReaderOptions
    ): Promise<ArrayBuffer>;
    openFile(path: string): Promise<number>;
    createWatcher(path: string): Promise<number>;
    removeWatcher(id: number): Promise<number>;
    getWatchers(): Promise<Watcher[]>;
    updateOpenedFile(id: number, event: string, data?: any): Promise<void>;
    getOpenedFileInfo(id: number): Promise<OpenedFile>;
    readDirectory(
      path: string,
      options?: DirectoryReaderOptions
    ): Promise<DirectoryEntry[]>;
    copy(
      source: string,
      destination: string,
      options?: CopyOptions
    ): Promise<void>;
    move(source: string, destination: string): Promise<void>;
    getStats(path: string): Promise<Stats>;
  };

  // ------------ os ------------

  os: {
    execCommand(
      command: string,
      options?: ExecCommandOptions
    ): Promise<ExecCommandResult>;
    spawnProcess(command: string, cwd?: string): Promise<SpawnedProcess>;
    updateSpawnedProcess(id: number, event: string, data?: any): Promise<void>;
    getSpawnedProcesses(): Promise<SpawnedProcess[]>;
    getEnv(key: string): Promise<string>;
    getEnvs(): Promise<Envs>;
    showOpenDialog(
      title?: string,
      options?: OpenDialogOptions
    ): Promise<string[]>;
    showFolderDialog(
      title?: string,
      options?: FolderDialogOptions
    ): Promise<string>;
    showSaveDialog(
      title?: string,
      options?: SaveDialogOptions
    ): Promise<string>;
    showNotification(
      title: string,
      content: string,
      icon?: Icon
    ): Promise<void>;
    showMessageBox(
      title: string,
      content: string,
      choice?: MessageBoxChoice,
      icon?: Icon
    ): Promise<string>;
    setTray(options: TrayOptions): Promise<void>;
    open(url: string): Promise<void>;
    getPath(name: KnownPath): Promise<string>;
  };

  // ------------ storage ------------

  storage: {
    setData(key: string, data: string): Promise<void>;
    getData(key: string): Promise<string>;
    getKeys(): Promise<string[]>;
  };

  // ------------ updater ------------

  updater: {
    checkForUpdates(url: string): Promise<Manifest>;
    install(manifest: Manifest): Promise<void>;
  };

  // ------------ window ------------

  window: {
    setTitle(title: string): Promise<void>;
    getTitle(): Promise<string>;
    maximize(): Promise<void>;
    unmaximize(): Promise<void>;
    isMaximized(): Promise<boolean>;
    minimize(): Promise<void>;
    setFullScreen(): Promise<void>;
    exitFullScreen(): Promise<void>;
    isFullScreen(): Promise<boolean>;
    show(): Promise<void>;
    hide(): Promise<void>;
    isVisible(): Promise<boolean>;
    focus(): Promise<void>;
    setIcon(icon: string): Promise<void>;
    move(x: number, y: number): Promise<void>;
    center(): Promise<void>;
    setDraggableRegion(domElementOrId: string | HTMLElement): Promise<void>;
    unsetDraggableRegion(domElementOrId: string | HTMLElement): Promise<void>;
    setSize(options: WindowSizeOptions): Promise<void>;
    getSize(): Promise<WindowSizeOptions>;
    getPosition(): Promise<WindowPosOptions>;
    setAlwaysOnTop(onTop: boolean): Promise<void>;
  };
}

export default NeutralinoApp;
