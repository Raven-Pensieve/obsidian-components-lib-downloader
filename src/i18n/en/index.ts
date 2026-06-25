import type { BaseTranslation } from "../i18n-types";

const en = {
	common: {
		appId: "App ID",
		appSecret: "App Secret",
		cancel: "Cancel",
		save: "Save",
		close: "Close",
		open: "Open",
		download: "Download",
		copyCode: "Copy code",
		copied: "Copied",
		unknownError: "An unknown error occurred.",
		loadingFailed: "Loading failed",
		unknownSize: "Unknown size",
	},
	presets: {
		components: "Components Library",
		xdbjs: "xdb js Library",
		forms: "Forms Library",
	},
	plugin: {
		viewDisplayText: "Feishu Libraries",
		commands: {
			openView: "Open Feishu library",
			testConnection: "Test connection",
			refreshDefaultLibrary: "Refresh default library",
		},
		ribbon: {
			openView: "Open Feishu library",
		},
		notices: {
			downloadPathUpdated: "Updated download path for {label}",
			connectionSuccess: "Connection succeeded. Read {count} records.",
			defaultLibraryRefreshed: "Default library refreshed.",
			skippedFile: "Skipped: {name}",
			downloadedFile: "Downloaded: {name}",
		},
		errors: {
			registerLibraryView: "Failed to register library view: {message}",
			cannotParseTableId:
				"Failed to parse the table ID from the built-in wiki link.",
			settingsStoreProviderMissing:
				"useSettingsStore must be used within a SettingsProvider.",
		},
	},
	settings: {
		title: "Feishu library settings",
		tabs: {
			general: "General",
			guide: "Setup Guide",
		},
		appIdPlaceholder: "cli_xxx",
		appSecretPlaceholder: "secret",
		xdbjsPathPlaceholder: "FeishuDownloads/xdbjs",
		componentsPathPlaceholder: "FeishuDownloads/components",
		formsPathPlaceholder: "FeishuDownloads/forms",
		formScriptsPathPlaceholder: "FeishuDownloads/forms/scripts",
		xdbjsDownloadPath: "{label} download path",
		componentsDownloadPath: "{label} download path",
		formsCformDownloadPath: "{label} cform download path",
		formsJsDownloadPath: "{label} JS download path",
		componentsDownloadPathDesc:
			'The sync button only helps match the setting from the "components" plugin and is optional. You can change this path freely for your own use.',
		xdbjsDownloadPathDesc:
			'The sync button only helps match the setting from the "components" plugin and is optional. You can change this path freely for your own use.',
		formsCformDownloadPathDesc:
			'The sync button only helps match the setting from the "form-flow" plugin and is optional. You can change this path freely for your own use.',
		formsJsDownloadPathDesc:
			'Files with a .js extension from the forms library are downloaded here. The sync button only helps match the setting from the "form-flow" plugin and is optional. You can change this path freely for your own use.',
		syncHint:
			"Components syncs with components.folder, xdbjs syncs with components.scriptFolder, forms cform syncs with form-flow.formFolder, and forms JS syncs with form-flow.scriptFolder.",
		syncTooltip: "Sync {path}",
		notices: {
			pluginNotInstalled: "Plugin is not installed: {pluginId}",
			pluginNotEnabled: "Plugin is not enabled: {pluginId}",
			settingNotFound: "Could not find {pluginId}.{settingKey}",
			synced: "Synced {label}",
		},
	},
	view: {
		hero: {
			openWikiLink: "Open wiki link",
		},
		actions: {
			refreshCurrentLibrary: "Refresh current library",
		},
		emptyState: {
			title: "No downloadable attachments in this library",
			description:
				"Refresh the current library first, or verify that the Feishu table contains attachment fields.",
		},
		sort: {
			recentlyUpdated: "Recently updated",
			earliestUpdated: "Earliest updated",
			titleAsc: "Title A-Z",
			titleDesc: "Title Z-A",
		},
		lightbox: {
			close: "Close",
		},
		fileCount: "{count} cards",
		attachmentCount: "{count} files",
	},
	setupGuide: {
		title: "Finish Feishu app setup first",
		permissionJsonTitle: "Permission JSON",
		copySuccess: "Permission JSON copied",
		copyFailed: "Copy failed. Please copy the JSON manually.",
		finishHint:
			"Return to settings after setup, fill in App ID and App Secret, then refresh the current library.",
		steps: {
			openBeforeLink: "Open ",
			openLinkLabel: "Feishu Open Platform",
			openAfterLink:
				", then sign in, create a custom app, and get the App ID and App Secret.",
			appNameSuggestion:
				'Suggested app name: "Components Feishu Downloader".',
			appDescriptionSuggestion:
				'Suggested app description: "Download Feishu Components libraries inside Obsidian".',
			importPermissions:
				"Open the app, go to Permission Management, and import the JSON below in bulk.",
			publishAndCopySecrets:
				"Publish an app version, then open Credentials & Basic Info and copy the App ID and App Secret.",
		},
	},
	modals: {
		downloadProgress: {
			title: "Download progress",
			preparing: "Preparing…",
			checkingTarget: "Checking download target...",
			waitingConflictChoice:
				"Waiting for duplicate file handling choice...",
			fetchingAccessToken: "Fetching Feishu access token...",
			downloadingContent: "Downloading file content...",
			writingVault: "Writing to the Obsidian vault...",
			skippedConflict: "Skipped duplicate file.",
			completed: "Download completed.",
		},
		overwriteMode: {
			title: "Duplicate file detected",
			message: "A file with the same name already exists: {fileName}",
			skip: "Skip",
			renameSave: "Rename and save",
			overwrite: "Overwrite",
		},
		downloadPath: {
			title: "Edit {label} download path",
			message: "Set the download path for files from the {label}.",
			primaryName: "Download path",
			primaryDesc:
				"The path is relative to the current Obsidian vault root.",
			secondaryName: "Script download path",
			secondaryDesc:
				"Files with a .js extension from the forms library are saved here.",
			primaryRequired: "Download path is required",
			secondaryRequired: "Script download path is required",
		},
	},
	feishu: {
		errors: {
			missingAppCredentials: "Missing App ID or App Secret.",
			failedTenantToken: "Failed to get tenant access token: {reason}",
			invalidWikiUrl: "Invalid wiki URL.",
			cannotParseWikiNodeToken:
				"Cannot parse the wiki node token from the wiki URL.",
			failedResolveWikiNode: "Failed to resolve wiki node: {reason}",
			targetNotBitable:
				"The target wiki node is not a bitable. Received type: {objType}",
			missingTableId: "Missing tableId.",
			failedSearchRecords: "Failed to search records: {reason}",
			missingAttachmentUrl:
				"Attachment {name} does not include a download URL.",
			failedDownloadAttachment:
				"Failed to download attachment: HTTP {status}",
		},
	},
	record: {
		fallbackTitle: "Record {recordId}",
	},
} satisfies BaseTranslation;

export default en;
