import type { BaseTranslation } from "../i18n-types";

const zh = {
	common: {
		appId: "App ID",
		appSecret: "App Secret",
		cancel: "取消",
		save: "保存",
		close: "关闭",
		open: "打开",
		download: "下载",
		copyCode: "复制代码",
		copied: "已复制",
		unknownError: "发生未知错误。",
		loadingFailed: "加载失败",
		unknownSize: "未知大小",
	},
	presets: {
		componentsOfficial: "组件库（官方）",
		components: "组件库（第三方）",
		xdbjs: "xdb js 库",
		forms: "表单库",
	},
	plugin: {
		viewDisplayText: "飞书资源库",
		commands: {
			openView: "打开飞书资源库",
			testConnection: "测试连接",
			refreshDefaultLibrary: "刷新默认库",
		},
		ribbon: {
			openView: "打开飞书资源库",
		},
		notices: {
			downloadPathUpdated: "已更新 {label} 下载位置",
			connectionSuccess: "连接成功，共读取 {count} 条记录。",
			defaultLibraryRefreshed: "默认库已刷新。",
			skippedFile: "已跳过：{name}",
			downloadedFile: "已下载：{name}",
		},
		errors: {
			registerLibraryView: "注册库视图失败：{message}",
			cannotParseTableId: "无法从内置知识库链接解析数据表 ID。",
			settingsStoreProviderMissing:
				"useSettingsStore 必须在 SettingsProvider 中使用。",
		},
	},
	settings: {
		title: "飞书库配置",
		downloadPathGroupTitle: "下载目录",
		defaultLibraryPreset: "默认打开的库",
		tabs: {
			general: "常规设置",
			guide: "配置教程",
		},
		appIdPlaceholder: "cli_xxx",
		appSecretPlaceholder: "secret",
		componentsOfficialPathPlaceholder:
			"FeishuDownloads/components-official",
		xdbjsPathPlaceholder: "FeishuDownloads/xdbjs",
		componentsPathPlaceholder: "FeishuDownloads/components",
		formsPathPlaceholder: "FeishuDownloads/forms",
		formScriptsPathPlaceholder: "FeishuDownloads/forms/scripts",
		xdbjsDownloadPath: "{label} 下载目录",
		componentsDownloadPath: "{label} 下载目录",
		formsCformDownloadPath: "{label} cform 下载目录",
		formsJsDownloadPath: "{label} JS 下载目录",
		syncHint:
			"同步按钮仅用于和「components」「form-flow」插件中的设置保持一致，并非强制，你也可以按自己的需要修改这个目录。",
		syncTooltip: "同步 {path}",
		notices: {
			pluginNotInstalled: "未安装插件：{pluginId}",
			pluginNotEnabled: "插件未启用：{pluginId}",
			settingNotFound: "未找到 {pluginId}.{settingKey} 设置",
			synced: "已同步 {label}",
		},
	},
	view: {
		hero: {
			openWikiLink: "打开知识库链接",
		},
		actions: {
			refreshCurrentLibrary: "刷新当前库",
		},
		emptyState: {
			title: "当前库暂无可下载附件",
			description: "可以先刷新当前库，或检查飞书表格内是否存在附件字段。",
		},
		sort: {
			recentlyUpdated: "最近更新",
			earliestUpdated: "最早更新",
			titleAsc: "名称 A-Z",
			titleDesc: "名称 Z-A",
		},
		lightbox: {
			close: "关闭",
		},
		fileCount: "{count} 张卡片",
		attachmentCount: "{count} 个文件",
	},
	setupGuide: {
		title: "先完成飞书应用配置",
		permissionJsonTitle: "权限 JSON",
		copySuccess: "权限 JSON 已复制",
		copyFailed: "复制失败，请手动复制 JSON。",
		finishHint: "完成后回到设置页填写 App ID 和 App Secret，再刷新当前库。",
		steps: {
			openBeforeLink: "打开",
			openLinkLabel: "飞书开放平台",
			openAfterLink:
				"，登录后创建一个自建应用，获取 App ID 和 App Secret。",
			appNameSuggestion: '应用名称建议："Components Feishu Downloader"。',
			appDescriptionSuggestion:
				'应用描述建议："用于在 Obsidian 中下载飞书 Components 库"。',
			importPermissions:
				"进入应用，点击权限管理，复制下列 JSON 批量导入。",
			publishAndCopySecrets:
				"发布应用版本，点击凭证与管理信息，复制 App ID 和 App Secret。",
		},
	},
	modals: {
		downloadProgress: {
			title: "下载进度",
			preparing: "准备开始…",
			checkingTarget: "检查下载目标...",
			waitingConflictChoice: "等待选择同名文件处理方式...",
			fetchingAccessToken: "获取飞书访问凭证...",
			downloadingContent: "下载文件内容...",
			writingVault: "写入 Obsidian 仓库...",
			skippedConflict: "已跳过同名文件。",
			completed: "下载完成。",
		},
		overwriteMode: {
			title: "发现同名文件",
			message: "目标位置已存在同名文件：{fileName}",
			skip: "跳过",
			renameSave: "重命名保存",
			overwrite: "覆盖",
		},
		downloadPath: {
			title: "修改 {label} 下载位置",
			message: "设置 {label} 库文件的下载目录。",
			primaryName: "下载目录",
			primaryDesc: "路径相对于当前 Obsidian 仓库根目录",
			secondaryName: "脚本下载目录",
			secondaryDesc: "表单库中的 .js 文件会保存到这里",
			primaryRequired: "下载目录不能为空",
			secondaryRequired: "脚本下载目录不能为空",
		},
	},
	feishu: {
		errors: {
			missingAppCredentials: "缺少 App ID 或 App Secret。",
			failedTenantToken: "获取租户访问令牌失败：{reason}",
			invalidWikiUrl: "无效的知识库链接。",
			cannotParseWikiNodeToken: "无法从知识库链接解析 wiki 节点 token。",
			failedResolveWikiNode: "解析 wiki 节点失败：{reason}",
			targetNotBitable: "目标 wiki 节点不是多维表格，当前类型：{objType}",
			missingTableId: "缺少 tableId。",
			failedSearchRecords: "查询记录失败：{reason}",
			missingAttachmentUrl: "附件 {name} 不包含可下载链接。",
			failedDownloadAttachment: "下载附件失败：HTTP {status}",
		},
	},
	record: {
		fallbackTitle: "记录 {recordId}",
	},
} satisfies BaseTranslation;

export default zh;
