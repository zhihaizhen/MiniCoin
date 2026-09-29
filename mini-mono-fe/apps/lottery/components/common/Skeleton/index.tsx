import React from 'react';


const Skeleton = () => {
  return  <div className="absolute inset-0 z-50 bg-[#1A1A1A] animate-pulse">
    <div className="relative h-full w-full max-w-[1440px] mx-auto flex flex-col items-center justify-start z-10 mt-10 md:mt-[64px] pt-[30px] md:pt-[48px]">
      {/*<div className="h-[28px] md:h-[48px] w-[280px] md:w-[400px] bg-gray-700 rounded-lg"></div>*/}
      <div className="h-[32px] w-[200px] md:w-[300px] bg-gray-700 rounded-lg mt-[18px] md:mt-[32px]"></div>
      <div className="h-[200px] md:h-[400px] w-[300px] md:w-[600px] bg-gray-700 rounded-lg mt-[32px] md:mt-[64px]"></div>
      <div className="h-[60px] w-[155px] md:w-[310px] bg-gray-700 rounded-lg mt-[32px]"></div>
    </div>
    {/*<div className="absolute left-[-50px] top-[100px] w-[250px] md:w-[310px] h-[150px] md:h-[300px]">*/}
    {/*  <div className="h-full w-[150px] md:w-[250px] bg-gray-700 rounded-tr-[20px] rounded-br-[20px]"></div>*/}
    {/*</div>*/}
  </div>
}

export default Skeleton;
