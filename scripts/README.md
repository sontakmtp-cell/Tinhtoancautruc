# Tự động hóa Cache Version cho Service Worker

## Tóm tắt nhanh
✅ **Đã được cài đặt hoàn chỉnh!** Từ giờ, mỗi khi bạn:
- Chạy `npm run build` → Cache version tự động tăng
- Commit code (nếu đã setup Git hook) → Cache version tự động cập nhật
- Deploy lên Vercel → Tự động build với cache version mới

## Scripts có sẵn

```bash
# Cập nhật cache version thủ công
npm run update-cache

# Build với auto-update cache version
npm run build

# Setup Git hook (tự động update khi commit)
npm run setup-git-hook
```

## Cách hoạt động

### 1. Tự động khi Build (✅ Đã active)
- Command: `npm run build`
- Script tự động tăng `CACHE_VERSION` dựa trên Unix timestamp
- Đảm bảo version luôn tăng dần và unique

### 2. Tự động khi Commit (Optional)
- Chạy: `npm run setup-git-hook`
- Mỗi khi commit, cache version sẽ tự động cập nhật
- File service-worker.js tự động được add vào commit

### 3. Deploy lên Vercel (✅ Tự động)
- Vercel chạy `npm run build`
- Cache version tự động được tạo mới cho mỗi deploy
- Người dùng nhận được bản cập nhật ngay lập tức

## Technical Details

### Cache Strategy
- **Navigation requests (HTML)**: Network First → Cache fallback
- **Static assets (CSS/JS/images)**: Cache First → Network update
- **Cache name**: `crane-beam-studio-v{timestamp}`

### Version Format
- Sử dụng Unix timestamp (giây): `1759398922`
- Unique cho mỗi lần chạy script
- Tăng dần theo thời gian

### Files được quản lý
- `public/service-worker.js` - Source file (được cập nhật)
- `dist/service-worker.js` - Build output (tự động tạo khi build)

## Monitoring & Debug

### Kiểm tra version hiện tại
1. DevTools → Application → Service Workers
2. Xem cache name: `crane-beam-studio-v{number}`

### Test cập nhật
```bash
# Test script hoạt động
npm run update-cache

# Kiểm tra thay đổi
git diff public/service-worker.js
```

### Log sample
```
✅ Cache version updated successfully!
   From: 3
   To: 1759398922
   Time: 10/2/2025, 4:55:22 PM
   Git: master@cba4c75
```

## Cấu hình nâng cao

### Tùy chỉnh strategy caching
Sửa trong `public/service-worker.js`:
- Thêm/bớt files trong `urlsToCache`
- Thay đổi caching strategy trong fetch handler

### Sử dụng Git-based version
```bash
# Thay đổi trong package.json
"build": "node scripts/update-cache-version-git.js && vite build"
```

## Troubleshooting

| Vấn đề | Giải pháp |
|--------|-----------|
| Script không chạy | Kiểm tra Node.js version (cần >= 14) |
| Service worker không update | Hard refresh (Ctrl+Shift+R) |
| Cache không clear | Xóa cache trong DevTools |
| Git hook không hoạt động | Chạy lại `npm run setup-git-hook` |

## Backup & Recovery

### Khôi phục version cũ
```bash
# Xem lịch sử thay đổi
git log -p -- public/service-worker.js

# Khôi phục version cụ thể
git checkout <commit-hash> -- public/service-worker.js
```

### Vô hiệu hóa tự động hóa
```bash
# Xóa Git hook
rm .git/hooks/pre-commit

# Sửa package.json để build không auto-update
"build": "vite build"
```
