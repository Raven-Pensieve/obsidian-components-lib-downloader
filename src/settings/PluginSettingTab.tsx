import { SetupGuidePanel } from "@src/components/SetupGuidePanel";
import { LL } from "@src/i18n/i18n";
import { getPresetLabel } from "@src/i18n/preset";
import CPlugin from "@src/main";
import {
	ButtonComponent,
	Notice,
	PluginSettingTab as ObPluginSettingTab,
	Setting,
} from "obsidian";
import { Root, createRoot } from "react-dom/client";

type SettingsTabKey = "general" | "guide";
type ExternalPluginState = {
	installed: boolean;
	enabled: boolean;
	settings?: Record<string, string | undefined>;
};

export class PluginSettingTab extends ObPluginSettingTab {
	plugin: CPlugin;
	guideRoot?: Root;

	constructor(plugin: CPlugin) {
		super(plugin.app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.createEl("h2", { text: LL.settings.title() });
		const defaultTab: SettingsTabKey = hasFeishuCredentials(this.plugin)
			? "general"
			: "guide";

		const tabBar = containerEl.createDiv({ cls: "cld-settings-tabbar" });
		const generalTabButton = tabBar.createEl("button", {
			text: LL.settings.tabs.general(),
			cls: "cld-settings-tab",
		});
		const guideTabButton = tabBar.createEl("button", {
			text: LL.settings.tabs.guide(),
			cls: "cld-settings-tab",
		});

		const generalTabContent = containerEl.createDiv({
			cls: "cld-settings-tab-content",
		});
		const guideTabContent = containerEl.createDiv({
			cls: "cld-settings-tab-content",
		});

		new Setting(generalTabContent)
			.setName(LL.common.appId())
			.addText((text) => {
				text.setPlaceholder(LL.settings.appIdPlaceholder())
					.setValue(this.plugin.settings.feishu.appId)
					.onChange(async (value) => {
						await this.plugin.settingsStore.updateSettingByPath(
							"feishu.appId",
							value.trim(),
						);
					});
			});

		new Setting(generalTabContent)
			.setName(LL.common.appSecret())
			.addText((text) => {
				text.inputEl.type = "password";
				text.setPlaceholder(LL.settings.appSecretPlaceholder())
					.setValue(this.plugin.settings.feishu.appSecret)
					.onChange(async (value) => {
						await this.plugin.settingsStore.updateSettingByPath(
							"feishu.appSecret",
							value.trim(),
						);
					});
			});

		new Setting(generalTabContent)
			.setName(
				LL.settings.xdbjsDownloadPath({
					label: getPresetLabel("xdbjs"),
				}),
			)
			.addText((text) => {
				text.setPlaceholder(LL.settings.xdbjsPathPlaceholder())
					.setValue(this.plugin.settings.feishu.downloadPaths.xdbjs)
					.onChange(async (value) => {
						await this.plugin.settingsStore.updateSettingByPath(
							"feishu.downloadPaths.xdbjs",
							value.trim(),
						);
					});
			})
			.addButton((button) => {
				this.configureSyncButton(
					button,
					LL.settings.syncTooltip({
						path: "components.scriptFolder",
					}),
					async () => {
						await this.syncExternalSetting(
							"components",
							"scriptFolder",
							"feishu.downloadPaths.xdbjs",
							LL.settings.xdbjsDownloadPath({
								label: getPresetLabel("xdbjs"),
							}),
						);
					},
				);
			});

		new Setting(generalTabContent)
			.setName(
				LL.settings.componentsDownloadPath({
					label: getPresetLabel("components"),
				}),
			)
			.addText((text) => {
				text.setPlaceholder(LL.settings.componentsPathPlaceholder())
					.setValue(
						this.plugin.settings.feishu.downloadPaths.components,
					)
					.onChange(async (value) => {
						await this.plugin.settingsStore.updateSettingByPath(
							"feishu.downloadPaths.components",
							value.trim(),
						);
					});
			})
			.addButton((button) => {
				this.configureSyncButton(
					button,
					LL.settings.syncTooltip({ path: "components.folder" }),
					async () => {
						await this.syncExternalSetting(
							"components",
							"folder",
							"feishu.downloadPaths.components",
							LL.settings.componentsDownloadPath({
								label: getPresetLabel("components"),
							}),
						);
					},
				);
			});

		new Setting(generalTabContent)
			.setName(
				LL.settings.formsCformDownloadPath({
					label: getPresetLabel("forms"),
				}),
			)
			.addText((text) => {
				text.setPlaceholder(LL.settings.formsPathPlaceholder())
					.setValue(this.plugin.settings.feishu.downloadPaths.forms)
					.onChange(async (value) => {
						await this.plugin.settingsStore.updateSettingByPath(
							"feishu.downloadPaths.forms",
							value.trim(),
						);
					});
			})
			.addButton((button) => {
				this.configureSyncButton(
					button,
					LL.settings.syncTooltip({ path: "form-flow.formFolder" }),
					async () => {
						await this.syncExternalSetting(
							"form-flow",
							"formFolder",
							"feishu.downloadPaths.forms",
							LL.settings.formsCformDownloadPath({
								label: getPresetLabel("forms"),
							}),
						);
					},
				);
			});

		new Setting(generalTabContent)
			.setName(
				LL.settings.formsJsDownloadPath({
					label: getPresetLabel("forms"),
				}),
			)
			.setDesc(LL.settings.formsJsDownloadPathDesc())
			.addText((text) => {
				text.setPlaceholder(LL.settings.formScriptsPathPlaceholder())
					.setValue(
						this.plugin.settings.feishu.downloadPaths.formScripts,
					)
					.onChange(async (value) => {
						await this.plugin.settingsStore.updateSettingByPath(
							"feishu.downloadPaths.formScripts",
							value.trim(),
						);
					});
			})
			.addButton((button) => {
				this.configureSyncButton(
					button,
					LL.settings.syncTooltip({ path: "form-flow.scriptFolder" }),
					async () => {
						await this.syncExternalSetting(
							"form-flow",
							"scriptFolder",
							"feishu.downloadPaths.formScripts",
							LL.settings.formsJsDownloadPath({
								label: getPresetLabel("forms"),
							}),
						);
					},
				);
			});

		generalTabContent.createEl("p", {
			text: LL.settings.syncHint(),
		});

		this.guideRoot?.unmount();
		this.guideRoot = createRoot(guideTabContent);
		this.guideRoot.render(<SetupGuidePanel />);

		const activateTab = (tab: SettingsTabKey) => {
			generalTabButton.toggleClass("is-active", tab === "general");
			guideTabButton.toggleClass("is-active", tab === "guide");
			generalTabContent.toggleClass("is-active", tab === "general");
			guideTabContent.toggleClass("is-active", tab === "guide");
		};

		generalTabButton.addEventListener("click", () =>
			activateTab("general"),
		);
		guideTabButton.addEventListener("click", () => activateTab("guide"));
		activateTab(defaultTab);
	}

	hide() {
		this.guideRoot?.unmount();
		this.guideRoot = undefined;
		this.containerEl.empty();
	}

	private configureSyncButton(
		button: ButtonComponent,
		tooltip: string,
		onClick: () => Promise<void>,
	) {
		button
			.setIcon("refresh-cw")
			.setTooltip(tooltip)
			.onClick(() => {
				void onClick();
			});
	}

	private async syncExternalSetting(
		pluginId: string,
		settingKey: string,
		targetPath: string,
		label: string,
	) {
		const pluginState = getExternalPluginState(this.plugin, pluginId);
		if (!pluginState.installed) {
			new Notice(LL.settings.notices.pluginNotInstalled({ pluginId }));
			return;
		}

		if (!pluginState.enabled) {
			new Notice(LL.settings.notices.pluginNotEnabled({ pluginId }));
			return;
		}

		const value = pluginState.settings?.[settingKey];
		if (!value) {
			new Notice(
				LL.settings.notices.settingNotFound({ pluginId, settingKey }),
			);
			return;
		}

		await this.plugin.settingsStore.updateSettingByPath(targetPath, value);
		new Notice(LL.settings.notices.synced({ label }));
		this.display();
	}
}

function hasFeishuCredentials(plugin: CPlugin) {
	return Boolean(
		plugin.settings.feishu.appId.trim() &&
		plugin.settings.feishu.appSecret.trim(),
	);
}

function getExternalPluginState(plugin: CPlugin, pluginId: string) {
	type EnabledPluginState = {
		settings?: Record<string, string | undefined>;
	};

	type PluginManagerState = {
		plugins: Record<string, EnabledPluginState | undefined>;
		manifests: Record<string, object | undefined>;
	};

	const appWithPlugins = plugin.app as CPlugin["app"] & {
		plugins: PluginManagerState;
	};
	const enabledPlugin = appWithPlugins.plugins.plugins[pluginId];

	return {
		installed: Boolean(appWithPlugins.plugins.manifests[pluginId]),
		enabled: Boolean(enabledPlugin),
		settings: enabledPlugin?.settings,
	} satisfies ExternalPluginState;
}
