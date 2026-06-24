import * as fs from "fs";
import * as path from "path";
import {
	DEFAULT_SETTINGS,
	FEISHU_LIBRARY_PRESETS,
	type IPluginSettings,
} from "../src/types/types";
import FeishuAuthService from "../src/utils/feishu/auth";
import {
	buildLibraryCards,
	searchAllRecords,
} from "../src/utils/feishu/bitable";
import { parseWikiUrl, resolveBitableTarget } from "../src/utils/feishu/wiki";

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
	const appId = getEnvValue(env, "appId", "APP_ID", "FEISHU_APP_ID");
	const appSecret = getEnvValue(
		env,
		"appSecret",
		"APP_SECRET",
		"FEISHU_APP_SECRET",
	);

	return {
		feishu: {
			appId,
			appSecret,
			downloadPaths: DEFAULT_SETTINGS.feishu.downloadPaths,
		},
	};
}

function summarizeFieldValue(value: unknown): unknown {
	if (Array.isArray(value)) {
		return value.slice(0, 2).map((item) => summarizeFieldValue(item));
	}

	if (!value || typeof value !== "object") {
		return value;
	}

	const record = value as Record<string, unknown>;
	if (typeof record.file_token === "string") {
		return {
			file_token: record.file_token,
			name: record.name,
			type: record.type,
		};
	}

	const summary: Record<string, unknown> = {};
	for (const key of Object.keys(record).slice(0, 4)) {
		summary[key] = summarizeFieldValue(record[key]);
	}
	return summary;
}

describe("feishu connectivity helpers", () => {
	jest.setTimeout(60000);

	const settings = loadIntegrationSettings();

	it("parses built-in wiki url fields", () => {
		const parsed = parseWikiUrl(FEISHU_LIBRARY_PRESETS.xdbjs.wikiUrl);

		expect(parsed.nodeToken).toBe("KrFBwdOiUibf6PkWopWcJUTenzh");
		expect(parsed.tableId).toBe("tbliYpzt4EGxEymU");
		expect(parsed.viewId).toBe("");
	});

	it("gets tenant access token with real request", async () => {
		expect(settings.feishu.appId).toBeTruthy();
		expect(settings.feishu.appSecret).toBeTruthy();

		const service = new FeishuAuthService();
		const token = await service.getTenantAccessToken(settings);

		expect(token).toBeTruthy();
		expect(typeof token).toBe("string");
	});

	it("resolves wiki target and fetches one real record with field names and values", async () => {
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
		const firstRecord = records[0];
		const fieldNames = Object.keys(firstRecord?.fields ?? {});
		const fieldSamples = Object.fromEntries(
			fieldNames
				.slice(0, 8)
				.map((key) => [
					key,
					summarizeFieldValue(firstRecord.fields[key]),
				]),
		);
		const [firstCard] = buildLibraryCards("xdbjs", [firstRecord]);

		expect(resolved).toMatchObject({
			nodeToken: "KrFBwdOiUibf6PkWopWcJUTenzh",
			tableId: "tbliYpzt4EGxEymU",
		});
		expect(resolved.appToken).toBeTruthy();
		expect(records.length).toBeGreaterThan(0);
		expect(firstRecord).toBeTruthy();
		expect(firstRecord.record_id).toBeTruthy();
		expect(fieldNames.length).toBeGreaterThan(0);
		expect(firstCard).toBeTruthy();
		expect(firstCard.title).toBeTruthy();

		console.log(
			JSON.stringify(
				{
					recordId: firstRecord.record_id,
					fieldNames,
					fieldSamples,
					cardTitle: firstCard.title,
					description: firstCard.description,
				},
				null,
				2,
			),
		);
	});
});
