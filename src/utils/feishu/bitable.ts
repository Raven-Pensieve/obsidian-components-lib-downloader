import { LL } from "@src/i18n/i18n";
import {
	FeishuAttachment,
	FeishuAttachmentGroup,
	FeishuBitableSearchResponse,
	FeishuLibraryCard,
	FeishuRecord,
} from "@src/types/feishu";
import { FeishuLibraryPreset } from "@src/types/types";
import { FeishuApiError } from "./auth";
import { requestJson } from "./request";

function isBitableSearchResponse(
	data: FeishuBitableSearchResponse | { msg?: string; code?: number },
): data is FeishuBitableSearchResponse {
	return "code" in data && data.code === 0 && "data" in data;
}

export async function searchAllRecords(
	tenantAccessToken: string,
	appToken: string,
	tableId: string,
	viewId?: string,
): Promise<FeishuRecord[]> {
	if (!tableId) {
		throw new FeishuApiError(LL.feishu.errors.missingTableId());
	}

	const items: FeishuRecord[] = [];
	let pageToken = "";
	let hasMore = true;

	while (hasMore) {
		const searchUrl = new URL(
			`https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records/search`,
		);
		searchUrl.searchParams.set("page_size", "500");
		if (pageToken) {
			searchUrl.searchParams.set("page_token", pageToken);
		}

		const { status, data } = await requestJson<
			FeishuBitableSearchResponse | { msg?: string; code?: number }
		>({
			url: searchUrl.toString(),
			method: "POST",
			headers: {
				Authorization: `Bearer ${tenantAccessToken}`,
				"Content-Type": "application/json; charset=utf-8",
			},
			body: JSON.stringify({
				view_id: viewId || undefined,
			}),
		});

		if (status < 200 || status >= 300 || !isBitableSearchResponse(data)) {
			console.error(
				"[components-lib-downloader] Failed to search records",
				{
					status,
					data,
					appToken,
					tableId,
					viewId,
				},
			);
			throw new FeishuApiError(
				LL.feishu.errors.failedSearchRecords({
					reason: ("msg" in data && data.msg) || `HTTP ${status}`,
				}),
				"code" in data ? data.code : status,
				data,
			);
		}

		items.push(...data.data.items);
		hasMore = data.data.has_more;
		pageToken = data.data.page_token ?? "";
	}

	console.info("[components-lib-downloader] Fetched bitable records", {
		tableId,
		count: items.length,
	});
	return items;
}

export function extractAttachmentGroups(
	record: FeishuRecord,
): FeishuAttachmentGroup[] {
	const groups: FeishuAttachmentGroup[] = [];

	for (const [fieldName, value] of Object.entries(record.fields ?? {})) {
		if (!Array.isArray(value) || value.length === 0) {
			continue;
		}

		const attachments = value.filter(
			isAttachmentLike,
		) as FeishuAttachment[];
		if (attachments.length > 0) {
			groups.push({ fieldName, attachments });
		}
	}

	return groups;
}

export function buildLibraryCards(
	preset: FeishuLibraryPreset,
	records: FeishuRecord[],
): FeishuLibraryCard[] {
	return records
		.map((record) => buildLibraryCard(preset, record))
		.filter((card) => card.attachmentGroups.length > 0);
}

function buildLibraryCard(
	preset: FeishuLibraryPreset,
	record: FeishuRecord,
): FeishuLibraryCard {
	const textFields = Object.entries(record.fields ?? {})
		.map(([key, value]) => ({ key, value: extractTextValue(value) }))
		.filter((field) => field.value.length > 0);

	const titleField = getTitleField(preset, textFields);
	const title =
		titleField?.value ||
		titleField?.key ||
		LL.record.fallbackTitle({ recordId: record.record_id });
	const description = textFields
		.filter((field) => field.key !== titleField?.key)
		.slice(0, 2)
		.map((field) => field.value)
		.join(" / ");

	return {
		libraryPreset: preset,
		recordId: record.record_id,
		title,
		description,
		textFields: textFields.slice(0, 6),
		attachmentGroups: extractAttachmentGroups(record),
	};
}

function getTitleField(
	preset: FeishuLibraryPreset,
	textFields: Array<{ key: string; value: string }>,
) {
	const presetPreferredTitleKeys: Partial<
		Record<FeishuLibraryPreset, string[]>
	> = {
		componentsOfficial: ["文本"],
	};

	const preferredKeys = presetPreferredTitleKeys[preset] ?? [];
	for (const key of preferredKeys) {
		const field = textFields.find((item) => item.key === key);
		if (field) {
			return field;
		}
	}

	return (
		textFields.find((field) =>
			/^(名称|名字|标题|title|name)$/i.test(field.key),
		) ||
		textFields.find((field) =>
			/(名称|名字|标题|title|name)/i.test(field.key),
		) ||
		textFields[0]
	);
}

function isAttachmentLike(value: unknown): value is FeishuAttachment {
	if (!value || typeof value !== "object") {
		return false;
	}

	const record = value as Record<string, unknown>;
	return (
		typeof record.file_token === "string" && typeof record.name === "string"
	);
}

function extractTextValue(value: unknown): string {
	if (typeof value === "string") {
		return value.trim();
	}

	if (typeof value === "number" || typeof value === "boolean") {
		return String(value);
	}

	if (Array.isArray(value)) {
		return value
			.map((item) => extractTextValue(item))
			.filter((item) => item.length > 0)
			.join(" ")
			.trim();
	}

	if (!value || typeof value !== "object") {
		return "";
	}

	if (isAttachmentLike(value)) {
		return "";
	}

	const record = value as Record<string, unknown>;
	const preferredKeys = [
		"text",
		"name",
		"title",
		"value",
		"content",
		"label",
	];

	for (const key of preferredKeys) {
		const text = extractTextValue(record[key]);
		if (text) {
			return text;
		}
	}

	for (const nestedValue of Object.values(record)) {
		const text = extractTextValue(nestedValue);
		if (text) {
			return text;
		}
	}

	return "";
}
