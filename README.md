# 无渺 Blog 🪐

无渺的个人博客，采用 **Astro 6** + **Keystatic** + **Cloudflare Pages / KV** 构建。站点不仅记录技术折腾与思考，更是极致动效与现代美学设计的落地实践。

## ✨ 特色亮点

- **🪐 极致流光玻璃感设计**：采用定制化的 LiquidGlass 设计语言，搭载 HSL 渐变、动态毛玻璃特效和无缝页面过渡动画。
- **🎵 高动态 Lofi 音乐播放器**：左下角挂载支持拖拽进度条的 Lofi 氛围播放器，集成拖拽防抖、动态均衡器波形与防抖锁，打造无缝沉浸式写码环境。
- **✍️ 视口同步歌词显示**：音乐播放后在页面右下角自动加载并同步歌词。采用细腻的**思源宋体（斜体）**渲染，歌词与歌曲/艺术家信息换行分层排版（辅以 `——` 前缀），提供极具人文和现代感的美学交互体验。
- **📝 云端同步留言墙 (Guestbook)**：使用 **Cloudflare KV** 存储，完美适配 Astro v6 `cloudflare:workers` 环境。支持双通道容错（网络离线/无绑定时自动降级到 LocalStorage），留言瞬间燃放礼花粒子特效。
- **🤝 响应式友链卡片**：简介折行优化设计，固定卡片高度并加入卡片 HSL 主题色流光呼吸灯，内置 OSBox、apanzinc 等友情链接。
- **🦀 开发栈可视化**：首页支持前后端技术熟练度切片（包含 Rust, Python, HTML 等比例配置）。

## 🛠️ 技术栈

- **Core**: Astro 6.x (SSR Mode)
- **CMS**: Keystatic (Local & GitHub Auth)
- **Serverless / Database**: Cloudflare Pages & Cloudflare KV
- **Styling**: Vanilla CSS (Fluid Grid, Webkit Line Clamp, Backdrop Filter)

## 🚀 本地开发

1. **安装依赖**：
   ```sh
   npm install
   ```

2. **启动本地开发服务器**：
   ```sh
   npm run dev
   ```
   默认本地地址是 `http://localhost:4321`。本地会自动开启双通道降级，留言板将使用 LocalStorage 供您调试。

3. **静态/SSR 编译**：
   ```sh
   npm run build
   ```
   * Windows 环境如果提示权限受阻，可使用内置本地构建命令：
     ```sh
     npm run build:local
     ```

## 📝 内容管理 (Keystatic)

文章存储在 `src/content/blog/*/index.md`。本地开发时可通过浏览器访问 `/keystatic` 进入可视化后台管理内容。

## 🌐 部署与绑定

1. **GitHub Auth 配置**：
   在线上环境需要配置环境变量：
   ```env
   KEYSTATIC_GITHUB_REPO=WumiaoTech228/Blog
   ```

2. **Cloudflare KV 绑定**：
   为开启留言墙全球云端同步，请在 Cloudflare Pages 管理控制台 `Settings -> Functions -> KV namespace bindings` 下，新增一个名为 **`GUESTBOOK_KV`** 的 KV 命名空间绑定。

---
*宇宙的边缘，代码的温床。*
