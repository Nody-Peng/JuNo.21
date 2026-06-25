# JuNo.21 質感選物部落格

JuNo.21 是一個結合質感選物與深度文章的現代化部落格平台。本專案採用 **Next.js (App Router)** 建構高互動性的前台，並深度整合 **Payload CMS 3.x** 作為無頭內容管理系統 (Headless CMS)。

為了提供最直覺的文章撰寫體驗，我們在 Next.js 前台量身打造了一套「自訂區塊編輯器 (Block Editor)」，讓作者可以在前台直接新增商品卡片、插入 Google 地圖、建立表格，並將這些資料無縫轉換並儲存回 Payload 的 Lexical Rich Text 欄位中。

## 系統架構與技術棧 (Tech Stack)

- **前端框架**: Next.js (App Router)
- **後端 CMS**: Payload CMS 3.x (與 Next.js 整合於同一伺服器)
- **資料庫**: PostgreSQL (透過 Vercel Postgres 或 neon 等服務)
- **樣式與設計**: Tailwind CSS, Lucide React (圖示)
- **套件管理**: pnpm (版本 v10)
- **部署環境**: Vercel

## 核心功能

1. **自訂前台文章編輯器 (`/write`)**: 
   - 擺脫傳統 CMS 複雜的後台，作者登入後可直接在網站前台撰寫文章。
   - 支援 H1/H2/H3 標題、引言、項目符號、程式碼等基礎排版。
   - 支援進階客製化區塊：**商品輪播卡片 (Product Carousel)**、**動態表格 (Table)**、**地圖嵌入 (Map)**、**YouTube 影片 (Video)**。
   - 支援直接在前台拖曳或上傳圖片，自動同步至 Payload 媒體庫 (Media)。
   - 即時草稿自動儲存功能與發布管理。

2. **響應式現代化前台設計**:
   - 充滿細節的微動畫 (Micro-animations) 與高品質排版。
   - 首頁精選文章、最新文章列表，以及支援分類與搜尋的 `/blog` 頁面。
   - 文章內頁自動產生「文章目錄 (Table of Contents)」與動態閱讀進度條。

3. **強大的後端管理 (Payload CMS)**:
   - 管理員可以控管使用者 (Users)、文章 (Posts)、分類 (Categories)、媒體檔案 (Media) 以及電子報訂閱名單 (Newsletter)。
   - 發送客製化電子報功能。

## 如何使用後台 (Payload Admin)

雖然大部分的文章撰寫都可以在前台的 `/write` 頁面完成，但若是需要進行系統管理、分類建立或進階設定，您可以進入 Payload 後台：

1. **進入後台**: 在網址列輸入 `https://您的網域/admin` (本地開發請訪問 `http://localhost:3000/admin`)。
2. **登入帳號**: 使用您設定的 Admin Email 與密碼登入。
3. **管理項目**:
   - **Users**: 管理可登入的作者或管理員帳號。
   - **Categories**: 建立與管理文章分類。
   - **Posts**: 所有的文章（包含前台建立的草稿與發布文章）都會存放在這裡。若遇到前台無法處理的特殊版面調整，也可在此處透過 Lexical Editor 強制編輯。
   - **Media**: 統一管理全站上傳的圖片與檔案。
   - **Newsletter Emails**: 檢視訂閱電子報的讀者 Email。

## 開發與本地執行指令

1. 安裝依賴套件:
   ```bash
   pnpm install
   ```

2. 設定環境變數 (`.env`):
   請確保您擁有正確的 `DATABASE_URI` (PostgreSQL 連線字串) 與 `PAYLOAD_SECRET`。

3. 啟動本地開發伺服器:
   ```bash
   pnpm dev
   ```
   伺服器將運行於 `http://localhost:3000`。

## AI 開發擴充指南

如果未來您希望透過 AI 助手（如 ChatGPT、Claude、Gemini 等）為這個專案新增更多的「客製化編輯區塊」（例如：漂亮的名言字卡、QA 手風琴、活動倒數計時器等），我們特別準備了一份針對 AI 的開發架構說明書。

請參考專案根目錄下的 `AI_DEVELOPMENT_GUIDE.md`。當您有擴充需求時，**請直接將該檔案的內容複製並貼給 AI 看**，AI 就能瞬間理解本專案獨特的「前台 Block Editor <-> 後台 Lexical」資料轉換架構，並精準為您寫出擴充程式碼。
