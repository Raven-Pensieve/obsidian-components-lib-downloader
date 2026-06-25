import * as fs from "fs";
import * as path from "path";
import type { FeishuAttachment } from "../src/types/feishu";
import {
	DEFAULT_SETTINGS,
	FEISHU_LIBRARY_PRESETS,
	type IPluginSettings,
} from "../src/types/types";
import FeishuAuthService from "../src/utils/feishu/auth";
import { searchAllRecords } from "../src/utils/feishu/bitable";
import { downloadAttachment } from "../src/utils/feishu/download";
import { resolveBitableTarget } from "../src/utils/feishu/wiki";

jest.mock(
	"obsidian",
	() => ({
		requestUrl: jest.fn(
			async (options: {
				url: string;
				method?: string;
				headers?: Record<string, string>;
				body?: string;
			}) => {
				const response = await fetch(options.url, {
					method: options.method ?? "GET",
					headers: options.headers,
					body: options.body,
				});
				const arrayBuffer = await response.arrayBuffer();
				const text = Buffer.from(arrayBuffer).toString("utf8");
				let json: unknown = null;

				try {
					json = text ? JSON.parse(text) : null;
				} catch {
					json = null;
				}

				return {
					status: response.status,
					json,
					arrayBuffer,
				};
			},
		),
	}),
	{ virtual: true },
);

function loadEnvMap() {
	const envPath = path.resolve(process.cwd(), ".env");
	const env: Record<string, string> = { ...process.env } as Record<
		string,
		string
	>;

	if (!fs.existsSync(envPath)) {
		return env;
	}

	const raw = fs.readFileSync(envPath, "utf8");
	for (const line of raw.split(/\r?\n/)) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("#")) {
			continue;
		}

		const separatorIndex = trimmed.indexOf("=");
		if (separatorIndex === -1) {
			continue;
		}

		const key = trimmed.slice(0, separatorIndex).trim();
		const value = trimmed
			.slice(separatorIndex + 1)
			.trim()
			.replace(/^['"]|['"]$/g, "");
		if (!(key in env)) {
			env[key] = value;
		}
	}

	return env;
}

function getEnvValue(env: Record<string, string>, ...keys: string[]) {
	for (const key of keys) {
		const value = env[key];
		if (value) {
			return value;
		}
	}

	return "";
}

function loadIntegrationSettings(): IPluginSettings {
	const env = loadEnvMap();
	return {
		feishu: {
			appId: getEnvValue(env, "appId", "APP_ID", "FEISHU_APP_ID"),
			appSecret: getEnvValue(
				env,
				"appSecret",
				"APP_SECRET",
				"FEISHU_APP_SECRET",
			),
			defaultLibraryPreset: DEFAULT_SETTINGS.feishu.defaultLibraryPreset,
			downloadPaths: DEFAULT_SETTINGS.feishu.downloadPaths,
		},
	};
}

describe("feishu xdb attachment download", () => {
	jest.setTimeout(60000);

	const settings = loadIntegrationSettings();

	it("downloads a real xdb attachment with existing helper", async () => {
		expect(settings.feishu.appId).toBeTruthy();
		expect(settings.feishu.appSecret).toBeTruthy();

		const service = new FeishuAuthService();
		const tenantToken = await service.getTenantAccessToken(settings);
		const resolved = await resolveBitableTarget(
			FEISHU_LIBRARY_PRESETS.xdbjs.wikiUrl,
			tenantToken,
		);
		const records = await searchAllRecords(
			tenantToken,
			resolved.appToken,
			resolved.tableId,
			resolved.viewId,
		);

		const recordWithAttachment = records.find((record) =>
			Object.values(record.fields).some(
				(value) =>
					Array.isArray(value) &&
					value.some(
						(item) =>
							item &&
							typeof item === "object" &&
							"file_token" in item &&
							"name" in item,
					),
			),
		);

		expect(recordWithAttachment).toBeTruthy();

		const attachment = Object.values(recordWithAttachment!.fields)
			.flatMap((value) => (Array.isArray(value) ? value : []))
			.find((item): item is FeishuAttachment =>
				Boolean(
					item &&
					typeof item === "object" &&
					"file_token" in item &&
					"name" in item,
				),
			);

		expect(attachment).toBeTruthy();
		const buffer = await downloadAttachment(tenantToken, attachment!);

		expect(buffer.byteLength).toBeGreaterThan(0);

		console.log(
			JSON.stringify(
				{
					recordId: recordWithAttachment!.record_id,
					fileToken: attachment!.file_token,
					fileName: attachment!.name,
					bytes: buffer.byteLength,
				},
				null,
				2,
			),
		);
	});

	it("throws when attachment has no download url", async () => {
		const attachment: FeishuAttachment = {
			file_token: "file_token_missing_url",
			name: "xdb.js",
		};

		await expect(
			downloadAttachment("tenant-token", attachment),
		).rejects.toThrow("Attachment xdb.js does not include a download url.");
	});
});
