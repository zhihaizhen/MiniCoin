# academy ISR 运行镜像
# 期望构建上下文中存在已组装好的 standalone 运行目录（由 `make package-isr` 产出到 output/standalone）。
# standalone 内部结构（outputFileTracingRoot 指向 monorepo 根）：
#   output/standalone/
#     ├── apps/academy/server.js        # 入口
#     ├── apps/academy/.next/static      # 静态资源（需手工拷入）
#     ├── apps/academy/public            # 公共资源（需手工拷入）
#     └── node_modules                   # 已 tree-shaking 的最小依赖
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# ISR 增量缓存目录（单 pod 本地缓存；多副本一致性见 .kubernetes/README）
RUN mkdir -p /app/apps/academy/.next/cache && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --chown=nextjs:nodejs output/standalone ./

USER nextjs

EXPOSE 3000

CMD ["node", "apps/academy/server.js"]
