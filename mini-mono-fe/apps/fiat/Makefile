export PATH := $(shell pwd)/node_modules/.bin:$(PATH)

# 通过指定proto文件来生成对应的api
protoFiles = ../../apidoc/stub/proto3/common_act/svc.proto
genapi:
	gtd m -d $(protoFiles) -o ./api --depPath=../../apidoc/common-proto --protoDir ../../apidoc/stub/proto3/common_act --apiPath=~/utils/webapi --services SpotPromoAPI

