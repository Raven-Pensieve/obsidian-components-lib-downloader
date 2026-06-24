English | [中文](README.ZH.md)

# Components Library Downloader

An Obsidian plugin for downloading file assets from Feishu wiki bitable libraries into configured folders inside the current vault.

![GitHub Socialify](https://socialify.git.ci/Raven-Pensieve/obsidian-components-lib-downloader/image?description=1&font=Rokkitt&forks=1&issues=1&language=1&name=1&owner=1&pattern=Floating+Cogs&pulls=1&stargazers=1&theme=Auto)

## Features

- Built-in presets for three Feishu libraries: `components`, `xdbjs`, and `forms`
- Uses Obsidian native `requestUrl` to access Feishu APIs without a custom server
- Dedicated library view with tabs for all three libraries
- Card-based grid UI for file metadata, cover previews, and attachments
- Image preview, carousel, and lightbox support
- Download progress feedback
- Duplicate-file handling with skip, rename, or overwrite choices
- Separate download paths for each library
- Special `.js` routing for the `forms` library
- External plugin settings sync support for:
	- `components.folder`
	- `components.scriptFolder`
	- `form-flow.formFolder`
	- `form-flow.scriptFolder`
- Built-in Chinese and English i18n

## How it works

The plugin uses your Feishu Open Platform app credentials to fetch a `tenant_access_token`, resolves the built-in wiki links to bitable targets, reads records from the linked tables, and downloads attachment files into your Obsidian vault.

Credentials are stored locally in Obsidian plugin settings and are not kept in source code.

## Installation

### Manual installation

1. Download the build artifacts: `main.js`, `manifest.json`, and `styles.css`
2. Create `.obsidian/plugins/components-lib-downloader/` inside your vault
3. Copy the files into that folder
4. Restart Obsidian, or refresh community plugins in settings
5. Enable `Components Library Downloader`

### BRAT installation

1. Install [BRAT](https://github.com/TfTHacker/obsidian42-brat)
2. Click `Add Beta plugin` in BRAT settings
3. Enter this repository URL
4. Install and enable the plugin

## Feishu setup

Before first use, create a custom app in Feishu Open Platform and fill in `App ID` and `App Secret` in the plugin settings.

### Required scopes

```json
{
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
}
```

### Setup steps

1. Open [Feishu Open Platform](https://open.feishu.cn/)
2. Create a custom app
3. Import the JSON above in `Permission Management`
4. Publish an app version
5. Copy `App ID` and `App Secret` from `Credentials & Basic Info`
6. Return to Obsidian and fill them in

## Usage

### 1. Open the library view

Available entry points:

- Command palette:
	- `Feishu: Open library view`
	- `Feishu: Test connection`
	- `Feishu: Refresh default library`
- Ribbon icon

### 2. Browse libraries

Inside the view, you can:

- Switch between `components`, `xdbjs`, and `forms`
- Open the linked Feishu wiki page
- Refresh the current library
- Edit the current library download path
- Sort by updated time or title

### 3. Download attachments

Use the download button on any attachment row.

The download flow includes:

- target path check
- duplicate file detection
- Feishu access token fetch
- attachment download
- vault write

For the `forms` library:

- regular form files go to `feishu.downloadPaths.forms`
- `.js` files go to `feishu.downloadPaths.formScripts`

## Settings

The settings UI includes two tabs:

- `General`
- `Setup Guide`

### Main settings

- `App ID`
- `App Secret`
- `xdbjs` download path
- `components` download path
- `forms` cform download path
- `forms` JS download path

### External plugin path sync

The sync button beside each path can copy values from other installed and enabled plugins:

- `components` library ← `components.folder`
- `xdbjs` library ← `components.scriptFolder`
- `forms` cform ← `form-flow.formFolder`
- `forms` JS ← `form-flow.scriptFolder`

## Development

### Requirements

- Node.js `>= 20`
- pnpm

### Install dependencies

```bash
pnpm install
```

### Common commands

```bash
pnpm dev
pnpm build
pnpm lint
pnpm test
pnpm i18n:typesafe
pnpm i18n:sync
```

## Tech stack

- TypeScript
- Obsidian Plugin API
- React 18
- Lucide React
- Jest
- typesafe-i18n

## Compatibility

- Minimum Obsidian version: `1.11.0`
- Desktop only: `isDesktopOnly = true`

## License

This project is released under the [MIT](LICENSE) license.

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=Raven-Pensieve/obsidian-components-lib-downloader&type=Timeline)](https://www.star-history.com/#Raven-Pensieve/obsidian-components-lib-downloader&Timeline)
