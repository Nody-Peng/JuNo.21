import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  // 強制 Next.js 在 Build 時輸出成獨立的 standalone 資料夾，這是未來使用 Docker 部署的關鍵
  output: "standalone",
};

// 使用 withPayload 將 Payload CMS 的底層設定與 Next.js 完美融合
export default withPayload(nextConfig);