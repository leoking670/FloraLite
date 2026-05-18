# FloraLite

简体中文 | [English](README.en.md)

FloraLite 是一个部署在 Cloudflare Workers 上的私有植物识别网页和 API。后端调用百度植物识别 API，适合个人私用场景。

## 本地开发

```bash
npm install
cp .dev.vars.example .dev.vars
npm run dev
```

本地网页路径使用 `.dev.vars` 中的 `WEB_PATH_SECRET`。

## Cloudflare 配置

创建用于缓存百度 `access_token` 的 KV namespace。Cloudflare 控制台里的资源名建议使用 `floralite-baidu-token`，Worker binding 名保持为 `BAIDU_TOKEN_KV`。

```bash
npx wrangler kv namespace create BAIDU_TOKEN_KV
npx wrangler kv namespace create BAIDU_TOKEN_KV --preview
```

将命令返回的 namespace ID 填入 `wrangler.toml`。

设置生产环境 secrets：

```bash
npx wrangler secret put BAIDU_API_KEY
npx wrangler secret put BAIDU_SECRET_KEY
npx wrangler secret put API_AUTH_KEY
npx wrangler secret put WEB_PATH_SECRET
```

部署：

```bash
npm run deploy
```

## API

`POST /api/identify` 默认返回百度官方风格响应。

```bash
curl -X POST "https://your-worker.example/api/identify" \
  -H "Authorization: Bearer <API_AUTH_KEY>" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "image=<base64>"
```

`shortcut` 格式返回前三个植物名称和适合直接展示的置信度：

```bash
curl -X POST "https://your-worker.example/api/identify?format=shortcut" \
  -H "Authorization: Bearer <API_AUTH_KEY>" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "image=<base64>"
```

私有网页地址：

```text
https://your-worker.example/<WEB_PATH_SECRET>
```

## AI 辅助生成声明

本项目的部分代码、文档和测试由 AI 编程助手辅助生成，并由项目维护者审阅、修改和验证。项目维护者对最终提交内容负责。

## 许可证

本项目采用 GNU General Public License v3.0 许可证。详见 [LICENSE](LICENSE)。
