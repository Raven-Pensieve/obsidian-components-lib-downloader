import { LL } from "@src/i18n/i18n";
import { FeishuAttachment } from "@src/types/feishu";
import { FeishuApiError } from "./auth";
import { requestBinary } from "./request";

export async function downloadAttachment(
	tenantAccessToken: string,
	attachment: FeishuAttachment,
): Promise<Uint8Array> {
	const downloadUrl = attachment.url || attachment.tmp_url;
	if (!downloadUrl) {
		throw new FeishuApiError(
			LL.feishu.errors.missingAttachmentUrl({
				name: attachment.name || attachment.file_token,
			}),
		);
	}

	const { status, buffer } = await requestBinary({
		url: downloadUrl,
		method: "GET",
		headers: {
			Authorization: `Bearer ${tenantAccessToken}`,
		},
	});

	if (status < 200 || status >= 300) {
		throw new FeishuApiError(
			LL.feishu.errors.failedDownloadAttachment({ status }),
			status,
		);
	}

	console.info("[components-lib-downloader] Downloaded Feishu attachment", {
		fileToken: attachment.file_token,
		fileName: attachment.name,
		bytes: buffer.byteLength,
	});
	return buffer;
}
