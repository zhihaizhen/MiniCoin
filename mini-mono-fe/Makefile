export PATH := $(shell pwd)/node_modules/.bin:$(PATH)

.PHONY: init lint lang build package build-isr package-isr

#
initSub:
	git submodule update --init --recursive

init:
	# When making init for the first time, sudo make init is required
	# corepack enable
	pnpm install

lint:init
	nx run $(APP):lint

lang:init
	nx run lang:sync

# make analyze app=demo
analyze:init
	node script/genBuildRelease.js -p ${app} -e test
	ANALYZE=true nx run ${app}:build:production  


# make dev app=demo p=test-better-dex-1 
dev:init
	node script/genBuildRelease.js -p ${app} -e test   
	nx run ${app}:serve  --pipeline-env ${p}

# make build APP=bot ENV=test
build:lang
	echo APP:$(APP) ENV:$(ENV) SYNC_APP_LANG:$(SYNC_APP_LANG) SYNC_GMP_LIB_LANG:$(SYNC_GMP_LIB_LANG)
	@if [ $(SYNC_APP_LANG) = 1 ]; then nx run lang:sync-app-asset --app=$(APP) --folder="src/assets" ; fi; \

	@if [ $(SYNC_GMP_LIB_LANG) = 1 ]; then nx run lang:sync-app-asset --app="gmp-lib" --folder="src/assets"; fi;\
	# delete the original cache
	rm -rf dist/$(ENV)/apps/$(APP)
	# Generate release information for sentry to locate error codes on the line
	node script/genBuildRelease.js -p $(APP) -e $(ENV)
	# build
	nx run $(APP):build:$(ENV) --pipeline-env ${PIPELINE_ENV}
	# Upload the source map to the sentry server, and then delete all local traces
	# node script/uploadSourceMap.js -p $(APP) -e $(ENV)
	# The original cexport command
	node script/export.js -p $(APP) -e $(ENV)
	ls -ltr dist/$(ENV)/apps/$(APP)/exported

# make package APP=voucher-management ENV=test
package:build
	mkdir -p output/config
	cp -r ./dist/$(ENV)/apps/$(APP)/exported output/html
	cp -r ./apps/$(APP)/.kubernetes/server.conf output/config/
	cp -r ./config/nginx-base.conf output/config/


# 发布代码到效能，不支持testnet、mainnet，如果需要配置其他环境，请查看.cli-config.js
# 更具体的一些使用方式和一些疑难问题参考下面的链接 https://c1ey4wdv9g.larksuite.com/wiki/wikusygeMhT4HDTN5wsQp1aF8Vb
publish:
	gtd --version
	gtd publish

#  发布上一次的选择
publishLast:
	gtd publish -l

# 查看最近一次效能发布的情况
query:
	gtd query


# 通过交互式命令，对proto生成相应的api，默认集成了几个proto仓库
api:initSub
	node script/makeapi.js

# 选择上一次的生成的api
apiLast:
	gtd api -l


# ===================== ISR 专用构建/打包（academy 等 Node server 形态） =====================
# 与普通 build/package 的区别：不执行 script/export.js 静态导出，产物为 .next/standalone，
# 由 Dockerfile 打成常驻 Node 服务镜像。

# make build-isr APP=academy ENV=test
build-isr:lang
	echo ISR BUILD APP:$(APP) ENV:$(ENV)
	@if [ $(SYNC_APP_LANG) = 1 ]; then nx run lang:sync-app-asset --app=$(APP) --folder="src/assets" ; fi; \

	@if [ $(SYNC_GMP_LIB_LANG) = 1 ]; then nx run lang:sync-app-asset --app="gmp-lib" --folder="src/assets"; fi;\
	rm -rf dist/$(ENV)/apps/$(APP)
	node script/genBuildRelease.js -p $(APP) -e $(ENV)
	nx run $(APP):build:$(ENV) --pipeline-env ${PIPELINE_ENV}
	@if [ "$(ENV)" = "production" ]; then SRC=dist/apps/$(APP); else SRC=dist/$(ENV)/apps/$(APP); fi; \
	ls -ltr $$SRC/.next/standalone || (echo "standalone 未生成，请确认 next.config.js 已设置 output: 'standalone'" && exit 1)

# make package-isr APP=academy ENV=test
package-isr:build-isr
	rm -rf output/standalone
	mkdir -p output/standalone
	@if [ "$(ENV)" = "production" ]; then SRC=dist/apps/$(APP); else SRC=dist/$(ENV)/apps/$(APP); fi; \
	cp -r $$SRC/.next/standalone/. output/standalone/ ; \
	mkdir -p output/standalone/apps/$(APP)/.next ; \
	cp -r $$SRC/.next/static output/standalone/apps/$(APP)/.next/static ; \
	if [ -d apps/$(APP)/public ]; then cp -r apps/$(APP)/public output/standalone/apps/$(APP)/public ; fi ; \
	echo "standalone 运行目录已组装到 output/standalone，可执行 docker build -f apps/$(APP)/Dockerfile -t academy ."

