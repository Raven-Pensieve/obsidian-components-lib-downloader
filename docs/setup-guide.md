1. 打开[飞书开放平台](https://open.feishu.cn/)，登录后创建一个自建应用，获取 `App ID` 和 `App Secret`。
2. 应用名称建议："Components Feishu Downloader"。
3. 应用描述建议："用于在 Obsidian 中下载飞书 Components 库"。
4. 进入应用，点击权限管理，复制下列 json 批量导入
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
5. 发布应用版本，点击凭证与管理信息，复制 `App ID` 和 `App Secret`。