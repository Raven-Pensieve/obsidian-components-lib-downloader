import { LL } from "@src/i18n/i18n";
import { getPresetLabel } from "@src/i18n/preset";
import { FeishuLibraryPreset } from "@src/types/types";
import { Modal, Notice, Plugin, Setting, normalizePath } from "obsidian";

export type DownloadPathModalOptions = {
	plugin: Plugin;
	preset: FeishuLibraryPreset;
	initialPath: string;
	secondaryPath?: string;
	onSubmit: (paths: {
		primaryPath: string;
		secondaryPath?: string;
	}) => Promise<void>;
};

export class DownloadPathModal extends Modal {
	private readonly preset: FeishuLibraryPreset;
	private readonly initialPath: string;
	private readonly secondaryPath?: string;
	private readonly onSubmitPath: (paths: {
		primaryPath: string;
		secondaryPath?: string;
	}) => Promise<void>;
	private inputValue: string;
	private secondaryInputValue: string;
	private settled = false;
	private resolveResult?: (updated: boolean) => void;

	constructor(options: DownloadPathModalOptions) {
		super(options.plugin.app);
		this.preset = options.preset;
		this.initialPath = options.initialPath;
		this.secondaryPath = options.secondaryPath;
		this.onSubmitPath = options.onSubmit;
		this.inputValue = options.initialPath;
		this.secondaryInputValue = options.secondaryPath ?? "";
	}

	openAndWait(): Promise<boolean> {
		return new Promise((resolve) => {
			this.resolveResult = resolve;
			this.open();
		});
	}

	onOpen() {
		const presetLabel = getPresetLabel(this.preset);
		this.titleEl.setText(
			LL.modals.downloadPath.title({ label: presetLabel }),
		);
		this.contentEl.empty();
		this.contentEl.addClass("cld-download-path-modal");
		this.contentEl.createEl("p", {
			text: LL.modals.downloadPath.message({ label: presetLabel }),
		});

		new Setting(this.contentEl)
			.setName(LL.modals.downloadPath.primaryName())
			.setDesc(LL.modals.downloadPath.primaryDesc())
			.addText((text) => {
				text.setPlaceholder("FeishuDownloads/components")
					.setValue(this.initialPath)
					.onChange((value) => {
						this.inputValue = value;
					});
				text.inputEl.addClass("cld-download-path-input");
			});

		if (this.secondaryPath !== undefined) {
			new Setting(this.contentEl)
				.setName(LL.modals.downloadPath.secondaryName())
				.setDesc(LL.modals.downloadPath.secondaryDesc())
				.addText((text) => {
					text.setPlaceholder("FeishuDownloads/forms/scripts")
						.setValue(this.secondaryPath ?? "")
						.onChange((value) => {
							this.secondaryInputValue = value;
						});
					text.inputEl.addClass("cld-download-path-input");
				});
		}

		new Setting(this.contentEl)
			.addButton((button) => {
				button.setButtonText(LL.common.cancel()).onClick(() => {
					this.finish(false);
				});
			})
			.addButton((button) => {
				button
					.setButtonText(LL.common.save())
					.setCta()
					.onClick(() => {
						void this.submit();
					});
			});
	}

	onClose() {
		if (!this.settled) {
			this.resolveResult?.(false);
		}
		this.contentEl.empty();
	}

	private async submit() {
		const trimmed = this.inputValue.trim();
		if (!trimmed) {
			new Notice(LL.modals.downloadPath.primaryRequired());
			return;
		}

		const trimmedSecondary = this.secondaryInputValue.trim();
		if (this.secondaryPath !== undefined && !trimmedSecondary) {
			new Notice(LL.modals.downloadPath.secondaryRequired());
			return;
		}

		const normalized = normalizePath(trimmed);
		await this.onSubmitPath({
			primaryPath: normalized,
			secondaryPath:
				this.secondaryPath !== undefined
					? normalizePath(trimmedSecondary)
					: undefined,
		});
		this.finish(true);
	}

	private finish(updated: boolean) {
		this.settled = true;
		this.resolveResult?.(updated);
		this.close();
	}
}
