cd ../deploy
git checkout -b branch/$DEPLOY_BRANCH
git pull origin branch/$DEPLOY_BRANCH
cp -rf ../web/dist/${TASK_NAME}/${TASK_PLATFORM}/* ./
git add .
git commit -m "#${BUILD_NUMBER}_${branch#*/}_${BUILD_USER}_$BUILD_DATE"
git push -u origin branch/$DEPLOY_BRANCH

echo -e "======================================================\n [$ENV] [反向交易站 inverse] 当前commit: $current_git_branch_latest_id\n======================================================"
cd ../web
echo -e "\n****************************** 修改内容 **************************************\n"
git log $branch ^refs/remotes/origin/master --pretty=" ** %s - %an - %ad" --date=format:"%Y-%m-%d %H:%M:%S" --no-merges --abbrev-commit | awk -F ':' '{print NR " " $0 }'
echo -e "\n****************************** 修改内容 **************************************\n"