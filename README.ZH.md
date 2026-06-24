中文 | [English](README.md)

# Components Library Downloader

一个面向 Obsidian 的飞书资源库下载插件，用于从飞书知识库中的多维表格读取文件资源，并下载到当前仓库的指定目录。

![GitHub Socialify](https://socialify.git.ci/Raven-Pensieve/obsidian-components-lib-downloader/image?description=1&font=Rokkitt&forks=1&issues=1&language=1&name=1&owner=1&pattern=Floating+Cogs&pulls=1&stargazers=1&theme=Auto)

## 功能特性

- 内置三个飞书知识库预设：`components`、`xdbjs`、`forms`
- 使用 Obsidian 原生 `requestUrl` 访问飞书接口，无需自建服务器
- 提供独立库视图，支持分 Tab 浏览三个资源库
- 卡片式 Grid 展示文件信息、封面预览、附件列表
- 支持图片预览、轮播和大图查看
- 下载时显示进度
- 目标位置存在同名文件时，可选择跳过、重命名保存或覆盖
- 支持分别配置三个库的下载目录
- `forms` 库支持将 `.js` 文件单独下载到脚本目录
- 设置页支持同步外部插件配置：
	- `components.folder`
	- `components.scriptFolder`
	- `form-flow.formFolder`
	- `form-flow.scriptFolder`
- 内置中英文 i18n

## 工作方式

插件会通过飞书开放平台应用凭证获取 `tenant_access_token`，再解析内置知识库链接对应的 wiki 节点和多维表格信息，读取记录中的附件字段，并将文件保存到 Obsidian 当前仓库。

所有凭证均保存在用户本地 Obsidian 插件设置中，不会写入源码仓库。

## 安装

### 手动安装

1. 下载构建产物：`main.js`、`manifest.json`、`styles.css`
2. 在你的 Obsidian 仓库中创建目录：`.obsidian/plugins/components-lib-downloader/`
3. 将上述文件复制到该目录
4. 重新启动 Obsidian，或在 `设置 > 第三方插件` 中刷新插件列表
5. 启用 `Components Library Downloader`

### BRAT 安装（适合测试）

1. 安装 [BRAT](https://github.com/TfTHacker/obsidian42-brat)
2. 在 BRAT 设置中点击“添加 Beta 插件”
3. 填入当前仓库地址
4. 安装并启用插件

## 飞书配置

首次使用前，需要在飞书开放平台创建自建应用，并填写 `App ID` 与 `App Secret`。

### 权限范围

插件当前使用以下权限：

```json
{
	"scopes": {
		"tenant": [
			"base:app:read",
			"base:block:read",
			"base:field:read",
			"base:history:read",
			"base:record:read",
			"base:record:retrieve",
			"base:table:read",
			"bitable:app:readonly",
			"docs:document.media:download",
			"drive:file:download",
			"wiki:wiki:readonly"
		],
		"user": [
			"base:field:read"
		]
	}
}
```

### 配置步骤

1. 打开 [飞书开放平台](https://open.feishu.cn/)
2. 创建自建应用
3. 在“权限管理”中导入上面的权限 JSON
4. 发布一个应用版本
5. 在“凭证与基础信息”中复制 `App ID` 和 `App Secret`
6. 回到 Obsidian，打开插件设置并填写凭证

## 使用说明

### 1. 打开库视图

插件提供以下入口：

- 命令面板：
	- `Feishu: 打开库视图`
	- `Feishu: 测试连接`
	- `Feishu: 刷新默认库`
- 左侧 Ribbon 图标

### 2. 浏览资源库

库视图中可直接：

- 在 `components`、`xdbjs`、`forms` 之间切换
- 查看当前预设对应的飞书知识库链接
- 刷新当前库内容
- 调整当前库下载目录
- 按更新时间或标题排序

### 3. 下载文件

在卡片中点击下载按钮即可下载附件。

下载流程包含：

- 检查目标路径
- 检查是否存在重名文件
- 拉取飞书访问令牌
- 下载附件内容
- 写入 Obsidian 仓库

如果是 `forms` 资源库：

- 普通表单文件保存到 `feishu.downloadPaths.forms`
- `.js` 文件保存到 `feishu.downloadPaths.formScripts`

## 插件设置

设置页包含两个页签：

- `常规设置`
- `配置教程`

### 常规设置项

- `App ID`
- `App Secret`
- `xdbjs` 下载目录
- `components` 下载目录
- `forms` cform 下载目录
- `forms` JS 下载目录

### 外部插件目录同步

可通过设置项右侧同步按钮，读取其他已安装且已启用插件中的目录设置：

- `components` 库 ← `components.folder`
- `xdbjs` 库 ← `components.scriptFolder`
- `forms` cform ← `form-flow.formFolder`
- `forms` JS ← `form-flow.scriptFolder`

## 开发

### 环境要求

- Node.js `>= 20`
- pnpm

### 安装依赖

```bash
pnpm install
```

### 常用命令

```bash
pnpm dev
pnpm build
pnpm lint
pnpm test
pnpm i18n:typesafe
pnpm i18n:sync
```

## 技术栈

- TypeScript
- Obsidian Plugin API
- React 18
- Lucide React
- Jest
- typesafe-i18n

## 兼容性

- 最低 Obsidian 版本：`1.11.0`
- 仅支持桌面端：`isDesktopOnly = true`

## 许可证

此项目基于 [MIT](LICENSE) 许可证发布。

## Star 历史

[![Star 历史图表](https://api.star-history.com/svg?repos=Raven-Pensieve/obsidian-components-lib-downloader&type=Timeline)](https://www.star-history.com/#Raven-Pensieve/obsidian-components-lib-downloader&Timeline)
