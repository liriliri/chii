declare const chobitsu: {
  sendRawMessage(message: string): void;
  sendMessage(method: string, params?: any): Promise<any>;
  setOnMessage(onMessage: (message: string) => void): void;
};

export = chobitsu;
