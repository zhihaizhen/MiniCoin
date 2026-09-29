set -x

yarn install
yarn add @betterbit/marvel-cli -D

TODAY=$(date +'%Y%m%d')

export BUILD_ENV=${ENV}
export RELEASE_VERSION=${TODAY}.${BUILD_NUMBER=0}
export LINT_BEFORE_BABEL=false
CURRENT_BUILD_ENV=${ENV}

if [ "$ENV" = "prod" ];then
    CURRENT_BUILD_ENV=production
    BUILD_ENV=production
fi

npx cross-env CURRENT_BUILD_ENV=${CURRENT_BUILD_ENV='dev'} marvel build --business ${TASK_NAME='forward'} --platform ${TASK_PLATFORM='desktop'}

