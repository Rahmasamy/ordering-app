const fs = require('fs');
const path = require('path');
const srcDir = path.join('E:/side-projects/ordering-app/ordering-app-frontend', 'src');
const modules = ['CustomerPortal', 'MenuBuilder', 'MerchantDashboard'];
modules.forEach(mod => {
  const compDir = path.join(srcDir, 'modules', mod, 'components');
  if (fs.existsSync(compDir)) {
    let exports = [];
    const items = fs.readdirSync(compDir);
    items.forEach(item => {
      if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        const baseName = item.replace(/\.tsx?$/, '');
        exports.push(`export { default as ${baseName} } from './components/${baseName}';`);
      }
    });
    fs.writeFileSync(path.join(srcDir, 'modules', mod, 'index.ts'), exports.join('\n'));
    console.log(`Updated barrel file for ${mod}`);
  }
});
