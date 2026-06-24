import { LL } from "@src/i18n/i18n";
import { OverwriteMode } from "@src/types/types";
import { Modal, Plugin, Setting } from "obsidian";

export class OverwriteModeModal extends Modal {
	private readonly fileName: string;
	private readonly targetPath: string;
	private resolveChoice?: (value: OverwriteMode | null) => void;
	private settled = false;

	constructor(plugin: Plugin, fileName: string, targetPath: string) {
		super(plugin.app);
		this.fileName = fileName;
		this.targetPath = targetPath;
	}

	choose(): Promise<OverwriteMode | null> {
		return new Promise((resolve) => {
			this.resolveChoice = resolve;
			this.open();
		});
	}

	onOpen() {
		this.titleEl.setText(LL.modals.overwriteMode.title());
		this.contentEl.empty();
		this.contentEl.addClass("cld-overwrite-modal");
		this.contentEl.createEl("p", {
			text: LL.modals.overwriteMode.message({ fileName: this.fileName }),
		});
		this.contentEl.createEl("code", {
			text: this.targetPath,
			cls: "cld-overwrite-modal-path",
		});

		new Setting(this.contentEl)
			.addButton((button) => {
				button
					.setButtonText(LL.modals.overwriteMode.skip())
					.onClick(() => this.finish("skip"));
			})
			.addButton((button) => {
				button
					.setButtonText(LL.modals.overwriteMode.renameSave())
					.setCta()
					.onClick(() => this.finish("rename"));
			})
			.addButton((button) => {
				button
					.setButtonText(LL.modals.overwriteMode.overwrite())
					.onClick(() => this.finish("overwrite"));
			});
	}

	onClose() {
		if (!this.settled) {
			this.resolveChoice?.(null);
		}
		this.contentEl.empty();
	}

	private finish(choice: OverwriteMode) {
		this.settled = true;
		this.resolveChoice?.(choice);
		this.close();
	}
}
