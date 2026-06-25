import { SetupGuidePanel } from "@src/components/SetupGuidePanel";
import { TabNav } from "@src/components/tab-nav/TabNav";
import usePluginSettings from "@src/hook/usePluginSettings";
import useSettingsStore from "@src/hook/useSettingsStore";
import { LL } from "@src/i18n/i18n";
import { getPresetLabel } from "@src/i18n/preset";
import CPlugin from "@src/main";
import { ButtonComponent, Notice, Setting } from "obsidian";
import { FC, useEffect, useMemo, useRef } from "react";

type ExternalPluginState = {
	installed: boolean;
	enabled: boolean;
	settings?: Record<string, string | undefined>;
};

export const Settings: FC = () => {
	const settingsStore = useSettingsStore();
	const settings = usePluginSettings(settingsStore);

	const defaultTab = useMemo(
		() => (hasFeishuCredentials(settings) ? "general" : "guide"),
		[settings],
	);

	return (
		<TabNav
			defaultValue={defaultTab}
			tabs={[
				{
					id: "general",
					title: LL.settings.tabs.general(),
					content: <GeneralSettingsPanel />,
				},
				{
					id: "guide",
					title: LL.settings.tabs.guide(),
					content: <SetupGuidePanel />,
				},
			]}
		></TabNav>
	);
};

const GeneralSettingsPanel: FC = () => {
	const settingsStore = useSettingsStore();
	const settings = usePluginSettings(settingsStore);
	const generalRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!generalRef.current) return;

		const el = generalRef.current;
		el.empty();

		new Setting(el).setName(LL.common.appId()).addText((text) => {
			text.setPlaceholder(LL.settings.appIdPlaceholder())
				.setValue(settings.feishu.appId)
				.onChange(async (value) => {
					await settingsStore.updateSettingByPath(
						"feishu.appId",
						value.trim(),
					);
				});
		});

		new Setting(el).setName(LL.common.appSecret()).addText((text) => {
			text.inputEl.type = "password";
			text.setPlaceholder(LL.settings.appSecretPlaceholder())
				.setValue(settings.feishu.appSecret)
				.onChange(async (value) => {
					await settingsStore.updateSettingByPath(
						"feishu.appSecret",
						value.trim(),
					);
				});
		});

		new Setting(el)
			.setName(
				LL.settings.componentsDownloadPath({
					label: getPresetLabel("components"),
				}),
			)
			.setDesc(LL.settings.componentsDownloadPathDesc())
			.addText((text) => {
				text.setPlaceholder(LL.settings.componentsPathPlaceholder())
					.setValue(settings.feishu.downloadPaths.components)
					.onChange(async (value) => {
						await settingsStore.updateSettingByPath(
							"feishu.downloadPaths.components",
							value.trim(),
						);
					});
			})
			.addButton((button) => {
				configureSyncButton(
					button,
					LL.settings.syncTooltip({ path: "components.folder" }),
					async () => {
						await syncExternalSetting({
							settingsStore,
							pluginId: "components",
							settingKey: "folder",
							targetPath: "feishu.downloadPaths.components",
							label: LL.settings.componentsDownloadPath({
								label: getPresetLabel("components"),
							}),
						});
					},
				);
			});

		new Setting(el)
			.setName(
				LL.settings.xdbjsDownloadPath({
					label: getPresetLabel("xdbjs"),
				}),
			)
			.setDesc(LL.settings.xdbjsDownloadPathDesc())
			.addText((text) => {
				text.setPlaceholder(LL.settings.xdbjsPathPlaceholder())
					.setValue(settings.feishu.downloadPaths.xdbjs)
					.onChange(async (value) => {
						await settingsStore.updateSettingByPath(
							"feishu.downloadPaths.xdbjs",
							value.trim(),
						);
					});
			})
			.addButton((button) => {
				configureSyncButton(
					button,
					LL.settings.syncTooltip({
						path: "components.scriptFolder",
					}),
					async () => {
						await syncExternalSetting({
							settingsStore,
							pluginId: "components",
							settingKey: "scriptFolder",
							targetPath: "feishu.downloadPaths.xdbjs",
							label: LL.settings.xdbjsDownloadPath({
								label: getPresetLabel("xdbjs"),
							}),
						});
					},
				);
			});

		new Setting(el)
			.setName(
				LL.settings.formsCformDownloadPath({
					label: getPresetLabel("forms"),
				}),
			)
			.setDesc(LL.settings.formsCformDownloadPathDesc())
			.addText((text) => {
				text.setPlaceholder(LL.settings.formsPathPlaceholder())
					.setValue(settings.feishu.downloadPaths.forms)
					.onChange(async (value) => {
						await settingsStore.updateSettingByPath(
							"feishu.downloadPaths.forms",
							value.trim(),
						);
					});
			})
			.addButton((button) => {
				configureSyncButton(
					button,
					LL.settings.syncTooltip({ path: "form-flow.formFolder" }),
					async () => {
						await syncExternalSetting({
							settingsStore,
							pluginId: "form-flow",
							settingKey: "formFolder",
							targetPath: "feishu.downloadPaths.forms",
							label: LL.settings.formsCformDownloadPath({
								label: getPresetLabel("forms"),
							}),
						});
					},
				);
			});

		new Setting(el)
			.setName(
				LL.settings.formsJsDownloadPath({
					label: getPresetLabel("forms"),
				}),
			)
			.setDesc(LL.settings.formsJsDownloadPathDesc())
			.addText((text) => {
				text.setPlaceholder(LL.settings.formScriptsPathPlaceholder())
					.setValue(settings.feishu.downloadPaths.formScripts)
					.onChange(async (value) => {
						await settingsStore.updateSettingByPath(
							"feishu.downloadPaths.formScripts",
							value.trim(),
						);
					});
			})
			.addButton((button) => {
				configureSyncButton(
					button,
					LL.settings.syncTooltip({ path: "form-flow.scriptFolder" }),
					async () => {
						await syncExternalSetting({
							settingsStore,
							pluginId: "form-flow",
							settingKey: "scriptFolder",
							targetPath: "feishu.downloadPaths.formScripts",
							label: LL.settings.formsJsDownloadPath({
								label: getPresetLabel("forms"),
							}),
						});
					},
				);
			});
	}, [settings, settingsStore]);

	return <div ref={generalRef} />;
};

function hasFeishuCredentials(settings: ReturnType<typeof usePluginSettings>) {
	return Boolean(
		settings.feishu.appId.trim() && settings.feishu.appSecret.trim(),
	);
}

function configureSyncButton(
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

async function syncExternalSetting({
	settingsStore,
	pluginId,
	settingKey,
	targetPath,
	label,
}: {
	settingsStore: ReturnType<typeof useSettingsStore>;
	pluginId: string;
	settingKey: string;
	targetPath: string;
	label: string;
}) {
	const pluginState = getExternalPluginState(settingsStore.plugin, pluginId);
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

	await settingsStore.updateSettingByPath(targetPath, value);
	new Notice(LL.settings.notices.synced({ label }));
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
