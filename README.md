# Hexo Upload

Hexo 博客文章管理后台 —— 本地 Web 编辑器，支持富文本 + Markdown 混合编辑，一键部署。

![tech](https://img.shields.io/badge/Vue-3.4-4FC08D?logo=vue.js) ![tech](https://img.shields.io/badge/Express-4.18-000?logo=express) ![tech](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss) ![tech](https://img.shields.io/badge/Vditor-3.10-1AAD19)

## 功能

- **文章管理** — 新建 / 编辑 / 删除 Markdown 文章，支持子目录
- **混合编辑** — Vditor 即时渲染模式，所见即所得 + Markdown 源码
- **Frontmatter** — 可视化编辑标题、分类、标签、发布状态、文章摘要
- **图片上传** — 编辑器内粘贴/拖拽上传，自动插入 Markdown 图片语法
- **主题配置** — 修改 Redefine 主题的头像、首页背景图/视频、Banner 标题和副标题
- **一键部署** — 保存即生成 & 部署到 GitHub Pages（hexo clean → generate → deploy）
- **暗色模式** — 支持亮色/暗色切换

## 截图

```
┌──────────────────────────────────────────────────┐
│  H │  文章                         hexoDir       │ ← 侧边栏导航
│    ├─────────────────────────────────────────────┤
│  📝 │ ┌──────────┐ ┌───────────────────────────┐│
│     │ │ 文章列表  │ │  MetaPanel (标题/分类/标签) ││
│  ⚙  │ │          │ ├───────────────────────────┤│
│     │ │ · Post1  │ │                           ││
│     │ │ · Post2  │ │     Vditor 编辑器          ││
│     │ │ · Post3  │ │                           ││
│     │ │          │ ├───────────────────────────┤│
│     │ │ + 新建   │ │ [删除]  [保存]  [保存并部署]││
│     │ └──────────┘ └───────────────────────────┘│
└──────────────────────────────────────────────────┘
```

## 前置要求

- **Node.js** >= 18
- **Hexo 博客** — 一个已初始化的 Hexo 项目（推荐使用 [Redefine](https://github.com/EvanNotFound/hexo-theme-redefine) 主题）
- **Git** — 用于 `hexo deploy`（GitHub Pages 部署）

## 安装

```bash
# 1. 克隆仓库
git clone https://github.com/RestXtra/hexo-upload.git
cd hexo-upload

# 2. 安装依赖（自动安装 server + client 双端依赖）
npm install

# 3. 构建前端
npm run build
```

## 配置

启动后在「设置」页面中填写 Hexo 博客根目录路径，点击保存即可。

```
github/
├── hexo-upload/   ← 本项目
└── myblog/        ← Hexo 博客（默认路径：../myblog）
```

## 使用

### 开发模式

```bash
npm run dev
```

- 前端：http://localhost:5173（Vite HMR 热更新）
- API：http://localhost:3210
- Vite 自动代理 `/api` 和 `/images` 到后端

### 生产模式

```bash
npm run build   # 构建前端静态文件
npm start       # 启动 Express 服务器
```

- 访问：http://localhost:3210

## 项目结构

```
hexo-upload/
├── server.js           # Express API 服务器（14 个端点）
├── start.js            # 开发启动器（同时启动前后端）
├── package.json        # 服务端依赖
├── config.json         # 运行时配置（自动生成，存储 hexoDir）
├── public/             # 静态文件目录
└── client/             # Vue 3 前端
    ├── package.json
    ├── vite.config.js      # Vite 配置 + API 代理
    ├── tailwind.config.js  # Tailwind CSS 配置
    ├── index.html          # 入口 HTML（加载 Vditor CDN）
    └── src/
        ├── main.js         # Vue 应用入口
        ├── App.vue         # 根组件（路由/状态管理）
        ├── api.js          # API 请求层
        ├── style.css       # 全局样式 + Tailwind
        └── components/
            ├── PostList.vue      # 文章列表（搜索/筛选）
            ├── PostEditor.vue    # Vditor 编辑器封装
            ├── MetaPanel.vue     # Frontmatter 编辑表单
            ├── SettingsPanel.vue # 主题 & 路径设置
            ├── Modal.vue         # 确认对话框
            └── TopBar.vue        # 旧版顶栏（未使用，保留）
```

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/posts` | 获取所有文章列表 |
| GET | `/api/posts/:slug` | 获取单篇文章详情 |
| POST | `/api/posts` | 创建新文章 |
| PUT | `/api/posts/:slug` | 更新文章 |
| DELETE | `/api/posts/:slug` | 删除文章 |
| GET | `/api/categories` | 获取所有分类 |
| GET | `/api/tags` | 获取所有标签 |
| POST | `/api/upload-image` | 上传文章内图片 |
| POST | `/api/upload-profile-image` | 上传头像/背景图 |
| GET | `/api/theme-config` | 读取主题配置 |
| POST | `/api/theme-config` | 更新主题配置 |
| GET | `/api/hexo-info` | 获取 Hexo 项目信息 |
| POST | `/api/generate` | 生成静态文件 |
| POST | `/api/deploy` | 部署到 GitHub Pages |
| POST | `/api/preview` | 启动预览服务器 |
| GET/POST | `/api/config` | 读取/更新 hexoDir 配置 |

## 主题兼容性

当前版本**深度绑定 Redefine 主题**（`themes/redefine/_config.yml`）。主题配置功能包括：

- 头像上传 (`defaults.avatar`)
- 首页背景图/视频 (`image.light` / `image.dark`，支持 `.mp4` / `.webm`)
- Banner 标题 (`home_banner.title`)
- Banner 副标题打字机效果 (`home_banner.subtitle.text`)

如需适配其他主题，修改 `server.js` 中的 `THEME_CONFIG` 路径和 `readThemeConfig()` / `updateThemeConfigValue()` 函数。

## License

MIT
