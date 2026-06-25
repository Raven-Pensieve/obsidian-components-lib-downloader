export type OverwriteMode = "skip" | "rename" | "overwrite";
export type FeishuLibraryPreset =
	| "componentsOfficial"
	| "components"
	| "xdbjs"
	| "forms";

export interface LibraryDownloadPaths {
	componentsOfficial: string;
	xdbjs: string;
	components: string;
	forms: string;
	formScripts: string;
}

export interface FeishuLibraryPresetConfig {
	wikiUrl: string;
	targetFolderName: string;
	visibleFieldKeys: string[];
}

export const FEISHU_LIBRARY_PRESETS: Record<
	FeishuLibraryPreset,
	FeishuLibraryPresetConfig
> = {
	componentsOfficial: {
		wikiUrl:
			"https://my.feishu.cn/wiki/Bmz3wJSRHiwzWvkfKx5caPawnde?table=tblRk7emhFNjFIQF",
		targetFolderName: "components-official",
		visibleFieldKeys: ["描述", "类型", "额外使用说明"],
	},
	components: {
		wikiUrl:
			"https://my.feishu.cn/wiki/GDMjwP9rPiuTFwkg0BhcsOfDnab?table=tblxUkoeHQ9gpFya",
		targetFolderName: "components",
		visibleFieldKeys: ["描述", "类型", "额外使用说明"],
	},
	xdbjs: {
		wikiUrl:
			"https://my.feishu.cn/wiki/KrFBwdOiUibf6PkWopWcJUTenzh?table=tbliYpzt4EGxEymU",
		targetFolderName: "xdbjs",
		visibleFieldKeys: ["描述"],
	},
	forms: {
		wikiUrl:
			"https://my.feishu.cn/wiki/V7SfwXcGmiFqDWkk2Wnc8PCOnPf?table=tblYjPkaaTOujkEY",
		targetFolderName: "forms",
		visibleFieldKeys: ["描述", "类型", "额外说明"],
	},
};

export interface IFeishuSettings {
	appId: string;
	appSecret: string;
	defaultLibraryPreset: FeishuLibraryPreset;
	downloadPaths: LibraryDownloadPaths;
}

export interface DownloadedFileState {
	libraryPreset: FeishuLibraryPreset;
	recordId: string;
	fileToken: string;
	fileName: string;
	targetPath: string;
	downloadedAt: string;
}

export interface IPluginSettings {
	feishu: IFeishuSettings;
}

export const DEFAULT_SETTINGS: IPluginSettings = {
	feishu: {
		appId: "",
		appSecret: "",
		defaultLibraryPreset: "components",
		downloadPaths: {
			componentsOfficial: "FeishuDownloads/components-official",
			xdbjs: "FeishuDownloads/xdbjs",
			components: "FeishuDownloads/components",
			forms: "FeishuDownloads/forms",
			formScripts: "FeishuDownloads/forms/scripts",
		},
	},
};
