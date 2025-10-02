const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SERVICE_WORKER_PATH = path.join(process.cwd(), 'public', 'service-worker.js');

/**
 * Auto update CACHE_VERSION in service worker
 * Uses timestamp to ensure version always increases
 */
function updateCacheVersion() {
  try {
    // Read service-worker.js file
    if (!fs.existsSync(SERVICE_WORKER_PATH)) {
      console.error('❌ Error: service-worker.js not found at:', SERVICE_WORKER_PATH);
      process.exit(1);
    }

    let content = fs.readFileSync(SERVICE_WORKER_PATH, 'utf8');
    
    // Create new version based on timestamp
    const timestamp = Date.now();
    const newVersion = Math.floor(timestamp / 1000); // Use Unix timestamp (seconds)
    
    // Find and replace CACHE_VERSION
    const cacheVersionRegex = /const\s+CACHE_VERSION\s*=\s*\d+;/;
    const newCacheVersionLine = `const CACHE_VERSION = ${newVersion};`;
    
    if (cacheVersionRegex.test(content)) {
      const oldContent = content;
      content = content.replace(cacheVersionRegex, newCacheVersionLine);
      
      // Write back to file
      fs.writeFileSync(SERVICE_WORKER_PATH, content, 'utf8');
      
      // Get old version for logging
      const oldVersionMatch = oldContent.match(/const\s+CACHE_VERSION\s*=\s*(\d+);/);
      const oldVersion = oldVersionMatch ? oldVersionMatch[1] : 'unknown';
      
      console.log('✅ Cache version updated successfully!');
      console.log(`   From: ${oldVersion}`);
      console.log(`   To: ${newVersion}`);
      console.log(`   Time: ${new Date().toLocaleString()}`);
      
      // Try to get git commit info (if available)
      try {
        const gitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
        const gitBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
        console.log(`   Git: ${gitBranch}@${gitHash}`);
      } catch (gitError) {
        // Skip if no git
        console.log('   Git: Not available');
      }
      
    } else {
      console.error('❌ Error: CACHE_VERSION not found in service-worker.js');
      console.error('   Make sure file has line: const CACHE_VERSION = <number>;');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error updating cache version:', error.message);
    process.exit(1);
  }
}

// Run if file is called directly
if (require.main === module) {
  updateCacheVersion();
}

module.exports = updateCacheVersion;
