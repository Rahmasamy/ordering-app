const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const dirsToCreate = [
  'app/providers',
  'compositions',
  'modules/CustomerPortal/components',
  'modules/MenuBuilder/components',
  'modules/MerchantDashboard/components',
  'shared/api',
  'shared/lib',
  'shared/types',
  'shared/components'
];

dirsToCreate.forEach(dir => {
  fs.mkdirSync(path.join(srcDir, dir), { recursive: true });
});

const moves = [
  { from: 'common/api.ts', to: 'shared/api/api-client.ts' },
  { from: 'common/utils.ts', to: 'shared/lib/utils.ts' },
  { from: 'types.ts', to: 'shared/types/global.types.ts' },
  { from: 'features/StateContext.tsx', to: 'app/providers/StateContext.tsx' },
  { from: 'index.css', to: 'app/index.css' },
  { from: 'main.tsx', to: 'app/main.tsx' },
  { from: 'App.tsx', to: 'app/App.tsx' }
];

moves.forEach(move => {
  const fromPath = path.join(srcDir, move.from);
  const toPath = path.join(srcDir, move.to);
  if (fs.existsSync(fromPath)) {
    fs.renameSync(fromPath, toPath);
    console.log(`Moved ${move.from} to ${move.to}`);
  }
});

// Move features directories
const featureMoves = [
  { from: 'features/customer-portal', to: 'modules/CustomerPortal/components' },
  { from: 'features/menu-builder', to: 'modules/MenuBuilder/components' },
  { from: 'features/merchant-dashboard', to: 'modules/MerchantDashboard/components' }
];

featureMoves.forEach(move => {
  const fromPath = path.join(srcDir, move.from);
  const toPath = path.join(srcDir, move.to);
  if (fs.existsSync(fromPath)) {
    // If the components directory exists, move contents inside it
    const items = fs.readdirSync(fromPath);
    items.forEach(item => {
      fs.renameSync(path.join(fromPath, item), path.join(toPath, item));
    });
    fs.rmdirSync(fromPath);
    console.log(`Moved contents of ${move.from} to ${move.to}`);
  }
});

// Remove old directories
if (fs.existsSync(path.join(srcDir, 'common'))) fs.rmdirSync(path.join(srcDir, 'common'));
if (fs.existsSync(path.join(srcDir, 'features'))) fs.rmdirSync(path.join(srcDir, 'features'));

// Generate index.ts barrel files for modules
const modules = ['CustomerPortal', 'MenuBuilder', 'MerchantDashboard'];
modules.forEach(mod => {
  const compDir = path.join(srcDir, 'modules', mod, 'components');
  if (fs.existsSync(compDir)) {
    let exports = [];
    
    // Recursive read directory
    function readFiles(dir, relativePath = '') {
        const items = fs.readdirSync(dir);
        items.forEach(item => {
            const stat = fs.statSync(path.join(dir, item));
            if (stat.isDirectory()) {
                readFiles(path.join(dir, item), path.join(relativePath, item));
            } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
                const baseName = item.replace(/\.tsx?$/, '');
                const filePath = relativePath ? `${relativePath}/${baseName}` : baseName;
                // If it starts with a backslash due to path.join, replace it with forward slash
                const posixPath = filePath.replace(/\\/g, '/');
                exports.push(`export { default as ${baseName} } from './components/${posixPath}';`);
            }
        });
    }
    
    readFiles(compDir);
    
    fs.writeFileSync(path.join(srcDir, 'modules', mod, 'index.ts'), exports.join('\n'));
    console.log(`Created barrel file for ${mod}`);
  }
});

// Update index.html to point to src/app/main.tsx
const indexHtmlPath = path.join(__dirname, 'index.html');
if (fs.existsSync(indexHtmlPath)) {
    let html = fs.readFileSync(indexHtmlPath, 'utf8');
    html = html.replace('/src/main.tsx', '/src/app/main.tsx');
    fs.writeFileSync(indexHtmlPath, html);
    console.log('Updated index.html');
}

console.log('File restructuring complete.');
