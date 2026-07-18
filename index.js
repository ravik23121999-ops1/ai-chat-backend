const path = require('path');
const fs = require('fs');

const entry = path.join(__dirname, 'dist', 'index.js');

if (!fs.existsSync(entry)) {
  process.exit(1);
}

require(entry);
