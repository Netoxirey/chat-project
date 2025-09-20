const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting Chat Application...');

try {
  // Generate Prisma client
  console.log('📦 Generating Prisma client...');
  execSync('npx prisma generate', { 
    cwd: __dirname, 
    stdio: 'inherit' 
  });
  
  console.log('✅ Prisma client generated successfully');
  
  // Start the server
  console.log('🎯 Starting Express server...');
  require('./src/server.js');
  
} catch (error) {
  console.error('❌ Failed to start application:', error.message);
  process.exit(1);
}
