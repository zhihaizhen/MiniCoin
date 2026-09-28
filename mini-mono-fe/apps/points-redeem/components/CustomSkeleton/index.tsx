import React from 'react';


const CustomSkeleton = ({type}) => {
  if (type === "header") {
    return (
      <>
        {/* 左侧骨架屏 */}
        <div className="w-full md:w-auto space-y-3 md:space-y-5 mt-[300px] md:mt-0">
          {/* 副标题骨架 */}
          <div className="h-5 md:h-7 w-32 md:w-48 bg-gray-700/50 rounded animate-pulse mx-auto md:mx-0" />

          {/* 主标题骨架 - 桌面端 */}
          <div className="hidden md:flex gap-2 items-center">
            <div className="h-12 w-full bg-gray-700/50 rounded animate-pulse" />
            {/*<div className="h-8 w-8 bg-gray-700/50 rounded animate-pulse" />*/}
            {/*<div className="h-12 w-32 bg-gray-700/50 rounded animate-pulse" />*/}
            {/*<div className="h-8 w-8 bg-gray-700/50 rounded animate-pulse" />*/}
            {/*<div className="h-12 w-36 bg-gray-700/50 rounded animate-pulse" />*/}
          </div>

          {/* 主标题骨架 - 移动端 */}
          <div className="md:hidden h-10 w-48 bg-gray-700/50 rounded animate-pulse mx-auto" />

          {/* 时间骨架 */}
          <div className="h-4 md:h-5 w-full md:w-96 bg-gray-700/50 rounded animate-pulse mx-auto md:mx-0" />

          {/* 提示文字骨架 */}
          <div className="h-4 w-40 bg-gray-700/50 rounded animate-pulse mx-auto md:mx-0 mt-8 md:mt-9" />

          {/* 倒计时骨架 */}
          <div className="flex gap-2 justify-center md:justify-start mt-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-16 w-12 bg-gray-700/50 rounded animate-pulse"
              />
            ))}
          </div>

          {/* 按钮骨架 */}
          <div className="flex gap-4 mt-8">
            <div className="w-full md:w-auto md:min-w-[220px] h-12 bg-gray-700/50 rounded-xl animate-pulse" />
            <div className="h-12 w-12 bg-gray-700/50 rounded-xl animate-pulse" />
          </div>
        </div>

        {/* 右侧图片骨架 */}
        {/*<div className="w-[292px] h-[292px] md:w-[428px] md:h-[428px] " />*/}
      </>
    );
  }

  if (type === "tasks") {
    return (
      <>
        {[1, 2, 3].map((_, index) => (
          <div key={index} className="relative mt-6">
            <div className="md:min-h-[188px] h-auto border border-line-border-default rounded-xl grid grid-cols-1 md:grid-cols-[180px_auto] pr-4 pt-4 md:pt-0 pl-4 md:pl-0 pb-6 md:pb-0 overflow-hidden animate-pulse">
              <div className="md:bg-bg-secondary flex md:flex-col justify-start md:justify-center items-end md:items-center gap-1">
                <div className="w-20 h-8 bg-gray-700/50 rounded"></div>
                <div className="w-12 h-4 bg-gray-700/50 rounded"></div>
              </div>
              <div className="flex flex-col md:flex-row items-center justify-between w-full h-full">
                <div className="flex-1 md:pl-8 h-full flex flex-col justify-start pt-5 md:pt-8 w-full">
                  <div className="w-32 h-6 bg-gray-700/50 rounded"></div>
                  <div className="w-full h-4 bg-gray-700/50 rounded mt-3"></div>
                  <div className="md:hidden w-full h-px bg-line-divider-primary mt-4"></div>
                  <div className="flex items-center justify-start mt-4 md:mt-6">
                    <div className="w-40 h-4 bg-gray-700/50 rounded"></div>
                  </div>
                  <div className="flex items-center justify-start mt-1">
                    <div className="w-24 h-4 bg-gray-700/50 rounded"></div>
                  </div>
                </div>
                <div className="w-full md:w-auto md:min-w-[100px] h-10 mt-4 md:mt-0 rounded-xl bg-gray-700/50"></div>
              </div>
            </div>
          </div>
        ))}
      </>
    );
  }

  if (type === "rewards") {
    return (
      <div className="grid gap-x-3 grid-cols-2 gap-y-[90px] pt-[60px] md:grid-cols-4 md:gap-y-[120px] mt-8 md:mt-14">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`skeleton-${index}`}
            className="group border border-solid border-line-border-default bg-bg-secondary relative rounded-xl animate-pulse"
          >
            <div className="h-full w-full rounded-lg overflow-hidden absolute md:rounded-xl" />
            <div className="absolute start-[50%] mx-[5px] translate-x-[-55%] md:translate-x-[-50%] w-16 h-16 z-10 md:block md:w-[86px] md:h-[86px] md:m-auto -top-8 md:top-[-50px]">
              <div className="w-full h-full bg-gray-700/50 rounded-full" />
            </div>
            <div className="relative z-6 flex-1 pb-9 px-4 md:px-9 mt-10 md:mt-[60px]">
              <div className="h-6 md:h-7 bg-gray-700/50 rounded mx-auto w-3/4 mb-2" />
              <div className="h-4 bg-gray-700/50 rounded mx-auto w-1/2 mt-2" />
              <div className="h-4 bg-gray-700/50 rounded mx-auto w-2/3 mt-[46px] md:mt-[52px]" />
              <div className="relative z-11 -bottom-4.5 md:-bottom-3.5">
                <div className="absolute start-0 end-0 h-8 md:h-10 w-full rounded-xl bg-gray-700/50" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );

  }

  if (type === "recommand") {
    return (
      <div className="h-[164px] border border-line-border-default rounded-xl flex flex-col items-center justify-between p-4 animate-pulse">
        <div className="w-full flex items-center justify-start gap-2">
          <div className="w-[26px] h-[26px] rounded-full bg-gray-200" />
          <div className="w-20 h-6 bg-gray-200 rounded" />
        </div>

        <div className="w-full flex items-center justify-between">
          <div className="flex flex-col items-start gap-1">
            <div className="w-16 h-4 bg-gray-200 rounded" />
            <div className="w-24 h-7 bg-gray-200 rounded" />
          </div>
          <div>
            <div className="w-16 h-4 bg-gray-200 rounded" />
            <div className="w-20 h-7 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    )
  }

  return null;
}
export default CustomSkeleton;
