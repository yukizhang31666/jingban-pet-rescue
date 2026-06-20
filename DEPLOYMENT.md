# Vercel 正式上线

## 1. 创建云资源

1. 在 Vercel 创建项目并连接代码仓库。
2. 在 Vercel Marketplace 创建 PostgreSQL 数据库，或使用支持 SSL 的现有 PostgreSQL。
3. 在 Vercel Storage 创建 Blob Store。
4. 准备企业微信收款码图片并上传到可信公网存储。

## 2. 配置环境变量

按 `.env.example` 配置 Production、Preview 和 Development 环境。

首次部署可先把 `API_URL` 设置为 Vercel 生成的项目域名。绑定正式域名后，再改为：

```text
API_URL=https://jingbantech.com
```

修改 `API_URL` 后必须重新部署，因为它同时用于浏览器端 API 来源和分享元数据。

## 3. 首次部署

运行 Vercel 部署。部署完成后访问：

```text
https://你的部署域名/api/health
```

返回 `ok: true`、`database: connected`、`blob: configured` 后，生产持久化已就绪。

## 4. 迁移旧数据

在已配置生产环境变量的终端运行：

```bash
pnpm migrate:production
```

该命令会：

- 迁移用户、Pet ID、寻宠、测试、订单、分享、增长事件和撮合线索。
- 将 `public/uploads` 中的旧图片上传到 Vercel Blob。
- 保留原始 Pet ID 与数据关联。

迁移前备份 `data/jingban.sqlite`。

## 5. 绑定阿里云域名

1. 在 Vercel 项目 Domains 中添加 `jingbantech.com` 和 `www.jingbantech.com`。
2. 回到阿里云域名控制台，按 Vercel Domains 页面实时显示的记录添加 DNS 解析。
3. 等待 Vercel 显示域名验证成功及 HTTPS 证书生效。
4. 把 `API_URL` 改为正式域名并重新部署。

不要手工猜测 A 或 CNAME 记录，以 Vercel 当前项目给出的记录为准。

## 6. 上线验收

- `/api/health` 正常。
- 创建 Pet ID 并成功上传图片。
- 分享解锁后显示 SSR、身价、排名和内容素材。
- 专属邀请链接带来新建档并增加邀请数。
- 三个付费产品可提交人工付款订单。
- `/admin/login` 登录后可确认订单和审核商家。
- 未登录访问后台数据 API 返回 `401`。
- `/services` 只展示状态为“已入驻”的商家。

## 7. 运营安全

- 定期轮换 `ADMIN_PASSWORD` 与 `ADMIN_SESSION_SECRET`。
- 收款二维码更换后只更新环境变量，不修改代码。
- 在 Vercel 中为 Production 和 Preview 使用不同数据库。
- 正式收集用户联系方式前补齐隐私政策、用户协议和数据删除渠道。
