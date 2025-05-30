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