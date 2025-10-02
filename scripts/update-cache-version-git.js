#!/usr/bin/env node

/**
 * Script tạo cache version dựa trên Git commit hash
 * Đây là giải pháp ổn định hơn timestamp cho production
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const SERVICE_WORKER_PATH = path.join(process.cwd(), 'public', 'service-worker.js');

function updateCacheVersionWithGit() {
  try {
    // Lấy git commit hash
    let version;
    try {
      const gitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
      const gitTimestamp = execSync('git log -1 --format=%ct', { encoding: 'utf8' }).trim();
      version = parseInt(gitTimestamp); // Sử dụng commit timestamp
      console.log(`📋 Git commit: ${gitHash}`);
    } catch (gitError) {
      // Fallback về timestamp nếu không có git
      version = Math.floor(Date.now() / 1000);
      console.log('⚠️  Không tìm thấy Git, sử dụng timestamp hiện tại');
    }

    // Đọc và cập nhật service worker
    if (!fs.existsSync(SERVICE_WORKER_PATH)) {
      console.error('❌ Không tìm thấy service-worker.js');
      process.exit(1);
    }

    let content = fs.readFileSync(SERVICE_WORKER_PATH, 'utf8');
    const cacheVersionRegex = /const\s+CACHE_VERSION\s*=\s*\d+;/;
    
    if (!cacheVersionRegex.test(content)) {
      console.error('❌ Không tìm thấy CACHE_VERSION trong service-worker.js');
      process.exit(1);
    }

    // Lấy version cũ
    const oldVersionMatch = content.match(/const\s+CACHE_VERSION\s*=\s*(\d+);/);
    const oldVersion = oldVersionMatch ? oldVersionMatch[1] : 'unknown';

    // Cập nhật version mới
    content = content.replace(cacheVersionRegex, `const CACHE_VERSION = ${version};`);
    fs.writeFileSync(SERVICE_WORKER_PATH, content, 'utf8');

    console.log('✅ Cache version đã được cập nhật:');
    console.log(`   ${oldVersion} → ${version}`);
    console.log(`   Thời gian: ${new Date().toLocaleString('vi-VN')}`);

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
}

// Export để có thể import từ script khác
export default updateCacheVersionWithGit;

// Chạy nếu được gọi trực tiếp
if (import.meta.url === `file://${process.argv[1]}`) {
  updateCacheVersionWithGit();
}
