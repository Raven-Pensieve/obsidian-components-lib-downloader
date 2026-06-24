import { OverwriteMode } from "@src/types/types";
import { App, normalizePath, TFile } from "obsidian";

function sanitizeFileName(fileName: string): string {
	return fileName.replace(/[\\/:*?"<>|]/g, "_").trim() || "unnamed";
}

export async function ensureFolderExists(app: App, folderPath: string) {
	const normalized = normalizePath(folderPath);
	if (!normalized || normalized === "/") {
		return;
	}

	const parts = normalized.split("/").filter(Boolean);
	let current = "";
	for (const part of parts) {
		current = current ? `${current}/${part}` : part;
		if (!app.vault.getAbstractFileByPath(current)) {
			await app.vault.createFolder(current);
		}
	}
}

export async function writeBinaryFile(
	app: App,
	folderPath: string,
	fileName: string,
	content: Uint8Array,
	overwriteMode: OverwriteMode,
): Promise<string> {
	await ensureFolderExists(app, folderPath);
	const arrayBuffer = toArrayBuffer(content);

	const safeName = sanitizeFileName(fileName);
	const normalizedFolder = normalizePath(folderPath || "").replace(/\/$/, "");
	const basePath = normalizedFolder
		? `${normalizedFolder}/${safeName}`
		: safeName;
	let targetPath = normalizePath(basePath);
	const existing = app.vault.getAbstractFileByPath(targetPath);

	if (existing instanceof TFile) {
		if (overwriteMode === "skip") {
			return targetPath;
		}
		if (overwriteMode === "rename") {
			targetPath = await createUniquePath(app, targetPath);
		} else {
			await app.vault.modifyBinary(existing, arrayBuffer);
			return targetPath;
		}
	}

	await app.vault.createBinary(targetPath, arrayBuffer);
	return targetPath;
}

export function getExistingBinaryFilePath(
	app: App,
	folderPath: string,
	fileName: string,
): string | null {
	const safeName = sanitizeFileName(fileName);
	const normalizedFolder = normalizePath(folderPath || "").replace(/\/$/, "");
	const basePath = normalizedFolder
		? `${normalizedFolder}/${safeName}`
		: safeName;
	const targetPath = normalizePath(basePath);
	const existing = app.vault.getAbstractFileByPath(targetPath);

	return existing instanceof TFile ? targetPath : null;
}

function toArrayBuffer(content: Uint8Array): ArrayBuffer {
	return content.buffer.slice(
		content.byteOffset,
		content.byteOffset + content.byteLength,
	) as ArrayBuffer;
}

async function createUniquePath(app: App, targetPath: string): Promise<string> {
	const dotIndex = targetPath.lastIndexOf(".");
	const baseName = dotIndex > -1 ? targetPath.slice(0, dotIndex) : targetPath;
	const ext = dotIndex > -1 ? targetPath.slice(dotIndex) : "";

	let index = 1;
	let candidate = targetPath;
	while (app.vault.getAbstractFileByPath(candidate)) {
		candidate = `${baseName}-${index}${ext}`;
		index += 1;
	}

	return candidate;
}
