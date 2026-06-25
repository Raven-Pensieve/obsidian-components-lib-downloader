import { FeishuLibraryPreset } from "@src/types/types";
import { LL } from "./i18n";

export function getPresetLabel(preset: FeishuLibraryPreset) {
	switch (preset) {
		case "componentsOfficial":
			return LL.presets.componentsOfficial();
		case "components":
			return LL.presets.components();
		case "xdbjs":
			return LL.presets.xdbjs();
		case "forms":
		default:
			return LL.presets.forms();
	}
}
