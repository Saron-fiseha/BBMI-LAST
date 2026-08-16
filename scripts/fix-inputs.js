const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\user\\Documents\\BBMI-LAST-main (1)\\BBMI-LAST-main\\app\\admin';

function processDir(dirPath) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Match value={something}
      let modified = content.replace(/value=\{((?:new|editing)[A-Za-z0-9]+\.[a-zA-Z0-9_]+)\}/g, (match, p1) => {
        // We only want to add || "" if it's likely a string/number field
        return `value={${p1} || ""}`;
      });

      if (content !== modified) {
        fs.writeFileSync(fullPath, modified);
        console.log(`Modified ${fullPath}`);
      }
    }
  }
}
processDir(dir);
