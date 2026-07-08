const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function fixImportsInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Fix API imports
    content = content.replace(/['"](?:\.\.\/)+common\/api['"]/g, "'@/shared/api/api-client'");
    content = content.replace(/['"](?:\.\/)+common\/api['"]/g, "'@/shared/api/api-client'");
    
    // Fix Utils imports
    content = content.replace(/['"](?:\.\.\/)+common\/utils['"]/g, "'@/shared/lib/utils'");
    content = content.replace(/['"](?:\.\/)+common\/utils['"]/g, "'@/shared/lib/utils'");

    // Fix Types imports
    content = content.replace(/['"](?:\.\.\/)+types['"]/g, "'@/shared/types/global.types'");
    content = content.replace(/['"](?:\.\/)+types['"]/g, "'@/shared/types/global.types'");

    // Fix StateContext imports
    content = content.replace(/['"](?:\.\.\/)+features\/StateContext['"]/g, "'@/app/providers/StateContext'");
    content = content.replace(/['"](?:\.\.\/)+StateContext['"]/g, "'@/app/providers/StateContext'");
    content = content.replace(/['"](?:\.\/)+features\/StateContext['"]/g, "'@/app/providers/StateContext'");
    content = content.replace(/['"](?:\.\/)+StateContext['"]/g, "'@/app/providers/StateContext'");
    content = content.replace(/['"]\.\/features\/StateContext['"]/g, "'@/app/providers/StateContext'");

    // Fix App.tsx and main.tsx internal imports
    if (filePath.endsWith('app\\App.tsx') || filePath.endsWith('app/App.tsx')) {
        // App.tsx needs to import from modules instead of features
        content = content.replace(/['"]\.\/features\/customer-portal\/components\/(.*)['"]/g, "'@/modules/CustomerPortal'");
        content = content.replace(/['"]\.\/features\/merchant-dashboard\/components\/(.*)['"]/g, "'@/modules/MerchantDashboard'");
        content = content.replace(/['"]\.\/features\/menu-builder\/components\/(.*)['"]/g, "'@/modules/MenuBuilder'");
        content = content.replace(/['"]\.\/features\/StateContext['"]/g, "'@/app/providers/StateContext'");
    }

    if (filePath.endsWith('app\\main.tsx') || filePath.endsWith('app/main.tsx')) {
        content = content.replace(/['"]\.\/App['"]/g, "'./App'");
        content = content.replace(/['"]\.\/index\.css['"]/g, "'./index.css'");
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated imports in ${filePath}`);
    }
}

function traverse(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverse(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            fixImportsInFile(fullPath);
        }
    }
}

traverse(srcDir);
console.log('Import fixing complete.');
