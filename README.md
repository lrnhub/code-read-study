# Code Read Study

一个精简的静态学习网站，实现了 Study.vue 和 Tutorial.vue 的相关功能。

## 功能特性

### 🎯 核心功能
- **数学学霸笔记中心**：分类展示学习教程，支持按分类筛选
- **教程阅读**：支持 Markdown 内容渲染，包含图片路径处理
- **风格切换**：支持多种内容风格（默认、小红书、抖音、微信、B站、知乎、微博）
- **文章大纲**：自动提取文章标题生成大纲导航
- **搜索功能**：支持文章标题搜索
- **面包屑导航**：清晰的页面导航路径

### 🎨 界面特性
- **响应式设计**：适配桌面和移动设备
- **现代化UI**：使用 Element Plus 组件库
- **优雅动画**：流畅的交互效果
- **图片支持**：支持多种图片路径格式，包含错误处理

## 技术栈

- **前端框架**：Vue 3 + Composition API
- **路由管理**：Vue Router 4
- **UI组件库**：Element Plus
- **Markdown渲染**：md-editor-v3
- **构建工具**：Vite
- **图标库**：Font Awesome

## 项目结构

```
code-read-study/
├── public/
│   ├── data/           # 静态数据文件
│   │   ├── categories.json
│   │   └── tutorials.json
│   └── md/             # Markdown 文章文件
│       └── series_1/
├── src/
│   ├── api/            # API 服务
│   │   └── staticData.js
│   ├── components/     # 公共组件
│   │   └── BreadcrumbNav.vue
│   ├── views/          # 页面组件
│   │   ├── Study.vue
│   │   └── Tutorial.vue
│   ├── App.vue         # 根组件
│   └── main.js         # 入口文件
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3001

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 数据格式

### 分类数据 (categories.json)

```json
{
  "categories": [
    {
      "id": "chuzhong",
      "name": "初中",
      "icon": "fas fa-school",
      "desc": "初中数学学习资料"
    }
  ]
}
```

### 教程数据 (tutorials.json)

```json
{
  "tutorials": [
    {
      "id": 1,
      "title": "勾股定理详解",
      "desc": "深入理解勾股定理的概念、证明方法和应用",
      "category": "chuzhong",
      "articleCount": 3,
      "tags": ["几何", "定理", "证明"],
      "updateTime": "2025-07-27",
      "articles": [
        {
          "id": "1-1",
          "title": "勾股定理的基本概念",
          "filename": "series_1/1-1-1.md",
          "difficulty": "初级"
        }
      ]
    }
  ]
}
```

## 图片路径支持

支持以下图片路径格式：

1. **静态资源路径**：`/static/images/2025-07-27/image.jpg`
2. **相对路径**：`./local-image.png`
3. **简单文件名**：`image.jpg`
4. **绝对URL**：`https://example.com/image.jpg`

## 风格切换

支持以下内容风格：

- 默认风格
- 小红书风格
- 抖音风格
- 微信风格
- B站风格
- 知乎风格
- 微博风格

## 路由结构

- `/study` - 数学学霸笔记中心首页
- `/study/:categoryId` - 按分类显示教程
- `/tutorial/:id` - 教程页面
- `/tutorial/:id/:articleId` - 具体文章页面

## 开发说明

### 添加新教程

1. 在 `public/data/tutorials.json` 中添加教程信息
2. 在 `public/md/` 目录下创建对应的 Markdown 文件
3. 确保文件名与 JSON 中的 `filename` 字段匹配

### 添加新分类

在 `public/data/categories.json` 中添加分类信息，包含：
- `id`: 分类唯一标识
- `name`: 分类显示名称
- `icon`: Font Awesome 图标类名
- `desc`: 分类描述

### 自定义样式

项目使用 Vue 3 的 `<style scoped>` 进行样式隔离，可以根据需要修改各组件中的样式。

## 浏览器支持

- Chrome >= 87
- Firefox >= 78
- Safari >= 14
- Edge >= 88

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！ 