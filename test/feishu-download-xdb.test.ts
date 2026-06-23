import * as fs from "fs";
import * as path from "path";

type EnvMap = Record<string, string>;

type FeishuApiResponse<T> = {
	code: number;
	msg: string;
	data: T;
};

type TenantTokenResponse = {
	code: number;
	msg: string;
	tenant_access_token: string;
	expire: number;
};

type WikiNodeData = {
	node: {
		node_token: string;
		obj_type: string;
		obj_token: string;
	};
};

type SearchRecordsData = {
	has_more: boolean;
	total: number;
	items: Array<{
		record_id: string;
		fields: Record<string, unknown>;
	}>;
};

type FeishuAttachment = {
	file_token: string;
	name: string;
	size?: number;
	type?: string;
	url?: string;
	tmp_url?: string;
};

const WIKI_URL =
	"https://my.feishu.cn/wiki/KrFBwdOiUibf6PkWopWcJUTenzh?table=tbliYpzt4EGxEymU&view=vewfQKaEv2";
const ATTACHMENT_FIELD_NAME = "xdb.js文件";

function loadEnvFile(): EnvMap {
	const envPath = path.resolve(process.cwd(), ".env");
	const raw = fs.readFileSync(envPath, "utf8");
	const env: EnvMap = {};

	for (const line of raw.split(/\r?\n/)) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("#")) continue;

		const separatorIndex = trimmed.indexOf("=");
		if (separatorIndex === -1) continue;

		const key = trimmed.slice(0, separatorIndex).trim();
		let value = trimmed.slice(separatorIndex + 1).trim();
		value = value.replace(/^['"]|['"]$/g, "");
		env[key] = value;
	}

	return env;
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
	const response = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json; charset=utf-8",
		},
		body: JSON.stringify(body),
	});

	return (await response.json()) as T;
}

async function getJson<T>(url: string, token: string): Promise<FeishuApiResponse<T>> {
	const response = await fetch(url, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json; charset=utf-8",
		},
	});

	return (await response.json()) as FeishuApiResponse<T>;
}

async function resolveTenantAccessToken(env: EnvMap): Promise<string> {
	const tokenResult = await postJson<TenantTokenResponse>(
		"https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal",
		{
			app_id: env.appId,
			app_secret: env.appSecret,
		},
	);

	expect(tokenResult.code).toBe(0);
	expect(tokenResult.tenant_access_token).toBeTruthy();

	return tokenResult.tenant_access_token;
}

async function resolveAppToken(tenantAccessToken: string, wikiNodeToken: string): Promise<string> {
	const getNodeUrl = new URL("https://open.feishu.cn/open-apis/wiki/v2/spaces/get_node");
	getNodeUrl.searchParams.set("token", wikiNodeToken);

	const nodeResult = await getJson<WikiNodeData>(getNodeUrl.toString(), tenantAccessToken);
	expect(nodeResult.code).toBe(0);
	expect(nodeResult.data.node.obj_type).toBe("bitable");
	expect(nodeResult.data.node.obj_token).toBeTruthy();

	return nodeResult.data.node.obj_token;
}

async function searchRecords(
	tenantAccessToken: string,
	appToken: string,
	tableId: string,
	viewId: string,
): Promise<FeishuApiResponse<SearchRecordsData>> {
	const searchUrl = new URL(
		`https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records/search`,
	);
	searchUrl.searchParams.set("page_size", "10");

	const response = await fetch(searchUrl.toString(), {
		method: "POST",
		headers: {
			Authorization: `Bearer ${tenantAccessToken}`,
			"Content-Type": "application/json; charset=utf-8",
		},
		body: JSON.stringify({
			view_id: viewId || undefined,
		}),
	});

	return (await response.json()) as FeishuApiResponse<SearchRecordsData>;
}

function getAttachmentsFromRecord(fields: Record<string, unknown>, fieldName: string): FeishuAttachment[] {
	const value = fields[fieldName];
	if (!Array.isArray(value)) return [];
	return value as FeishuAttachment[];
}

describe("Feishu xdb attachment download", () => {
	jest.setTimeout(30000);

	const env = loadEnvFile();
	const wikiUrl = new URL(WIKI_URL);
	const wikiNodeToken = wikiUrl.pathname.split("/").filter(Boolean).pop() ?? "";
	const tableId = wikiUrl.searchParams.get("table") ?? "";
	const viewId = wikiUrl.searchParams.get("view") ?? "";

	it("can download attachment from xdb.js field", async () => {
		expect(env.appId).toBeTruthy();
		expect(env.appSecret).toBeTruthy();
		expect(wikiNodeToken).toBeTruthy();
		expect(tableId).toBeTruthy();

		const tenantAccessToken = await resolveTenantAccessToken(env);
		const appToken = await resolveAppToken(tenantAccessToken, wikiNodeToken);
		const recordsResult = await searchRecords(tenantAccessToken, appToken, tableId, viewId);

		expect(recordsResult.code).toBe(0);

		const recordWithAttachment = recordsResult.data.items.find((item) => {
			return getAttachmentsFromRecord(item.fields, ATTACHMENT_FIELD_NAME).length > 0;
		});

		expect(recordWithAttachment).toBeTruthy();

		const attachments = getAttachmentsFromRecord(recordWithAttachment!.fields, ATTACHMENT_FIELD_NAME);
		const attachment = attachments[0];

		expect(attachment).toBeTruthy();
		expect(attachment.file_token).toBeTruthy();

		const downloadUrl = attachment.url ?? `https://open.feishu.cn/open-apis/drive/v1/medias/${attachment.file_token}/download`;
		const response = await fetch(downloadUrl, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${tenantAccessToken}`,
			},
		});

		expect(response.ok).toBe(true);

		const arrayBuffer = await response.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		expect(buffer.length).toBeGreaterThan(0);

		const outputDir = path.resolve(process.cwd(), "test", "downloads");
		fs.mkdirSync(outputDir, { recursive: true });

		const fileName = (attachment.name || `${attachment.file_token}.bin`).replace(/[\\/:*?"<>|]/g, "_");
		const outputPath = path.resolve(outputDir, fileName);
		fs.writeFileSync(outputPath, buffer);

		console.log(
			JSON.stringify(
				{
					recordId: recordWithAttachment!.record_id,
					fieldName: ATTACHMENT_FIELD_NAME,
					fileToken: attachment.file_token,
					fileName,
					outputPath,
					bytes: buffer.length,
				},
				null,
				2,
			),
		);
	});
});
