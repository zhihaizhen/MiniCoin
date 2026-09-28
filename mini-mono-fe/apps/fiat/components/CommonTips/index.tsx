
import {useState} from 'react'

const CommonTips = () => {

  const MinusIcon = () => {
    return (<svg width="20" height="4" viewBox="0 0 20 4" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0.400391 3.5H19.6004V0.5H0.400391V3.5Z" fill="white"/>
      </svg>
    )
  }
  const PlusIcon = () => {
    return (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.5004 13.5V21.6H13.5004V13.5H21.6004V10.5H13.5004V2.40002H10.5004L10.5004 10.5H2.40039V13.5H10.5004Z" fill="white"/>
      </svg>
    )
  }

  const [activeIndex, setActiveIndex] = useState(0)
  const tips = [
    {
      title: '什么是买币？',
      subTitle: '用户可通过合作的第三方支付渠道，使用法币快速购买 USDT、BTC、ETH 等主流数字资产。'
    },
    {
      title: '2什么是买币？',
      subTitle: '用户可通过合作的第三方支付渠道，使用法币快速购买 USDT、BTC、ETH 等主流数字资产。'
    },
    {
      title: '3什么是买币？',
      subTitle: '用户可通过合作的第三方支付渠道，使用法币快速购买 USDT、BTC、ETH 等主流数字资产。'
    },
    {
      title: '4什么是买币？',
      subTitle: '用户可通过合作的第三方支付渠道，使用法币快速购买 USDT、BTC、ETH 等主流数字资产。'
    },
  ]

  return (
    <div className='max-w-[960px] pb-[120px] flex flex-col items-center justify-center'>
      <h1 className='text-white text-[48px] font-semibold leading-[64px] pb-6'>
        常见问题
      </h1>
      <div className='flex flex-col items-center justify-center gap-4'>
        {
          tips.map((item, i) => {
            return (
              <div key={item.title} className={`w-full text-white py-4 px-8 rounded-[12px] ${activeIndex === i ? 'border-[1px] border-[#37393A]' : 'bg-[#1D1D1D]'}`}>
                <div className='flex items-center justify-between cursor-pointer' onClick={() => setActiveIndex(i)}>
                  <h3 className='text-lg'>{item.title}</h3>
                  {activeIndex === i ? <MinusIcon /> : <PlusIcon />}
                </div>
                {activeIndex === i && <p className='text-text-secondary text-[14px] mt-3'>{item.subTitle}</p>}
              </div>
            )
          })
        }
      </div>
    </div>
  )
}
export default CommonTips
