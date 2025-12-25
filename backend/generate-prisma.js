const { execSync } = require('child_process');
const path = require('path');

try {
  const prismaPath = path.join(__dirname, 'node_modules', '.bin', 'prisma');
  execSync(`"${prismaPath}" generate`, { stdio: 'inherit', cwd: __dirname });
  console.log('Prisma client generated successfully');
} catch (error) {
  console.error('Failed to generate Prisma client:', error.message);
  process.exit(1);
}
