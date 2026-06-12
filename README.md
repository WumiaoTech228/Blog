# 无渺 Blog

无渺的个人博客，使用 Astro、Keystatic 和 Cloudflare Pages 构建。站点用于记录 Blog、LepoProxy、AI 工具和日常开发折腾。

## 技术栈

- Astro 6
- Keystatic
- Cloudflare Pages
- Astro Content Collections
- RSS 和 Sitemap

## 本地开发

```sh
npm install
npm run dev
```

默认开发地址是 `http://localhost:4321`。

建议使用 Node.js `22.12.0` 或更高版本。项目根目录提供了 `.node-version`，方便版本管理工具自动切换。

## 内容管理

文章存放在 `src/content/blog/*/index.md`。本地开发时可以通过 `/keystatic` 使用 Keystatic 管理内容。

文章字段包括：

- `title`
- `description`
- `date`
- `draft`
- `coverImage`
- `tags`

## 构建

```sh
npm run build
```

Windows PowerShell 如果拦截 `npm` 脚本，可以使用：

```sh
npm.cmd run build
```

如果内容类型或集合定义发生变化，可以先运行：

```sh
npm run sync
```

在受限的 Windows 本地环境中，如果 Wrangler 尝试写入用户目录失败，可以使用项目内缓存版本：

```sh
npm run sync:local
npm run build:local
```

## 部署配置

线上 Keystatic 需要配置：

```env
KEYSTATIC_GITHUB_REPO=WumiaoTech228/Blog
```

站点域名配置在 `astro.config.mjs` 和 `src/config.ts`。
