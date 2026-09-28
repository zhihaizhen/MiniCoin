import React from 'react';
import { useUserInfo } from '@better-bit-fe/base-provider';



const CustomSkeleton = ({type}) => {
 const { isLogin } = useUserInfo();
  if (type === "header") {
    return (
      <div className="w-full rounded-2xl px-6 md:px-0 md:py-3 text-white flex flex-col-reverse md:flex-row justify-between gap-2 md:gap-4">
        <div className="flex-1 space-y-8 flex flex-col justify-center min-h-60 md:min-h-[276px]">
          <div className="space-y-3 md:block flex flex-col items-center">
            <div className="h-8 w-40 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-200 rounded-md animate-pulse"></div>
          </div>

          {isLogin && (
            <div className="flex space-x-12 mt-4">
              <div className="space-y-3">
                <div className="h-4 w-20 bg-gray-200 rounded-md animate-pulse"></div>
                <div className="h-6 w-28 bg-gray-200 rounded-md animate-pulse"></div>
                <div className="h-4 w-24 bg-gray-200 rounded-md animate-pulse"></div>
              </div>

              <div className="space-y-3">
                <div className="h-4 w-20 bg-gray-200 rounded-md animate-pulse"></div>
                <div className="h-6 w-28 bg-gray-200 rounded-md animate-pulse"></div>
                <div className="h-4 w-24 bg-gray-200 rounded-md animate-pulse"></div>
              </div>
            </div>
          )}

          <div className="flex space-x-4 mt-3">
            <div className="h-11 w-full md:w-36 bg-gray-200 rounded-xl animate-pulse"></div>
            <div className="hidden md:block h-11 w-36 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>
        </div>

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
            <div className="w-24 h-11 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    )
  }

  return null;
}
export default CustomSkeleton;
