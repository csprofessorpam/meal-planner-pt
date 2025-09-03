declare module 'better-sqlite3' {
  interface DatabaseOptions {
    readonly memory?: boolean;
    readonly readonly?: boolean;
    readonly fileMustExist?: boolean;
    readonly timeout?: number;
  }

  class Database {
    constructor(filename: string, options?: DatabaseOptions);

    prepare(sql: string): any;
    exec(sql: string): any;
    transaction(fn: () => any): any;

    close(): void;       // <-- add this
    pragma(pragma: string, options?: any): any; // optional
  }

  export default Database;
}



// declare module 'better-sqlite3' {
//   interface DatabaseOptions {
//     memory?: boolean;
//     readonly?: boolean;
//     fileMustExist?: boolean;
//     timeout?: number;
//   }

//   class Database {
//     constructor(filename: string, options?: DatabaseOptions);
//     prepare(sql: string): any;
//     // add more methods you use if needed
//   }

//   export default Database;
// }
