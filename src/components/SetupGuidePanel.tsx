import { LL } from "@src/i18n/i18n";
import { Notice } from "obsidian";
import { useState } from "react";

export const FEISHU_OPEN_PLATFORM_URL = "https://open.feishu.cn/";

export const FEISHU_PERMISSION_SCOPES_JSON = `{
  "scopes": {
    "tenant": [
      "base:app:read",
      "base:block:read",
      "base:field:read",
      "base:history:read",
      "base:record:read",
      "base:record:retrieve",
      "base:table:read",
      "bitable:app:readonly",
      "docs:document.media:download",
      "drive:file:download",
      "wiki:wiki:readonly"
    ],
    "user": [
      "base:field:read"
    ]
  }
}`;

export const FEISHU_SETUP_GUIDE_STEPS = [
	{
		textBeforeLink: LL.setupGuide.steps.openBeforeLink(),
		linkLabel: LL.setupGuide.steps.openLinkLabel(),
		linkHref: FEISHU_OPEN_PLATFORM_URL,
		textAfterLink: LL.setupGuide.steps.openAfterLink(),
	},
	{
		text: LL.setupGuide.steps.appNameSuggestion(),
	},
	{
		text: LL.setupGuide.steps.appDescriptionSuggestion(),
	},
	{
		text: LL.setupGuide.steps.importPermissions(),
	},
	{
		text: LL.setupGuide.steps.publishAndCopySecrets(),
	},
] as const;

export function SetupGuidePanel() {
	const [copied, setCopied] = useState(false);

	const copyJson = async () => {
		try {
			await navigator.clipboard.writeText(FEISHU_PERMISSION_SCOPES_JSON);
			setCopied(true);
			new Notice(LL.setupGuide.copySuccess());
			window.setTimeout(() => setCopied(false), 1500);
		} catch {
			new Notice(LL.setupGuide.copyFailed());
		}
	};

	return (
		<section className="cld-setup-guide">
			<h3>{LL.setupGuide.title()}</h3>
			<ol>
				{FEISHU_SETUP_GUIDE_STEPS.map((step, index) => (
					<li key={index}>
						{"text" in step ? (
							step.text
						) : (
							<>
								{step.textBeforeLink}
								<a
									href={step.linkHref}
									target="_blank"
									rel="noreferrer"
								>
									{step.linkLabel}
								</a>
								{step.textAfterLink}
							</>
						)}
					</li>
				))}
			</ol>
			<div className="cld-setup-guide-code">
				<div className="cld-setup-guide-code-header">
					<div className="cld-setup-guide-code-title">
						{LL.setupGuide.permissionJsonTitle()}
					</div>
					<button
						type="button"
						className="cld-setup-guide-copy"
						onClick={copyJson}
					>
						{copied ? LL.common.copied() : LL.common.copyCode()}
					</button>
				</div>
				<pre>
					<code>{FEISHU_PERMISSION_SCOPES_JSON}</code>
				</pre>
			</div>
			<p>{LL.setupGuide.finishHint()}</p>
		</section>
	);
}
