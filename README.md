# fts5-sql-bundle

[![npm version](https://badge.fury.io/js/fts5-sql-bundle.svg)](https://www.npmjs.com/package/fts5-sql-bundle)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

**SQL.js with FTS5 full-text search support** - A custom build of SQL.js that includes the SQLite FTS5 extension for powerful full-text search capabilities in JavaScript.

## ✨ Features

- 🔍 **Full-Text Search** - Advanced search capabilities with FTS5
- 📊 **BM25 Ranking** - Built-in relevance scoring algorithm
- 🎯 **Phrase Queries** - Search for exact phrases with quotes
- 🏷️ **Column Filters** - Search within specific table columns
- 🌐 **Universal** - Works in both Node.js and browser environments
- 📦 **Optimized** - Smaller bundle size than alternatives (~757KB WASM + 100KB JS)
- 🚀 **TypeScript** - Full TypeScript support with included definitions
- 🔧 **Drop-in Replacement** - Compatible with existing SQL.js code

## 📥 Installation

```bash
npm install fts5-sql-bundle
```

## 🚀 Quick Start

### Node.js

```javascript
const initSqlJs = require('fts5-sql-bundle');

async function example() {
    // Initialize SQL.js with FTS5 support
    const SQL = await initSqlJs();
    const db = new SQL.Database();
    
    // Create FTS5 table
    db.run(`
        CREATE VIRTUAL TABLE documents USING fts5(
            title,
            content,
            author
        )
    `);
    
    // Insert data
    db.run(`INSERT INTO documents (title, content, author) VALUES 
        ('Getting Started with SQL', 'Learn the basics of SQL databases', 'John Doe'),
        ('Advanced Search Techniques', 'Full-text search with FTS5 extension', 'Jane Smith')
    `);
    
    // Search with FTS5
    const results = db.exec("SELECT title, content FROM documents WHERE documents MATCH 'SQL'");
    console.log(results);
    
    // Use BM25 ranking
    const ranked = db.exec(`
        SELECT title, bm25(documents) as score 
        FROM documents 
        WHERE documents MATCH 'search' 
        ORDER BY score
    `);
    console.log(ranked);
    
    db.close();
}

example();
```

### Browser (ES Modules)

```javascript
import initSqlJs from 'fts5-sql-bundle';

async function browserExample() {
    const SQL = await initSqlJs({
        locateFile: file => `/path/to/dist/${file}`
    });
    
    const db = new SQL.Database();
    
    // Create and use FTS5 tables...
    db.run('CREATE VIRTUAL TABLE docs USING fts5(content)');
    db.run("INSERT INTO docs VALUES ('Hello world')");
    
    const results = db.exec("SELECT * FROM docs WHERE docs MATCH 'Hello'");
    console.log(results);
}
```

### Browser (Script Tag)

```html
<script src="node_modules/fts5-sql-bundle/dist/index.js"></script>
<script>
    const initSqlJs = window.initSqlJs || require('fts5-sql-bundle');
    
    initSqlJs({
        locateFile: file => `./dist/${file}`
    }).then(SQL => {
        const db = new SQL.Database();
        // Use FTS5 features...
    });
</script>
```

## 📖 FTS5 Usage Examples

### Basic Text Search

```javascript
// Create table
db.run(`
    CREATE VIRTUAL TABLE articles USING fts5(
        title, 
        body, 
        tags
    )
`);

// Insert content
db.run(`INSERT INTO articles VALUES 
    ('SQLite Tutorial', 'Learn SQLite database fundamentals', 'database,tutorial'),
    ('FTS5 Guide', 'Master full-text search with FTS5', 'search,fts5,guide')
`);

// Simple search
const results = db.exec("SELECT title FROM articles WHERE articles MATCH 'SQLite'");
```

### Advanced Queries

```javascript
// Phrase search
const phraseSearch = db.exec(`
    SELECT title FROM articles WHERE articles MATCH '"full-text search"'
`);

// Column-specific search
const columnSearch = db.exec(`
    SELECT title FROM articles WHERE articles MATCH 'tags:tutorial'
`);

// Boolean operators
const booleanSearch = db.exec(`
    SELECT title FROM articles WHERE articles MATCH 'SQLite AND tutorial'
`);

// Prefix matching
const prefixSearch = db.exec(`
    SELECT title FROM articles WHERE articles MATCH 'databa*'
`);
```

### Relevance Ranking

```javascript
// BM25 ranking (lower scores = higher relevance)
const rankedResults = db.exec(`
    SELECT 
        title, 
        bm25(articles) as relevance_score,
        snippet(articles, 1, '<mark>', '</mark>', '...', 32) as snippet
    FROM articles 
    WHERE articles MATCH 'database tutorial' 
    ORDER BY bm25(articles)
    LIMIT 10
`);
```

### Highlighting and Snippets

```javascript
// Highlight matching terms
const highlighted = db.exec(`
    SELECT 
        title,
        highlight(articles, 0, '<strong>', '</strong>') as highlighted_title,
        snippet(articles, 1, '<em>', '</em>', '...', 50) as content_snippet
    FROM articles 
    WHERE articles MATCH 'SQLite'
`);
```

## 🏗️ Building from Source

This package includes pre-built binaries, but you can rebuild from source:

```bash
# Clone repository
git clone https://github.com/TimRl/fts5-sql-bundle.git
cd fts5-sql-bundle

# Install dependencies
npm install

# Build (requires Docker)
npm run build

# Test
npm test
```

### Build Requirements

- **Docker** - Used for consistent build environment
- **Node.js 14+** - For build scripts and testing
- **Make** - Build system (runs inside Docker container)

The build process:
1. Clones the official sql.js repository
2. Modifies the Makefile to enable FTS5 (`-DSQLITE_ENABLE_FTS5`)
3. Builds using Emscripten in a Docker container
4. Packages the results for npm distribution

## 📦 Package Contents

```
dist/
├── index.js          # Main entry point
├── index.d.ts        # TypeScript definitions
├── sql-wasm.js       # SQL.js JavaScript (~100KB)
└── sql-wasm.wasm     # SQLite WASM binary (~757KB)
```

## 🆚 Comparison

| Feature | sql.js | sql.js-fts5 | **fts5-sql-bundle** |
|---------|--------|-------------|-------------------|
| FTS5 Support | ❌ | ✅ | ✅ |
| Bundle Size | ~2.4MB | ~1.7MB | **~857KB** |
| Maintenance | Active | Limited | **Active** |
| TypeScript | ✅ | ⚠️ | ✅ |
| Node.js Support | ✅ | ⚠️ | ✅ |
| Browser Support | ✅ | ✅ | ✅ |

## 🔧 API Reference

This package exports the same API as SQL.js, with additional FTS5 capabilities:

### `initSqlJs(options?): Promise<SqlJsStatic>`

Initialize SQL.js with FTS5 support.

**Options:**
- `locateFile?: (filename: string) => string` - Function to locate WASM files

### FTS5 SQL Functions

- `MATCH` - Full-text search operator
- `bm25(table)` - BM25 relevance scoring
- `highlight(table, column, start, end)` - Highlight matching terms
- `snippet(table, column, start, end, ellipsis, tokens)` - Generate content snippets

### FTS5 Query Syntax

- `word` - Search for word
- `"phrase"` - Search for exact phrase
- `word*` - Prefix search
- `column:word` - Column-specific search
- `word AND other` - Boolean AND
- `word OR other` - Boolean OR
- `word NOT other` - Boolean NOT
- `(word OR other) AND third` - Grouped expressions

## 🧪 Testing

Run the test suite to verify FTS5 functionality:

```bash
npm test
```

The tests verify:
- ✅ FTS5 table creation
- ✅ Full-text search queries
- ✅ BM25 ranking functions
- ✅ Phrase and column searches
- ✅ WASM loading in Node.js

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

ISC License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [sql.js](https://github.com/sql-js/sql.js) - The original SQL.js project
- [SQLite](https://sqlite.org/) - The SQLite database engine
- [FTS5](https://www.sqlite.org/fts5.html) - SQLite's full-text search extension

## 📚 Related Projects

- [sql.js](https://www.npmjs.com/package/sql.js) - Original SQL.js without FTS5
- [better-sqlite3](https://www.npmjs.com/package/better-sqlite3) - Native SQLite for Node.js
- [sqlite-wasm](https://www.npmjs.com/package/sqlite-wasm) - Alternative SQLite WASM build

---

**Made with ❤️ for the JavaScript community**