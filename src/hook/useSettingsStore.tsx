import { SettingsStoreContext } from "@src/context/SettingsStoreContext";
import { LL } from "@src/i18n/i18n";
import SettingsStore from "@src/settings/SettingsStore";
import { useContext } from "react";

export default function useSettingsStore(): SettingsStore {
	const store = useContext(SettingsStoreContext);
	if (!store) {
		throw new Error(LL.plugin.errors.settingsStoreProviderMissing());
	}
	return store;
}
