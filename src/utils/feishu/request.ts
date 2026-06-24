import { requestUrl } from "obsidian";

export async function requestJson<T>(options: {
	url: string;
	method?: string;
	headers?: Record<string, string>;
	body?: string;
}): Promise<{ status: number; data: T }> {
	console.debug("[components-lib-downloader] Feishu request", {
		url: options.url,
		method: options.method ?? "GET",
	});

	const response = await requestUrl({
		url: options.url,
		method: options.method,
		headers: options.headers,
		body: options.body,
		contentType: options.headers?.["Content-Type"],
		throw: false,
	});

	console.debug("[components-lib-downloader] Feishu response", {
		url: options.url,
		status: response.status,
	});

	return {
		status: response.status,
		data: response.json as T,
	};
}

export async function requestBinary(options: {
	url: string;
	method?: string;
	headers?: Record<string, string>;
}): Promise<{ status: number; buffer: Uint8Array }> {
	console.debug("[components-lib-downloader] Feishu binary request", {
		url: options.url,
		method: options.method ?? "GET",
	});

	const response = await requestUrl({
		url: options.url,
		method: options.method,
		headers: options.headers,
		throw: false,
	});

	console.debug("[components-lib-downloader] Feishu binary response", {
		url: options.url,
		status: response.status,
	});

	return {
		status: response.status,
		buffer: new Uint8Array(response.arrayBuffer),
	};
}
