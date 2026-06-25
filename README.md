# JuNo.21 - 夏至原點 Blog System

這是一個使用 Next.js 15 (App Router) + Payload CMS 3.0 打造的全端現代化部落格平台。

## 📍 網站架構與重要網址 (URLs & Ports)

整個系統（前端與 Payload 後台）都運行在同一個 Next.js 應用程式中。

### 開發環境 (Development)
- **Localhost**: `http://localhost:3000`
- **區域網路**: `http://192.168.50.143:3000` (依照你的 IP 而定)

### 正式環境 (Production)
- **主網址**: `https://juno21.com`

### 網頁路由 (Routes)
- `/` - 網站首頁
- `/blog` - 所有文章列表
- `/post/[slug]` - 單篇文章頁面
- `/studio` - 前端作者登入頁
- `/my-posts` - 前端文章管理與儀表板 (需登入)
- `/write` - 前端寫作編輯器 (需登入)
- `/newsletter` - 前端發送電子報 (需登入)
- `/admin` - Payload CMS 官方進階後台 (開發與管理用)
- `/api` - Payload API 與自訂 API 路由

---

## 🎨 圖片尺寸與製圖規範 (Image Guidelines)

為了讓前端版面達到最完美的視覺平衡，建議在製圖時遵循以下尺寸規範：

### 1. 文章開頭圖片 (Hero / Cover Image)
- **建議尺寸**: `1200 x 630 px` (比例約 1.9:1)
- **說明**: 這是標準的 Open Graph (OG) 比例。使用這個尺寸不僅能在文章開頭呈現完美的橫幅視覺，當你把文章分享到 Facebook、LINE 或 Twitter 時，連結縮圖才不會被裁切到。

### 2. 內文圖片 (Inline Content Images)
- **建議尺寸**: 寬度建議至少 `1200 px`，高度可依照照片原始比例（例如 `1200 x 800 px` 的 3:2 照片）。
- **說明**: 內文圖片通常是滿版或置中顯示。提供至少 1200px 寬的圖片，可以確保在 Retina 高解析度螢幕（如 Mac 或 iPhone）上看起來依然清晰銳利。

### 3. 選物卡片圖片 (Product Showcase)
- **建議尺寸**: `800 x 800 px` (1:1 正方形) 或 `800 x 1000 px` (4:5 微長方形)
- **說明**: 選物卡片的設計在左側會有一個固定的圖片區塊（使用 `object-cover` 填滿），在手機版則是顯示在最上方。使用正方形或微長方形能確保商品主體完美置中，不會因為過扁的橫幅而導致上下被裁切。

### 其他注意事項：
- **檔案格式**: 建議使用 `WebP` 或 `JPEG` 以獲得最佳的載入速度。
- **色彩模式**: 確保輸出為 `sRGB` 模式，以避免在不同瀏覽器出現色偏。

---

## 🚀 指令與啟動方式

```bash
# 安裝依賴
pnpm install

# 啟動開發伺服器
pnpm run dev

# 建立正式環境檔案
pnpm run build
```
