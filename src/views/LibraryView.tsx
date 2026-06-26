import { SetupGuidePanel } from "@src/components/SetupGuidePanel";
import { LL } from "@src/i18n/i18n";
import { getPresetLabel } from "@src/i18n/preset";
import CPlugin from "@src/main";
import { FeishuAttachment, FeishuLibraryCard } from "@src/types/feishu";
import { FEISHU_LIBRARY_PRESETS, FeishuLibraryPreset } from "@src/types/types";
import {
	ChevronLeft,
	ChevronRight,
	Clock3,
	Download,
	ExternalLink,
	FolderOpen,
	FolderSync,
	Grid3X3,
	ImageIcon,
	Library,
	Link2,
	Package,
	PenSquare,
	Shapes,
} from "lucide-react";
import { ItemView, Notice, WorkspaceLeaf } from "obsidian";
import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { createRoot, Root } from "react-dom/client";

export const LIBRARY_VIEW_TYPE = "components-lib-downloader-view";

export class LibraryView extends ItemView {
	plugin: CPlugin;
	activePreset: FeishuLibraryPreset;
	cardsByPreset: Partial<Record<FeishuLibraryPreset, FeishuLibraryCard[]>> =
		{};
	loading = false;
	root?: Root;

	constructor(leaf: WorkspaceLeaf, plugin: CPlugin) {
		super(leaf);
		this.plugin = plugin;
		this.activePreset = plugin.defaultLibraryPreset;
	}

	getViewType() {
		return LIBRARY_VIEW_TYPE;
	}

	getDisplayText() {
		return LL.plugin.viewDisplayText();
	}

	getIcon() {
		return "layout-grid";
	}

	async onOpen() {
		this.contentEl.empty();
		this.contentEl.addClass("cld-library-view-host");
		this.root = createRoot(this.contentEl);
		if (!hasFeishuCredentials(this.plugin)) {
			this.renderReactView();
			return;
		}
		await this.refreshActivePreset();
	}

	async onClose() {
		this.root?.unmount();
	}

	async setActivePreset(preset: FeishuLibraryPreset) {
		this.activePreset = preset;
		if (!hasFeishuCredentials(this.plugin)) {
			this.renderReactView();
			return;
		}
		if (!this.cardsByPreset[preset]) {
			await this.refreshActivePreset();
			return;
		}
		this.renderReactView();
	}

	async refreshActivePreset() {
		if (!hasFeishuCredentials(this.plugin)) {
			this.loading = false;
			this.renderReactView();
			return;
		}

		this.loading = true;
		this.renderReactView();
		try {
			this.cardsByPreset[this.activePreset] =
				await this.plugin.loadLibraryCards(this.activePreset);
		} catch (error) {
			new Notice(
				error instanceof Error
					? error.message
					: LL.common.loadingFailed(),
			);
		} finally {
			this.loading = false;
			this.renderReactView();
		}
	}

	private renderReactView() {
		this.root?.render(
			<LibraryViewApp
				plugin={this.plugin}
				activePreset={this.activePreset}
				cards={this.cardsByPreset[this.activePreset] ?? []}
				loading={this.loading}
				onPresetChange={(preset) => {
					void this.setActivePreset(preset);
				}}
				onRefresh={() => {
					void this.refreshActivePreset();
				}}
				onEditDownloadPath={async (preset) => {
					const updated =
						await this.plugin.promptDownloadPathUpdate(preset);
					if (updated) {
						this.renderReactView();
					}
				}}
				onDownload={(recordId, attachment) => {
					void this.plugin.downloadLibraryAttachment(
						this.activePreset,
						recordId,
						attachment,
					);
				}}
			/>,
		);
	}
}

type LibraryViewAppProps = {
	plugin: CPlugin;
	activePreset: FeishuLibraryPreset;
	cards: FeishuLibraryCard[];
	loading: boolean;
	onPresetChange: (preset: FeishuLibraryPreset) => void;
	onRefresh: () => void;
	onEditDownloadPath: (preset: FeishuLibraryPreset) => Promise<void>;
	onDownload: (recordId: string, attachment: FeishuAttachment) => void;
};

type CardSortMode = "updated-desc" | "updated-asc" | "title-asc" | "title-desc";

function LibraryViewApp(props: LibraryViewAppProps) {
	const presetInfo = FEISHU_LIBRARY_PRESETS[props.activePreset];
	const presetLabel = getPresetLabel(props.activePreset);
	const hasCredentials = hasFeishuCredentials(props.plugin);
	const [sortMode, setSortMode] = useState<CardSortMode>("updated-desc");
	const [lightbox, setLightbox] = useState<{
		images: string[];
		index: number;
		title: string;
	} | null>(null);
	const gridRef = useRef<HTMLElement | null>(null);
	const [columnCount, setColumnCount] = useState(1);
	const downloadPath = props.plugin.getDownloadPathDisplay(
		props.activePreset,
	);
	const sortedCards = sortCards(props.cards, sortMode);
	const sortedCardColumns = useMemo(
		() => buildMasonryColumns(sortedCards, columnCount),
		[sortedCards, columnCount],
	);

	useEffect(() => {
		const element = gridRef.current;
		if (!element) {
			return;
		}

		const updateColumns = () => {
			const nextCount = getMasonryColumnCount(element.clientWidth);
			setColumnCount((current) =>
				current === nextCount ? current : nextCount,
			);
		};

		updateColumns();

		const observer = new ResizeObserver(() => {
			updateColumns();
		});
		observer.observe(element);

		return () => {
			observer.disconnect();
		};
	}, []);

	return (
		<div className="cld-library-view">
			<section className="cld-hero-card">
				<div className="cld-hero-copy">
					<div className="cld-eyebrow">
						<Library size={36} />
						<span>{presetLabel}</span>
					</div>
				</div>
				<div className="cld-hero-meta">
					<div className="cld-hero-meta-pills">
						<div className="cld-meta-pill">
							<Grid3X3 size={14} />
							<span>
								{LL.view.fileCount({
									count: props.cards.length,
								})}
							</span>
						</div>
						<div className="cld-meta-pill">
							<Link2 size={14} />
							<span>{presetLabel}</span>
						</div>
						{presetInfo.contributeUrl ? (
							<a
								className="cld-meta-pill cld-meta-pill-link"
								href={presetInfo.contributeUrl}
								target="_blank"
								rel="noreferrer"
								title={LL.view.hero.contribute()}
							>
								<PenSquare size={14} />
								<span>{LL.view.hero.contribute()}</span>
							</a>
						) : null}
					</div>
					<div className="cld-hero-link-row">
						<div className="cld-hero-link-box">
							<code>{presetInfo.wikiUrl}</code>
						</div>
						<a
							className="cld-hero-link-button"
							href={presetInfo.wikiUrl}
							target="_blank"
							rel="noreferrer"
							title={LL.view.hero.openWikiLink()}
						>
							<ExternalLink size={14} />
						</a>
					</div>
				</div>
			</section>

			<section className="cld-hero-actions">
				<div className="cld-tabbar">
					{(
						Object.entries(FEISHU_LIBRARY_PRESETS) as Array<
							[
								FeishuLibraryPreset,
								(typeof FEISHU_LIBRARY_PRESETS)[FeishuLibraryPreset],
							]
						>
					).map(([presetKey, preset]) => (
						<button
							key={presetKey}
							type="button"
							className={
								presetKey === props.activePreset
									? "cld-tab is-active"
									: "cld-tab"
							}
							onClick={() => props.onPresetChange(presetKey)}
						>
							<PresetIcon preset={presetKey} />
							<span>{getPresetLabel(presetKey)}</span>
						</button>
					))}
				</div>

				<div className="cld-toolbar">
					<button
						type="button"
						className="cld-toolbar-button"
						onClick={props.onRefresh}
					>
						<FolderSync size={16} />
						<span>{LL.view.actions.refreshCurrentLibrary()}</span>
					</button>
					<button
						type="button"
						className="cld-toolbar-button cld-toolbar-path"
						onClick={() => {
							void props.onEditDownloadPath(props.activePreset);
						}}
						title={downloadPath}
					>
						<FolderOpen size={14} />
						<span className="cld-toolbar-path-label">
							{downloadPath}
						</span>
					</button>
					<label className="cld-sort-control">
						<select
							value={sortMode}
							onChange={(event) =>
								setSortMode(event.target.value as CardSortMode)
							}
						>
							<option value="updated-desc">
								{LL.view.sort.recentlyUpdated()}
							</option>
							<option value="updated-asc">
								{LL.view.sort.earliestUpdated()}
							</option>
							<option value="title-asc">
								{LL.view.sort.titleAsc()}
							</option>
							<option value="title-desc">
								{LL.view.sort.titleDesc()}
							</option>
						</select>
					</label>
				</div>
			</section>

			{!hasCredentials ? (
				<SetupGuidePanel />
			) : props.loading ? (
				<section
					ref={gridRef}
					className="cld-library-grid"
					style={
						{
							"--cld-columns": String(columnCount),
						} as CSSProperties
					}
				>
					{buildMasonryColumns(
						Array.from({ length: 8 }),
						columnCount,
					).map((column, columnIndex) => (
						<div key={columnIndex} className="cld-library-column">
							{column.map((item, itemIndex) => (
								<div
									key={`${columnIndex}-${itemIndex}-${String(item)}`}
									className="cld-library-card is-skeleton"
								>
									<div className="cld-card-cover" />
									<div className="cld-card-body">
										<div className="cld-skeleton-line is-wide" />
										<div className="cld-skeleton-line" />
										<div className="cld-skeleton-line is-short" />
									</div>
								</div>
							))}
						</div>
					))}
				</section>
			) : props.cards.length === 0 ? (
				<section className="cld-empty-state">
					<Package size={32} />
					<h3>{LL.view.emptyState.title()}</h3>
					<p>{LL.view.emptyState.description()}</p>
				</section>
			) : (
				<section
					ref={gridRef}
					className="cld-library-grid"
					style={
						{
							"--cld-columns": String(columnCount),
						} as CSSProperties
					}
				>
					{sortedCardColumns.map((column, columnIndex) => (
						<div key={columnIndex} className="cld-library-column">
							{column.map((card) => (
								<LibraryCard
									key={card.recordId}
									preset={props.activePreset}
									plugin={props.plugin}
									card={card}
									onPreview={(images, index, title) =>
										setLightbox({ images, index, title })
									}
									onDownload={props.onDownload}
								/>
							))}
						</div>
					))}
				</section>
			)}

			{lightbox ? (
				<div
					className="cld-lightbox"
					onClick={() => setLightbox(null)}
					role="button"
					tabIndex={0}
					onKeyDown={(event) => {
						if (
							event.key === "Escape" ||
							event.key === "Enter" ||
							event.key === " "
						) {
							setLightbox(null);
						}

						if (event.key === "ArrowLeft") {
							setLightbox((current) =>
								current
									? {
											...current,
											index: getLoopedIndex(
												current.index - 1,
												current.images.length,
											),
										}
									: null,
							);
						}

						if (event.key === "ArrowRight") {
							setLightbox((current) =>
								current
									? {
											...current,
											index: getLoopedIndex(
												current.index + 1,
												current.images.length,
											),
										}
									: null,
							);
						}
					}}
				>
					<div
						className="cld-lightbox-dialog"
						onClick={(event) => event.stopPropagation()}
					>
						{lightbox.images.length > 1 ? (
							<>
								<button
									type="button"
									className="cld-lightbox-nav is-left"
									onClick={() =>
										setLightbox((current) =>
											current
												? {
														...current,
														index: getLoopedIndex(
															current.index - 1,
															current.images
																.length,
														),
													}
												: null,
										)
									}
								>
									<ChevronLeft size={20} />
								</button>
								<button
									type="button"
									className="cld-lightbox-nav is-right"
									onClick={() =>
										setLightbox((current) =>
											current
												? {
														...current,
														index: getLoopedIndex(
															current.index + 1,
															current.images
																.length,
														),
													}
												: null,
										)
									}
								>
									<ChevronRight size={20} />
								</button>
							</>
						) : null}
						<img
							className="cld-lightbox-image"
							src={lightbox.images[lightbox.index]}
							alt={lightbox.title}
						/>
						<div className="cld-lightbox-title">
							{lightbox.title}
							{lightbox.images.length > 1
								? ` · ${lightbox.index + 1}/${lightbox.images.length}`
								: ""}
						</div>
					</div>
				</div>
			) : null}
		</div>
	);
}

function LibraryCard(props: {
	preset: FeishuLibraryPreset;
	plugin: CPlugin;
	card: FeishuLibraryCard;
	onPreview: (images: string[], startIndex: number, title: string) => void;
	onDownload: (recordId: string, attachment: FeishuAttachment) => void;
}) {
	const authors = useMemo(() => getAuthorNames(props.card), [props.card]);
	const previewAttachments = useMemo(
		() => getPreviewAttachments(props.card),
		[props.card],
	);
	const previewAttachment = previewAttachments[0];
	const visibleFields = getVisibleFields(props.card, props.preset);
	const downloadableGroups = props.card.attachmentGroups.filter(
		(group) => !isPreviewGroup(group),
	);
	const [previewIndex, setPreviewIndex] = useState(0);
	const [previewUrls, setPreviewUrls] = useState<string[]>([]);

	useEffect(() => {
		let disposed = false;
		if (previewAttachments.length === 0) {
			setPreviewUrls((current) => (current.length === 0 ? current : []));
			return;
		}

		void Promise.all(
			previewAttachments.map((attachment) =>
				props.plugin.getAttachmentPreviewUrl(props.preset, attachment),
			),
		).then((urls) => {
			if (!disposed) {
				const nextUrls = urls.filter((url): url is string =>
					Boolean(url),
				);
				setPreviewUrls((current) =>
					areStringArraysEqual(current, nextUrls)
						? current
						: nextUrls,
				);
			}
		});

		return () => {
			disposed = true;
		};
	}, [previewAttachments, props.plugin, props.preset]);

	useEffect(() => {
		setPreviewIndex(0);
	}, [props.card.recordId]);

	useEffect(() => {
		if (previewUrls.length === 0) {
			setPreviewIndex(0);
			return;
		}

		setPreviewIndex((current) =>
			getLoopedIndex(current, previewUrls.length),
		);
	}, [previewUrls]);

	const activePreviewUrl = previewUrls[previewIndex] ?? null;

	return (
		<article className="cld-library-card">
			<div className="cld-card-cover">
				{activePreviewUrl ? (
					<button
						type="button"
						className="cld-card-cover-button"
						onClick={() =>
							props.onPreview(
								previewUrls,
								previewIndex,
								props.card.title,
							)
						}
					>
						<img
							className="cld-card-cover-image"
							src={activePreviewUrl}
							alt={props.card.title}
							loading="lazy"
						/>
					</button>
				) : previewAttachment ? (
					<div className="cld-card-cover-fallback">
						<ImageIcon size={20} />
						<span>{previewAttachment.name}</span>
					</div>
				) : (
					<div className="cld-card-cover-fallback">
						<Shapes size={20} />
						<span>{props.card.title}</span>
					</div>
				)}
				{previewUrls.length > 1 ? (
					<>
						<button
							type="button"
							className="cld-card-cover-nav is-left"
							onClick={(event) => {
								event.stopPropagation();
								setPreviewIndex((current) =>
									getLoopedIndex(
										current - 1,
										previewUrls.length,
									),
								);
							}}
						>
							<ChevronLeft size={18} />
						</button>
						<button
							type="button"
							className="cld-card-cover-nav is-right"
							onClick={(event) => {
								event.stopPropagation();
								setPreviewIndex((current) =>
									getLoopedIndex(
										current + 1,
										previewUrls.length,
									),
								);
							}}
						>
							<ChevronRight size={18} />
						</button>
						<div className="cld-card-cover-pagination">
							{previewIndex + 1}/{previewUrls.length}
						</div>
					</>
				) : null}
			</div>
			<div className="cld-card-body">
				<header className="cld-card-header">
					<h3>{props.card.title}</h3>
					{authors.length > 0 ? (
						<div className="cld-card-authors">
							{authors.map((author) => (
								<span
									key={author}
									className="cld-card-author-tag"
								>
									{author}
								</span>
							))}
						</div>
					) : null}
					{renderUpdatedAt(props.card)}
				</header>

				<div className="cld-card-fields">
					{visibleFields.map((field) => (
						<div key={field.key} className="cld-card-field">
							<span className="cld-card-field-key">
								{field.key}
							</span>
							<span className="cld-card-field-value">
								{formatFieldValue(field.key, field.value)}
							</span>
						</div>
					))}
				</div>

				<div className="cld-card-attachments">
					{downloadableGroups.map((group) => (
						<section
							key={group.fieldName}
							className="cld-attachment-group"
						>
							<div className="cld-attachment-group-title">
								<span>{group.fieldName}</span>
								<em>
									{LL.view.attachmentCount({
										count: group.attachments.length,
									})}
								</em>
							</div>
							{group.attachments.map((attachment) => (
								<div
									key={attachment.file_token}
									className="cld-attachment-row"
								>
									<div className="cld-attachment-info">
										<strong>{attachment.name}</strong>
										<span>
											{formatFileSize(attachment.size)}
										</span>
									</div>
									<button
										type="button"
										className="cld-download-button"
										onClick={() =>
											props.onDownload(
												props.card.recordId,
												attachment,
											)
										}
									>
										<Download size={14} />
										<span>{LL.common.download()}</span>
									</button>
								</div>
							))}
						</section>
					))}
				</div>
			</div>
		</article>
	);
}

function getPreviewAttachments(card: FeishuLibraryCard) {
	const previewGroup = card.attachmentGroups.find(isPreviewGroup);
	if (previewGroup?.attachments.length) {
		return previewGroup.attachments.filter(isImageAttachment);
	}

	const imageAttachments = card.attachmentGroups.flatMap((group) =>
		group.attachments.filter(isImageAttachment),
	);
	if (imageAttachments.length > 0) {
		return imageAttachments;
	}

	return card.attachmentGroups[0]?.attachments[0]
		? [card.attachmentGroups[0].attachments[0]]
		: [];
}

function getLoopedIndex(index: number, total: number) {
	if (total <= 0) {
		return 0;
	}

	return ((index % total) + total) % total;
}

function areStringArraysEqual(left: string[], right: string[]) {
	if (left.length !== right.length) {
		return false;
	}

	return left.every((value, index) => value === right[index]);
}

function getVisibleFields(
	card: FeishuLibraryCard,
	preset: FeishuLibraryPreset,
) {
	const configuredKeys = FEISHU_LIBRARY_PRESETS[preset].visibleFieldKeys;
	const configuredFields = configuredKeys
		.map((key) =>
			card.textFields.find(
				(field) =>
					normalizeFieldKey(field.key) === normalizeFieldKey(key),
			),
		)
		.filter((field): field is FeishuLibraryCard["textFields"][number] =>
			Boolean(field),
		);

	return configuredFields;
}

function getAuthorNames(card: FeishuLibraryCard) {
	const authorField = card.textFields.find((field) =>
		isAuthorFieldKey(field.key),
	);
	if (!authorField) {
		return [];
	}

	return authorField.value
		.split(/[、,，;/；|\s]+/)
		.map((name) => name.trim())
		.filter(Boolean);
}

function isAuthorFieldKey(value: string) {
	return /(作者|author)/i.test(value);
}

function normalizeFieldKey(value: string) {
	return value.trim().toLowerCase();
}

function renderUpdatedAt(card: FeishuLibraryCard) {
	const updatedField = getPreferredDateField(card);
	if (!updatedField) {
		return null;
	}

	const timestamp = parseDateValue(updatedField.value);
	if (timestamp === null) {
		return null;
	}

	return (
		<div className="cld-card-updated-at">
			<Clock3 size={14} />
			<span>{formatDateTime(timestamp)}</span>
		</div>
	);
}

function getMasonryColumnCount(width: number) {
	if (width >= 1200) {
		return 4;
	}
	if (width >= 900) {
		return 3;
	}
	if (width >= 560) {
		return 2;
	}
	return 1;
}

function buildMasonryColumns<T>(items: T[], columnCount: number) {
	const safeCount = Math.max(1, columnCount);
	const columns = Array.from({ length: safeCount }, () => [] as T[]);

	items.forEach((item, index) => {
		columns[index % safeCount].push(item);
	});

	return columns;
}

function sortCards(cards: FeishuLibraryCard[], sortMode: CardSortMode) {
	return [...cards].sort((left, right) => {
		if (sortMode === "title-asc") {
			return left.title.localeCompare(right.title);
		}

		if (sortMode === "title-desc") {
			return right.title.localeCompare(left.title);
		}

		const leftTime = getCardSortTime(left);
		const rightTime = getCardSortTime(right);
		const delta = leftTime - rightTime;
		return sortMode === "updated-asc" ? delta : -delta;
	});
}

function getCardSortTime(card: FeishuLibraryCard) {
	const field = getPreferredDateField(card);
	const parsed = field ? parseDateValue(field.value) : null;
	return parsed ?? Number.MIN_SAFE_INTEGER;
}

function getPreferredDateField(card: FeishuLibraryCard) {
	return (
		card.textFields.find((field) =>
			/(更新时间|更新日期|更新时间戳|更新|日期|时间|created|updated|modified|date|time)/i.test(
				field.key,
			),
		) ??
		card.textFields.find((field) => parseDateValue(field.value) !== null)
	);
}

function formatFieldValue(fieldKey: string, value: string) {
	if (
		/(更新时间|更新日期|更新时间戳|更新|日期|时间|created|updated|modified|date|time)/i.test(
			fieldKey,
		)
	) {
		const parsed = parseDateValue(value);
		if (parsed !== null) {
			return formatDateTime(parsed);
		}
	}

	return value;
}

function parseDateValue(value: string) {
	const normalized = value.trim();
	if (!normalized) {
		return null;
	}

	if (/^\d{10,13}$/.test(normalized)) {
		const numeric = Number(normalized);
		if (!Number.isFinite(numeric)) {
			return null;
		}

		return normalized.length === 10 ? numeric * 1000 : numeric;
	}

	const parsed = Date.parse(normalized.replace(/\(GMT[^)]*\)/i, ""));
	return Number.isNaN(parsed) ? null : parsed;
}

function formatDateTime(timestamp: number) {
	return new Intl.DateTimeFormat(undefined, {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	}).format(new Date(timestamp));
}

function isPreviewGroup(group: FeishuLibraryCard["attachmentGroups"][number]) {
	return /图片展示|图片|image/i.test(group.fieldName);
}

function isImageAttachment(attachment: FeishuAttachment) {
	return attachment.type?.startsWith("image/") ?? false;
}

function PresetIcon(props: { preset: FeishuLibraryPreset }) {
	switch (props.preset) {
		case "componentsOfficial":
		case "components":
			return <Package size={16} />;
		case "forms":
			return <Shapes size={16} />;
		case "xdbjs":
		default:
			return <Grid3X3 size={16} />;
	}
}

function formatFileSize(size?: number) {
	if (!size || size <= 0) {
		return LL.common.unknownSize();
	}
	if (size < 1024) {
		return `${size} B`;
	}
	if (size < 1024 * 1024) {
		return `${(size / 1024).toFixed(1)} KB`;
	}
	return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function hasFeishuCredentials(plugin: CPlugin) {
	return Boolean(
		plugin.settings.feishu.appId.trim() &&
		plugin.settings.feishu.appSecret.trim(),
	);
}
