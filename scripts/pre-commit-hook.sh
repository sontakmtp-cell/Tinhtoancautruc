#!/bin/sh

# Git pre-commit hook để tự động cập nhật cache version
# Copy file này vào .git/hooks/pre-commit (không có extension)
# Và cho phép execute: chmod +x .git/hooks/pre-commit

echo "🔄 Auto-updating cache version before commit..."

# Chạy script update cache version
node scripts/update-cache-version.cjs

# Kiểm tra có thay đổi nào không
if git diff --quiet public/service-worker.js; then
  echo "ℹ️  No cache version changes needed"
else
  echo "✅ Cache version updated, adding to commit..."
  git add public/service-worker.js
fi

echo "🚀 Ready to commit!"
