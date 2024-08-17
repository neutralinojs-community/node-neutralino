import type { frontendLibOptions } from "./frontendLib"

export interface WindowOptions extends WindowSizeOptions, WindowPosOptions {
    title?: string;
    icon?: string;
    fullScreen?: boolean;
    alwaysOnTop?: boolean;
    enableInspector?: boolean;
    borderless?: boolean;
    maximize?: boolean;
    hidden?: boolean;
    maximizable?: boolean;
    useSavedState?: boolean;
    exitProcessOnClose?: boolean;
    extendUserAgentWith?: string;
    processArgs?: string;
    frontendLibrary?: frontendLibOptions
  }
  
  export interface WindowSizeOptions {
    width?: number;
    height?: number;
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    resizable?: boolean;
  }
  
  export interface WindowPosOptions {
    x?: number;
    y?: number;
  }