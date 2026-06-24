import { DownloadPathModal } from "@src/components/modals/DownloadPathModal";
import { DownloadProgressModal } from "@src/components/modals/DownloadProgressModal";
import { OverwriteModeModal } from "@src/components/modals/OverwriteModeModal";
import { LL } from "@src/i18n/i18n";
import { getPresetLabel } from "@src/i18n/preset";
import "@styles/styles";
import { Notice, Plugin, WorkspaceLeaf } from "obsidian";
import { PluginSettingTab } from "./settings/PluginSettingTab";
import SettingsStore from "./settings/SettingsStore";
import {
	FeishuAttachment,
	FeishuLibraryCard,
	FeishuRecord,
} from "./types/feishu";
import {
	DownloadedFileState,
	FEISHU_LIBRARY_PRESETS,
	FeishuLibraryPreset,
	IPluginSettings,
	OverwriteMode,
} from "./types/types";
import FeishuAuthService, { FeishuApiError } from "./utils/feishu/auth";
import { buildLibraryCards, searchAllRecords } from "./utils/feishu/bitable";
import { downloadAttachment } from "./utils/feishu/download";
import { resolveBitableTarget } from "./utils/feishu/wiki";
import { guessMimeType } from "./utils/guessMimeType";
import { getExistingBinaryFilePath, writeBinaryFile } from "./utils/vault";
import { LIBRARY_VIEW_TYPE, LibraryView } from "./views/LibraryView";

export default class CPlugin extends Plugin {
	readonly defaultLibraryPreset: FeishuLibraryPreset = "components";
	readonly overwriteMode: OverwriteMode = "rename";
	settings!: IPluginSettings;
	readonly settingsStore = new SettingsStore(this);
	readonly authService = new FeishuAuthService();
	attachmentPreviewUrlCache = new Map<string, string>();
	downloadedFiles: Record<string, DownloadedFileState> = {};
	libraryRecordsCache: Partial<Record<FeishuLibraryPreset, FeishuRecord[]>> =
		{};

	async onload() {
		await this.settingsStore.loadSettings();

		this.registerLeafViews();

		this.addSettingTab(new PluginSettingTab(this));

		this.registerCommands();
		this.registerRibbonCommands();
	}

	onunload() {
		for (const url of this.attachmentPreviewUrlCache.values()) {
			URL.revokeObjectURL(url);
		}
		this.attachmentPreviewUrlCache.clear();
		this.authService.clear();
		console.info("[components-lib-downloader] Plugin unloaded");
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	getDownloadPath(preset: FeishuLibraryPreset, fileName?: string) {
		if (preset === "forms") {
			return this.getFormsDownloadPath(fileName);
		}

		return this.settings.feishu.downloadPaths[preset];
	}

	getDownloadPathDisplay(preset: FeishuLibraryPreset) {
		if (preset !== "forms") {
			return this.getDownloadPath(preset);
		}

		return `${this.settings.feishu.downloadPaths.forms} | ${this.settings.feishu.downloadPaths.formScripts}`;
	}

	async updateDownloadPath(preset: FeishuLibraryPreset, nextPath: string) {
		await this.settingsStore.updateSettingByPath(
			`feishu.downloadPaths.${preset}`,
			nextPath,
		);
	}

	async promptDownloadPathUpdate(preset: FeishuLibraryPreset) {
		const label = getPresetLabel(preset);
		const updated = await new DownloadPathModal({
			plugin: this,
			preset,
			initialPath: this.getPrimaryDownloadPath(preset),
			secondaryPath:
				preset === "forms"
					? this.settings.feishu.downloadPaths.formScripts
					: undefined,
			onSubmit: async ({ primaryPath, secondaryPath }) => {
				await this.updateDownloadPath(preset, primaryPath);
				if (preset === "forms" && secondaryPath) {
					await this.settingsStore.updateSettingByPath(
						"feishu.downloadPaths.formScripts",
						secondaryPath,
					);
				}
				new Notice(LL.plugin.notices.downloadPathUpdated({ label }));
			},
		}).openAndWait();

		return updated;
	}

	private registerLeafViews() {
		try {
			this.registerView(LIBRARY_VIEW_TYPE, (leaf) => {
				return new LibraryView(leaf, this);
			});
		} catch (e) {
			throw new Error(
				LL.plugin.errors.registerLibraryView({ message: String(e) }),
			);
		}
	}

	private registerCommands() {
		this.addCommand({
			id: "feishu-open-library-view",
			name: LL.plugin.commands.openView(),
			callback: async () => {
				await this.openPluginView(LIBRARY_VIEW_TYPE);
			},
		});

		this.addCommand({
			id: "feishu-test-connection",
			name: LL.plugin.commands.testConnection(),
			callback: () => {
				void this.testConnection();
			},
		});

		this.addCommand({
			id: "feishu-refresh-default-library",
			name: LL.plugin.commands.refreshDefaultLibrary(),
			callback: () => {
				void this.refreshDefaultLibrary();
			},
		});
	}

	private registerRibbonCommands() {
		this.addRibbonIcon("library", LL.plugin.ribbon.openView(), async () => {
			await this.openPluginView(LIBRARY_VIEW_TYPE);
		});
	}

	private async resolveFeishuContext(preset: FeishuLibraryPreset) {
		const presetConfig = FEISHU_LIBRARY_PRESETS[preset];
		const tenantAccessToken = await this.authService.getTenantAccessToken(
			this.settings,
		);
		const resolved = await resolveBitableTarget(
			presetConfig.wikiUrl,
			tenantAccessToken,
		);

		const tableId = resolved.tableId;
		if (!tableId) {
			throw new FeishuApiError(LL.plugin.errors.cannotParseTableId());
		}

		return {
			tenantAccessToken,
			appToken: resolved.appToken,
			tableId,
			viewId: resolved.viewId,
		};
	}

	async activateLibraryView() {
		let leaf: WorkspaceLeaf | null =
			this.app.workspace.getLeavesOfType(LIBRARY_VIEW_TYPE)[0] ?? null;
		if (!leaf) {
			leaf = this.app.workspace.getRightLeaf(false);
			await leaf?.setViewState({ type: LIBRARY_VIEW_TYPE, active: true });
		}
		if (leaf) {
			this.app.workspace.revealLeaf(leaf);
		}
	}

	private async testConnection() {
		try {
			const preset = this.defaultLibraryPreset;
			const { tenantAccessToken, appToken, tableId, viewId } =
				await this.resolveFeishuContext(preset);
			const records = await searchAllRecords(
				tenantAccessToken,
				appToken,
				tableId,
				viewId,
			);
			console.info(
				"[components-lib-downloader] Connection test success",
				{
					preset,
					count: records.length,
				},
			);
			new Notice(
				LL.plugin.notices.connectionSuccess({ count: records.length }),
			);
		} catch (error) {
			this.handleError(error);
		}
	}

	async refreshDefaultLibrary() {
		await this.loadLibraryCards(this.defaultLibraryPreset, true);
		new Notice(LL.plugin.notices.defaultLibraryRefreshed());
	}

	async loadLibraryCards(
		preset: FeishuLibraryPreset,
		forceRefresh = false,
	): Promise<FeishuLibraryCard[]> {
		if (!forceRefresh && this.libraryRecordsCache[preset]) {
			return buildLibraryCards(
				preset,
				this.libraryRecordsCache[preset] ?? [],
			);
		}

		const { tenantAccessToken, appToken, tableId, viewId } =
			await this.resolveFeishuContext(preset);
		const records = await searchAllRecords(
			tenantAccessToken,
			appToken,
			tableId,
			viewId,
		);
		this.libraryRecordsCache[preset] = records;
		return buildLibraryCards(preset, records);
	}

	async downloadLibraryAttachment(
		preset: FeishuLibraryPreset,
		recordId: string,
		attachment: FeishuAttachment,
	) {
		const progressModal = new DownloadProgressModal(this, attachment.name);
		progressModal.open();
		try {
			progressModal.update(
				10,
				LL.modals.downloadProgress.checkingTarget(),
			);
			const folder = this.getDownloadPath(preset, attachment.name);
			const existingPath = getExistingBinaryFilePath(
				this.app,
				folder,
				attachment.name,
			);
			let overwriteMode = this.overwriteMode;
			if (existingPath) {
				progressModal.update(
					20,
					LL.modals.downloadProgress.waitingConflictChoice(),
				);
				const selectedMode = await new OverwriteModeModal(
					this,
					attachment.name,
					existingPath,
				).choose();
				if (!selectedMode) {
					progressModal.close();
					return;
				}
				overwriteMode = selectedMode;
				if (overwriteMode === "skip") {
					progressModal.update(
						100,
						LL.modals.downloadProgress.skippedConflict(),
					);
					new Notice(
						LL.plugin.notices.skippedFile({
							name: attachment.name,
						}),
					);
					progressModal.close();
					return;
				}
			}

			progressModal.update(
				35,
				LL.modals.downloadProgress.fetchingAccessToken(),
			);
			const { tenantAccessToken } =
				await this.resolveFeishuContext(preset);
			progressModal.update(
				60,
				LL.modals.downloadProgress.downloadingContent(),
			);
			const binary = await downloadAttachment(
				tenantAccessToken,
				attachment,
			);
			progressModal.update(85, LL.modals.downloadProgress.writingVault());
			const targetPath = await writeBinaryFile(
				this.app,
				folder,
				attachment.name,
				binary,
				overwriteMode,
			);
			await this.persistDownloadedFile(
				preset,
				recordId,
				attachment,
				targetPath,
			);
			console.info(
				"[components-lib-downloader] Attachment saved to vault",
				{
					preset,
					recordId,
					targetPath,
				},
			);
			progressModal.update(100, LL.modals.downloadProgress.completed());
			new Notice(
				LL.plugin.notices.downloadedFile({ name: attachment.name }),
			);
		} catch (error) {
			progressModal.close();
			this.handleError(error);
			return;
		}
		window.setTimeout(() => progressModal.close(), 300);
	}

	private getPrimaryDownloadPath(preset: FeishuLibraryPreset) {
		return preset === "forms"
			? this.settings.feishu.downloadPaths.forms
			: this.settings.feishu.downloadPaths[preset];
	}

	private getFormsDownloadPath(fileName?: string) {
		const normalizedName = fileName?.trim().toLowerCase() ?? "";
		if (normalizedName.endsWith(".js")) {
			return this.settings.feishu.downloadPaths.formScripts;
		}

		return this.settings.feishu.downloadPaths.forms;
	}

	async getAttachmentPreviewUrl(
		preset: FeishuLibraryPreset,
		attachment: FeishuAttachment,
	): Promise<string | null> {
		const cached = this.attachmentPreviewUrlCache.get(
			attachment.file_token,
		);
		if (cached) {
			return cached;
		}

		try {
			const { tenantAccessToken } =
				await this.resolveFeishuContext(preset);
			const binary = await downloadAttachment(
				tenantAccessToken,
				attachment,
			);
			const blob = new Blob([Uint8Array.from(binary)], {
				type: attachment.type || guessMimeType(attachment.name),
			});
			const objectUrl = URL.createObjectURL(blob);
			this.attachmentPreviewUrlCache.set(
				attachment.file_token,
				objectUrl,
			);
			return objectUrl;
		} catch (error) {
			console.error(
				"[components-lib-downloader] Failed to build preview url",
				{ preset, attachment, error },
			);
			return null;
		}
	}

	private buildDownloadedFileState(
		preset: FeishuLibraryPreset,
		record: FeishuRecord,
		attachment: FeishuAttachment,
		targetPath: string,
	) {
		return {
			libraryPreset: preset,
			recordId: record.record_id,
			fileToken: attachment.file_token,
			fileName: attachment.name,
			targetPath,
			downloadedAt: new Date().toISOString(),
		};
	}

	private async persistDownloadedFile(
		preset: FeishuLibraryPreset,
		recordId: string,
		attachment: FeishuAttachment,
		targetPath: string,
	) {
		const record = this.libraryRecordsCache[preset]?.find(
			(item) => item.record_id === recordId,
		);
		if (!record) {
			return;
		}

		this.downloadedFiles[attachment.file_token] =
			this.buildDownloadedFileState(
				preset,
				record,
				attachment,
				targetPath,
			);
	}

	private handleError(error: unknown) {
		const message =
			error instanceof Error ? error.message : LL.common.unknownError();
		console.error("[components-lib-downloader]", message, error);
		new Notice(message);
	}

	public async openPluginView(viewType: string) {
		// 检查是否已经有打开的视图
		const existingLeaves = this.app.workspace.getLeavesOfType(viewType);

		if (existingLeaves.length > 0) {
			// 如果存在，则激活第一个视图
			this.app.workspace.revealLeaf(existingLeaves[0]);
		} else {
			// 如果不存在，则创建新的视图
			const leaf = this.app.workspace.getLeaf("tab");
			await leaf.setViewState({
				type: viewType,
				active: true,
			});

			this.app.workspace.revealLeaf(leaf);
		}
	}
}
