# 鲸伴科技 · 宠物 AI 数字身份平台

面向正式运营的移动端宠物身份、内容裂变、人工收款与本地服务撮合系统。

## 核心闭环

`Pet ID 建档 → AI 身份 → 分享解锁 → 邀请建档 → 人工付费 → 服务撮合 → 增长漏斗`

所有关键行为统一绑定 `pet_id`：

- `pet_created`
- `pet_viewed`
- `share_clicked`
- `share_success`
- `invite_joined`
- `pay_clicked`
- `pay_success`

## 生产架构

- Next.js 16 App Router
- PostgreSQL（通过 `DATABASE_URL`）
- Vercel Blob（宠物照片与寻宠照片）
- Vercel 部署与自定义域名
- HttpOnly 签名 Cookie 管理员会话

运行时代码不写本地数据库或本地上传目录。

## 环境变量

复制 `.env.example` 中的字段到 Vercel Project Settings，或本地复制为 `.env.local`。真实密钥只应配置在 Vercel Environment Variables 或本地 `.env.local`，不要写入仓库。

Vercel 生产环境至少需要配置：

- `API_URL`
- `DATABASE_URL`
- `BLOB_READ_WRITE_TOKEN`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`

| 变量 | 用途 | 是否必填 | 是否可以公开到前端 |
| --- | --- | --- | --- |
| `API_URL` | 站点来源，用于分享链接、来源校验和派生前端 API 地址，例如 `https://jingbantech.com` | 是 | 可以，属于公开站点 URL |
| `DATABASE_URL` | 托管 PostgreSQL 连接串 | 是 | 否 |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob 读写令牌，用于上传宠物和寻宠照片 | 是 | 否 |
| `WECHAT_PAYMENT_QR_URL` | 微信收款码图片公网地址 | 否，未配置时显示占位付款提示 | 可以，图片 URL 会用于前端展示 |
| `ADMIN_PASSWORD` | 后台管理员登录密码 | 是 | 否 |
| `ADMIN_SESSION_SECRET` | 后台 HttpOnly session 签名密钥，至少 32 位随机字符串 | 是 | 否 |
| `LOST_CLUE_WEBHOOK_URL` | 可选线索转发 Webhook；未配置时只进入后台线索队列 | 否 | 否 |
| `NEXT_PUBLIC_API_URL` | 前端 API base URL，由 `next.config.ts` 从 `API_URL` 派生 | 否，一般不用手动填写 | 是 |
| `NEXT_PUBLIC_WECHAT_PAYMENT_QR_URL` | 前端付款二维码 URL，由 `next.config.ts` 从 `WECHAT_PAYMENT_QR_URL` 派生 | 否，一般不用手动填写 | 是 |
| `NODE_ENV` | 运行环境标识，由 Next.js / Node / Vercel 自动提供 | 否，不需要手动配置 | 不作为业务密钥 |

## 命令

```bash
pnpm install
pnpm lint
pnpm build
pnpm dev
```

旧 MVP 数据迁移到生产数据库：

```bash
pnpm migrate:production
```

迁移前应先部署一次并确认 `/api/health` 返回数据库已连接；脚本会同步 SQLite 表数据，并把本地上传图片迁移到 Vercel Blob。

## 主要入口

- `/pet-id/new`：创建 Pet ID
- `/pet/[id]`：分享解锁与增长身份页
- `/lost/new`：生成寻宠传播包
- `/quiz`：宇宙身份测试
- `/services`：已审核本地服务商
- `/merchant/apply`：商家入驻
- `/admin-login`：生产后台公开登录入口
- `/api/health`：部署健康检查

上线步骤见 [DEPLOYMENT.md](./DEPLOYMENT.md)。
