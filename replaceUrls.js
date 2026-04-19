const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let original = content;

  // Replace 'http://localhost:5000/api/...' or "http://localhost:5000/api/..."
  content = content.replace(/['"]http:\/\/localhost:5000\/api(.*?)['"]/g, "import.meta.env.VITE_API_URL + '$1'");

  // Replace `http://localhost:5000/api/...`
  content = content.replace(/`http:\/\/localhost:5000\/api(.*?)`/g, "`\\${import.meta.env.VITE_API_URL}$1`");

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('Updated:', filePath);
  }
}

function traverseDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverseDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      replaceInFile(fullPath);
    }
  }
}

const targetDir = path.join(__dirname, 'frontend', 'src');
console.log('Traversing:', targetDir);
traverseDir(targetDir);

// Create or update .env in frontend directory
const envPath = path.join(__dirname, 'frontend', '.env');
const envContent = `VITE_API_URL=http://localhost:5000/api
`;
fs.writeFileSync(envPath, envContent, 'utf-8');
console.log('Created frontend/.env');
