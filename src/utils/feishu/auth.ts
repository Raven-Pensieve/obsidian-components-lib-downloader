import { LL } from "@src/i18n/i18n";
import {
	FeishuRuntimeToken,
	FeishuTenantTokenResponse,
} from "@src/types/feishu";
import { IPluginSettings } from "@src/types/types";
import { requestJson } from "./request";

export class FeishuApiError extends Error {
	readonly code?: number;
	readonly details?: unknown;

	constructor(message: string, code?: number, details?: unknown) {
		super(message);
		this.name = "FeishuApiError";
		this.code = code;
		this.details = details;
	}
}

function isTenantTokenResponse(
	data: FeishuTenantTokenResponse | { msg?: string; code?: number },
): data is FeishuTenantTokenResponse {
	return (
		"code" in data &&
		data.code === 0 &&
		"tenant_access_token" in data &&
		typeof data.tenant_access_token === "string" &&
		"expire" in data &&
		typeof data.expire === "number"
	);
}

export default class FeishuAuthService {
	#token: FeishuRuntimeToken | null = null;

	async getTenantAccessToken(settings: IPluginSettings): Promise<string> {
		if (this.#token && this.#token.expiresAt > Date.now()) {
			console.debug(
				"[components-lib-downloader] Reuse cached tenant access token",
			);
			return this.#token.token;
		}

		const { appId, appSecret } = settings.feishu;
		if (!appId || !appSecret) {
			throw new FeishuApiError(LL.feishu.errors.missingAppCredentials());
		}

		const { status, data } = await requestJson<
			FeishuTenantTokenResponse | { msg?: string; code?: number }
		>({
			url: "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal",
			method: "POST",
			headers: {
				"Content-Type": "application/json; charset=utf-8",
			},
			body: JSON.stringify({
				app_id: appId,
				app_secret: appSecret,
			}),
		});

		if (status < 200 || status >= 300 || !isTenantTokenResponse(data)) {
			console.error(
				"[components-lib-downloader] Failed to get tenant access token",
				{
					status,
					data,
				},
			);
			throw new FeishuApiError(
				LL.feishu.errors.failedTenantToken({
					reason: ("msg" in data && data.msg) || `HTTP ${status}`,
				}),
				"code" in data ? data.code : status,
				data,
			);
		}

		this.#token = {
			token: data.tenant_access_token,
			expiresAt: Date.now() + Math.max(data.expire - 300, 60) * 1000,
		};
		console.info("[components-lib-downloader] Fetched tenant access token");
		return this.#token.token;
	}

	clear() {
		this.#token = null;
	}
}
