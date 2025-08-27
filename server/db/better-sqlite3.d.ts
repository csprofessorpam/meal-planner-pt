declare module 'better-sqlite3' {
  interface Options {
    readonly memory?: boolean;
    readonly readonly?: boolean;
    readonly fileMustExist?: boolean;
    readonly timeout?: number;
    readonly verbose?: (...args: any[]) => void;
  }

  class Database {
    constructor(filename: string, options?: Options);
    pragma(command: string, options?: { simple?: boolean }): any;
    exec(sql: string): any;
    prepare(sql: string): any;
    close(): void;
  }

  export default Database;
}
