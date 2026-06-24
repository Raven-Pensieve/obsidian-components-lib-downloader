import { LL } from "@src/i18n/i18n";
import { Modal, Plugin } from "obsidian";
import { Root, createRoot } from "react-dom/client";

type DownloadProgressModalContentProps = {
	title: string;
	progress: number;
	message: string;
};

function DownloadProgressModalContent(
	props: DownloadProgressModalContentProps,
) {
	return (
		<div className="cld-download-progress-modal">
			<h3>{props.title}</h3>
			<p className="cld-download-progress-status">{props.message}</p>
			<div className="cld-download-progress-track">
				<div
					className="cld-download-progress-bar"
					style={{ width: `${props.progress}%` }}
				/>
			</div>
			<span className="cld-download-progress-percent">
				{props.progress}%
			</span>
		</div>
	);
}

export class DownloadProgressModal extends Modal {
	private readonly modalTitle: string;
	private root?: Root;
	private progress = 0;
	private message: string = LL.modals.downloadProgress.preparing();

	constructor(plugin: Plugin, title: string) {
		super(plugin.app);
		this.modalTitle = title;
	}

	onOpen() {
		this.titleEl.setText(LL.modals.downloadProgress.title());
		this.contentEl.empty();
		this.root = createRoot(this.contentEl);
		this.render();
	}

	onClose() {
		this.root?.unmount();
		this.root = undefined;
		this.contentEl.empty();
	}

	update(progress: number, message: string) {
		this.progress = Math.max(0, Math.min(100, Math.round(progress)));
		this.message = message;
		this.render();
	}

	private render() {
		this.root?.render(
			<DownloadProgressModalContent
				title={this.modalTitle}
				progress={this.progress}
				message={this.message}
			/>,
		);
	}
}
