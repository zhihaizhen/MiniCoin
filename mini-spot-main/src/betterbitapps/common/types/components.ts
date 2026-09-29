export interface IMessage {
  info: (v: string) => void;
  success: (v: string) => void;
  warn: (v: string) => void;
  error: (v: string) => void;
}

export interface INotify {
  success: (a: string, b: string) => void;
}

export interface IInputRefObject {
  focus: () => void;
}
