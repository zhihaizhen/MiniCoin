// @ts-nocheck
import { message } from 'antd';
import Banner from '~/components/banner';
import AccountInfo from '~/components/accountInfo';

// export interface IAccountContainerProps {}

const AccountContainer: React.FC = (props) => {
  const [messageApi, contextHolder] = message.useMessage();
  return (
    <div>
      {contextHolder}
      <Banner />
      <AccountInfo />
    </div>
  );
};

export default AccountContainer;
