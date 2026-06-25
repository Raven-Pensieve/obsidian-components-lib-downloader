import { SettingsStoreContext } from "@src/context/SettingsStoreContext";
import CPlugin from "@src/main";
import { PluginSettingTab } from "obsidian";
import { StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Settings } from "./Settings";

export class CLDSettingsTab extends PluginSettingTab {
	plugin: CPlugin;
	root: Root;
	icon: string = "library";

	constructor(plugin: CPlugin) {
		super(plugin.app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		this.root = createRoot(containerEl);

		this.root.render(
			<StrictMode>
				<SettingsStoreContext.Provider
					value={this.plugin.settingsStore}
				>
					<Settings />
				</SettingsStoreContext.Provider>
			</StrictMode>,
		);
	}

	hide() {
		this.root.unmount();
		this.containerEl.empty();
	}
}
