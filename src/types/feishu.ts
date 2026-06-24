import { FeishuLibraryPreset } from "./types";

export interface FeishuRuntimeToken {
	token: string;
	expiresAt: number;
}

export interface FeishuTenantTokenResponse {
	code: number;
	msg: string;
	expire: number;
	tenant_access_token: string;
}

export interface FeishuNodeResponse {
	code: number;
	msg: string;
	data: {
		node: {
			obj_type: string;
			obj_token: string;
		};
	};
}

export interface FeishuAttachment {
	file_token: string;
	name: string;
	type?: string;
	size?: number;
	url?: string;
	tmp_url?: string;
}

export interface FeishuRecord {
	record_id: string;
	fields: Record<string, unknown>;
}

export interface FeishuBitableSearchResponse {
	code: number;
	msg: string;
	data: {
		has_more: boolean;
		page_token: string;
		total: number;
		items: FeishuRecord[];
	};
}

export interface FeishuResolvedTarget {
	nodeToken: string;
	appToken: string;
	tableId: string;
	viewId: string;
}

export interface FeishuAttachmentGroup {
	fieldName: string;
	attachments: FeishuAttachment[];
}

export interface FeishuLibraryCard {
	libraryPreset: FeishuLibraryPreset;
	recordId: string;
	title: string;
	description: string;
	textFields: Array<{ key: string; value: string }>;
	attachmentGroups: FeishuAttachmentGroup[];
}
