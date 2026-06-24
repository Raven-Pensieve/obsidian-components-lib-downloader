import { LL } from "@src/i18n/i18n";
import { FeishuNodeResponse, FeishuResolvedTarget } from "@src/types/feishu";
import { FeishuApiError } from "./auth";
import { requestJson } from "./request";

function isNodeResponse(
	data: FeishuNodeResponse | { msg?: string; code?: number },
): data is FeishuNodeResponse {
	return "code" in data && data.code === 0 && "data" in data;
}

export function parseWikiUrl(input: string): FeishuResolvedTarget {
	let wikiUrl: URL;
	try {
		wikiUrl = new URL(input);
	} catch {
		throw new FeishuApiError(LL.feishu.errors.invalidWikiUrl());
	}

	const nodeToken = wikiUrl.pathname.split("/").filter(Boolean).pop() ?? "";
	const tableId = wikiUrl.searchParams.get("table") ?? "";
	const viewId = wikiUrl.searchParams.get("view") ?? "";

	if (!nodeToken) {
		throw new FeishuApiError(LL.feishu.errors.cannotParseWikiNodeToken());
	}

	return {
		nodeToken,
		tableId,
		viewId,
		appToken: "",
	};
}

export async function resolveBitableTarget(
	wikiUrl: string,
	tenantAccessToken: string,
): Promise<FeishuResolvedTarget> {
	const parsed = parseWikiUrl(wikiUrl);
	const getNodeUrl = new URL(
		"https://open.feishu.cn/open-apis/wiki/v2/spaces/get_node",
	);
	getNodeUrl.searchParams.set("token", parsed.nodeToken);

	const { status, data } = await requestJson<
		FeishuNodeResponse | { msg?: string; code?: number }
	>({
		url: getNodeUrl.toString(),
		method: "GET",
		headers: {
			Authorization: `Bearer ${tenantAccessToken}`,
			"Content-Type": "application/json; charset=utf-8",
		},
	});

	if (status < 200 || status >= 300 || !isNodeResponse(data)) {
		console.error(
			"[components-lib-downloader] Failed to resolve wiki node",
			{
				status,
				data,
				wikiUrl,
			},
		);
		throw new FeishuApiError(
			LL.feishu.errors.failedResolveWikiNode({
				reason: ("msg" in data && data.msg) || `HTTP ${status}`,
			}),
			"code" in data ? data.code : status,
			data,
		);
	}

	if (data.data.node.obj_type !== "bitable") {
		throw new FeishuApiError(
			LL.feishu.errors.targetNotBitable({
				objType: data.data.node.obj_type,
			}),
		);
	}

	console.info("[components-lib-downloader] Resolved wiki bitable target", {
		wikiUrl,
		appToken: data.data.node.obj_token,
		tableId: parsed.tableId,
		viewId: parsed.viewId,
	});

	return {
		...parsed,
		appToken: data.data.node.obj_token,
	};
}
