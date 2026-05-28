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

`wrangler.toml` 里只保留 KV binding 名 `FLORALITE_BAIDU_TOKEN_KV`。通过 Cloudflare 的自动 provisioning，部署时会自动创建并绑定所需的 KV namespace，所以不需要把 production / preview namespace ID 写进仓库。

如果你已经有现成的 KV namespace，也可以在 `wrangler.toml` 里手动补上 `id`；但对这个项目来说，默认自动创建更干净，也更适合 GitHub 一键部署。

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
