declare module 'fts5-sql-bundle' {
  interface Database {
    run(sql: string, params?: any[]): void;
    exec(sql: string): Array<{columns: string[], values: any[][]}>;
    prepare(sql: string): Statement;
    export(): Uint8Array;
    close(): void;
    getRowsModified(): number;
    create_function(name: string, func: Function): void;
    create_aggregate(name: string, funcs: {step: Function, finalize: Function}): void;
  }

  interface Statement {
    bind(params?: any[]): boolean;
    step(): boolean;
    get(params?: any[]): any[];
    getColumnNames(): string[];
    getAsObject(params?: any[]): any;
    run(params?: any[]): void;
    reset(): void;
    freemem(): void;
    free(): void;
  }

  interface SqlJsStatic {
    Database: {
      new (): Database;
      new (data: ArrayLike<number>): Database;
    };
  }

  interface InitSqlJsOptions {
    locateFile?: (filename: string) => string;
  }

  function initSqlJs(options?: InitSqlJsOptions): Promise<SqlJsStatic>;
  
  export = initSqlJs;
}