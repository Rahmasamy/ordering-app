const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const viewToPath = {
  'customer-home': '/',
  'customer-detail': '/product/:id',
  'customer-checkout': '/checkout',
  'customer-confirmation': '/confirmation',
  'customer-offers': '/offers',
  'customer-privacy': '/privacy',
  'customer-faq': '/faq',
  'merchant-dashboard': '/merchant',
  'merchant-catalog': '/merchant/catalog',
  'merchant-branches': '/merchant/branches',
  'merchant-wizard': '/merchant/wizard',
  'merchant-team': '/merchant/team',
  'merchant-analytics': '/merchant/analytics',
  'merchant-login': '/merchant/login'
};

function refactorFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // 1. If uses setCurrentView, import useNavigate from react-router-dom
  if (content.includes('setCurrentView')) {
    if (!content.includes("import { useNavigate } from 'react-router-dom';")) {
      // add after react import
      content = content.replace(/(import React.*?;\n)/, "$1import { useNavigate } from 'react-router-dom';\n");
    }
  }

  // 2. Replace const { ... setCurrentView ... } = useAppState()
  // This is tricky, we'll just extract setCurrentView from useAppState
  content = content.replace(/,\s*setCurrentView/g, '');
  content = content.replace(/setCurrentView,\s*/g, '');
  content = content.replace(/const\s*{\s*setCurrentView\s*}\s*=\s*useAppState\(\);/g, '');

  // 3. Add const navigate = useNavigate(); inside the component.
  // Find component function definition and insert const navigate = useNavigate();
  // We'll use a heuristic: find "const { cart" or "const { foodItems" and put it before.
  if (original.includes('setCurrentView') && !original.includes('useNavigate()')) {
    content = content.replace(/(const {.*?useAppState\(\);)/s, "const navigate = useNavigate();\n  $1");
  }

  // 4. Replace setCurrentView('some-view') with navigate('/some/path')
  for (const [view, urlPath] of Object.entries(viewToPath)) {
    const regex = new RegExp(`setCurrentView\\(['"\`]${view}['"\`]\\)`, 'g');
    let replacement = `navigate('${urlPath}')`;
    
    // Special case for customer-detail
    if (view === 'customer-detail') {
      content = content.replace(/setCurrentView\('customer-detail'\)/g, "navigate(`/product/${item.id}`)");
    } else {
      content = content.replace(regex, replacement);
    }
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Refactored navigation in ${filePath}`);
  }
}

function traverse(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverse(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      refactorFile(fullPath);
    }
  }
}

traverse(path.join(srcDir, 'modules'));
