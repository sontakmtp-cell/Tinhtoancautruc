const fs = require('fs');
const path = require('path');

/**
 * Setup Git pre-commit hook để tự động update cache version
 */
function setupGitHook() {
  try {
    const hookSource = path.join(process.cwd(), 'scripts', 'pre-commit-hook.sh');
    const hookTarget = path.join(process.cwd(), '.git', 'hooks', 'pre-commit');
    
    // Kiểm tra .git folder có tồn tại không
    if (!fs.existsSync(path.join(process.cwd(), '.git'))) {
      console.log('ℹ️  This is not a Git repository. Git hook setup skipped.');
      return;
    }
    
    // Kiểm tra source hook file có tồn tại không
    if (!fs.existsSync(hookSource)) {
      console.error('❌ Hook source file not found:', hookSource);
      return;
    }
    
    // Copy hook file
    fs.copyFileSync(hookSource, hookTarget);
    
    // Trên Windows, không cần chmod, nhưng trên Unix cần
    try {
      const { execSync } = require('child_process');
      execSync(`chmod +x "${hookTarget}"`, { stdio: 'ignore' });
    } catch (chmodError) {
      // Bỏ qua lỗi chmod trên Windows
    }
    
    console.log('✅ Git pre-commit hook installed successfully!');
    console.log('   Now cache version will auto-update before each commit.');
    console.log('   To disable: remove .git/hooks/pre-commit file');
    
  } catch (error) {
    console.error('❌ Error setting up Git hook:', error.message);
  }
}

// Run if file is called directly
if (require.main === module) {
  setupGitHook();
}

module.exports = setupGitHook;
