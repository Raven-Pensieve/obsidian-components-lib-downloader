export function guessMimeType(fileName: string) {
	const lower = fileName.toLowerCase();
	if (lower.endsWith(".png")) return "image/png";
	if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
	if (lower.endsWith(".webp")) return "image/webp";
	if (lower.endsWith(".gif")) return "image/gif";
	if (lower.endsWith(".svg")) return "image/svg+xml";
	return "application/octet-stream";
}
