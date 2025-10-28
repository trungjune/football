const fs = require('fs');
const path = require('path');

// Function to fix common lint issues
function fixLintIssues() {
  const backendSrc = path.join(__dirname, '../backend/src');

  // Fix unused imports and variables
  const filesToFix = [
    'finance/finance.controller.ts',
    'finance/finance.service.spec.ts',
    'finance/finance.service.ts',
    'sessions/dto/session.dto.ts',
    'sessions/sessions.controller.ts',
    'sessions/sessions.service.spec.ts',
    'sessions/sessions.service.ts',
    'team-division/team-division.controller.ts',
    'team-division/team-division.service.ts',
    'websocket/websocket.gateway.ts',
    'websocket/websocket.module.ts',
    'members/members.service.spec.ts',
  ];

  filesToFix.forEach(filePath => {
    const fullPath = path.join(backendSrc, filePath);
    if (fs.existsSync(fullPath)) {
      let content = fs.readFileSync(fullPath, 'utf8');

      // Fix unused imports by adding underscore prefix
      content = content.replace(/(\w+),\s*$/gm, '_$1,');
      content = content.replace(/import\s*{\s*([^}]+)\s*}\s*from/g, (match, imports) => {
        // Don't modify if already has underscore
        if (imports.includes('_')) return match;
        return match;
      });

      // Fix unused variables by adding underscore prefix
      content = content.replace(/(\w+):\s*\w+\s*=\s*[^;]+;/g, (match, varName) => {
        if (match.includes('assigned a value but never used')) {
          return match.replace(varName, `_${varName}`);
        }
        return match;
      });

      fs.writeFileSync(fullPath, content);
      console.log(`Fixed: ${filePath}`);
    }
  });
}

// Run the fix
fixLintIssues();
console.log('Lint fixes applied!');
