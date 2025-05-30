#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Ensure dist directory exists
const distDir = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

// Copy built files from sql.js/dist to our dist directory
const sqlJsDistDir = path.join(__dirname, '..', 'sql.js', 'dist');
const files = [
    'sql-wasm.js',
    'sql-wasm.wasm'
];

console.log('📦 Building fts5-sql-bundle package...');

for (const file of files) {
    const srcPath = path.join(sqlJsDistDir, file);
    const destPath = path.join(distDir, file);

    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`✅ Copied ${file}`);
    } else {
        console.error(`❌ Source file not found: ${srcPath}`);
        process.exit(1);
    }
}

// Create TypeScript definition file
const dtsContent = `
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
`;

fs.writeFileSync(path.join(distDir, 'index.d.ts'), dtsContent.trim());
console.log('✅ Created TypeScript definitions');

// Create main index.js file
const indexContent = `
const path = require('path');

// For Node.js environments, we need to locate the WASM file
function locateFile(filename) {
  if (filename === 'sql-wasm.wasm') {
    return path.join(__dirname, 'sql-wasm.wasm');
  }
  return filename;
}

// Load the sql-wasm.js module
const initSqlJs = require('./sql-wasm.js');

// Export a function that initializes SQL.js with FTS5 support
module.exports = function(options = {}) {
  // Provide default locateFile function for Node.js
  if (typeof window === 'undefined' && !options.locateFile) {
    options.locateFile = locateFile;
  }
  
  return initSqlJs(options);
};

// Also export as default for ES modules
module.exports.default = module.exports;
`;

fs.writeFileSync(path.join(distDir, 'index.js'), indexContent.trim());
console.log('✅ Created main index.js');

// Get file sizes for display
const wasmSize = fs.statSync(path.join(distDir, 'sql-wasm.wasm')).size;
const jsSize = fs.statSync(path.join(distDir, 'sql-wasm.js')).size;

console.log(`
📊 Build Summary:
   WASM file: ${(wasmSize / 1024 / 1024).toFixed(2)} MB
   JS file:   ${(jsSize / 1024).toFixed(2)} KB
   
🎉 Package built successfully with FTS5 support!
   
💡 Features included:
   ✅ Full-text search with FTS5
   ✅ BM25 ranking function
   ✅ Advanced query syntax
   ✅ Unicode support
   ✅ Browser and Node.js compatibility
`); 