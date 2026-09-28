import React, { useEffect, useState, useRef } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { message, Collapse, QRCode } from 'antd';
import copy from 'copy-to-clipboard';
import { useRouter } from 'next/router';
import CreateApiModal from '~/components/APIKeys/createApiModal';
import TermsConfirmModal from '~/components/APIKeys/termsConfirmModal';
import VerifyModalGather from '~/components/VerifyModalGather';
import { getTmsMessages } from '@better-bit-fe/lang';
import { useFm } from '@better-bit-fe/base-hooks';
import { getUserProfile, postCreateOpenApiKey, getOpenApiKeyList, postDelOpenApiKey, getOpenApiKeyDetail, getOpenApiKeyBase } from '~/api';
import { useLoginRedirect } from '~/hooks/useLoginRedirect';
import { withSettingPage } from '~/hoc/withSettingPage';
import { basePath, getLang } from '@better-bit-fe/base-utils';
import { urlInfo } from '@region-lib/env';
import styles from './index.module.less';
interface ApiKeyItem {
  id: number;
  name: string;
  api_key: string; // API Key
  api_secret?: string; // API Secret
  permission_type: 'rw' | 'r'; // 权限类型 rw读写 r只读
  futures_order: boolean; // 合约订单权限
  futures_position: boolean; // 合约持仓权限
  spot_trade: boolean; // 现货交易权限
  asset_transfer: boolean; // 资产划转权限
  ips: string[]; // IP 白名单列表
  created_at: number; // 创建时间戳
  permissions: string[]; // 用于显示的权限标签
}

function Home() {
  const [userInfo, setUserInfo] = useState<any>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create'); // 弹框模式
  const [selectedApiKey, setSelectedApiKey] = useState<ApiKeyItem | null>(null);
  const [apiKeyList, setApiKeyList] = useState<ApiKeyItem[]>([]);
  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  // 下一次列表刷新后优先展开的 key（用于编辑/详情等“操作哪条展开哪条”）
  const [preferredActiveKey, setPreferredActiveKey] = useState<string | null>(null);
  // 编辑提交成功后，下一次列表刷新时必须展开的 key（用 ref 避免在刷新前被 effect 提前消费）
  const preferredActiveKeyAfterRefreshRef = useRef<string | null>(null);
  // 强制下一次列表刷新后展开第一条（用于初次进入/新增/删除）
  // 用 ref 避免在“旧列表”上提前消费掉该标记
  const forceFirstExpandRef = useRef(true);
  // 新增成功后，用 api_key 锁定新建项；等列表刷新后再根据 api_key 找到对应 id 并展开
  const [preferredActiveApiKey, setPreferredActiveApiKey] = useState<string | null>(null);
  // 新增接口会返回私密字段（如 api_secret），列表接口不会返回；
  // 因此新增成功后先缓存返回值，等列表刷新后用它覆盖对应 item（优先按 id，兜底按 api_key）
  // 用 ref 避免 setState 异步导致 fetchApiKeyList 读不到最新值
  const createdApiKeyPatchRef = useRef<Partial<ApiKeyItem> | null>(null);
  const [pendingAction, setPendingAction] = useState<{ type: 'create' | 'edit' | 'edit-submit' | 'delete' | 'detail', data?: any }>({ type: 'create' });
  const [termsConfirmVisible, setTermsConfirmVisible] = useState(false);
  const verifyRef = useRef<any>();
  const router = useRouter();
  const t = useFm();
  const lang = getLang();
  const MAX_API_KEY_COUNT = 10;

  // localStorage key for API terms confirmation
  const TERMS_CONFIRMED_KEY = 'api_terms_confirmed';

  const ensureHasTwoVerificationMethods = () => {
    const verificationMethods = [
      userInfo.google2fa_is_verified,
      userInfo.mobile_is_verified,
      userInfo.email_is_verified
    ].filter(Boolean);

    if (verificationMethods.length < 2) {
      verifyRef.current?.changeModalVisible(true);
      return false;
    }

    return true;
  };

  // API 文档链接 - 根据环境和语言动态设置
  const getApiDocsUrl = () => {
    const { env } = urlInfo;
    const lang = getLang();

    // 判断是否为中文环境
    const isChinese = lang === 'zh-CN' || lang === 'zh-TW' || lang === 'zh-HK';
    const docPath = isChinese ? '/api-doc/zh-CN/common/Info' : '/api-doc/common/Info';

    if (env === 'prod') {
      // 生产环境使用当前域名
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.bitrunfinance.com';
      return `${origin}${docPath}`;
    }
    // test 和 testnet 环境都使用测试环境链接
    return `https://www.test.bitrunfinance.com${docPath}`;
  };

  const API_DOCS_URL = getApiDocsUrl();

  // 登录验证和重定向
  useLoginRedirect();

  useEffect(() => {
    getUserProfile().then((data) => {
      setUserInfo(data);
    });
    // 获取 API Key 列表
    fetchApiKeyList();
  }, []);

  // 处理通知文本中的链接点击
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('link')) {
        e.preventDefault();
        let url = API_DOCS_URL;
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    };

    const noticeText = document.querySelector(`.${styles.noticeText}`);
    if (noticeText) {
      noticeText.addEventListener('click', handleLinkClick);
    }

    return () => {
      if (noticeText) {
        noticeText.removeEventListener('click', handleLinkClick);
      }
    };
  }, []);

  // 获取 API Key 列表
  const fetchApiKeyList = async (patchOverride?: Partial<ApiKeyItem> | null) => {
    try {
      const res = await getOpenApiKeyList();
      const patch = patchOverride ?? createdApiKeyPatchRef.current;
      let isPatched = false;
      // 转换后端数据格式为前端需要的格式
      const formattedList: ApiKeyItem[] = (res || []).map((item: any) => {
        // 新增接口返回私密字段（例如 api_secret），这里在列表刷新后补齐到对应 item
        const shouldPatch = !!patch
          && (
            (typeof (patch as any)?.id === 'number' && item.id === (patch as any).id)
            || ((patch as any)?.api_key && item.api_key === (patch as any).api_key)
          );
        const mergedItem = shouldPatch ? { ...item, ...patch } : item;
        if (shouldPatch) {
          isPatched = true;
        }
        // 根据业务权限生成权限标签
        const permissions: string[] = [];
        if (mergedItem.futures_order) permissions.push(t('api-business-order-tag'));
        if (mergedItem.futures_position) permissions.push(t('api-business-position-tag'));
        if (mergedItem.spot_trade) permissions.push(t('api-business-trade-tag'));
        if (mergedItem.asset_transfer) permissions.push(t('api-business-withdraw-tag'));

        return {
          ...mergedItem,
          permissions
        };
      });
      // 覆盖成功后清理缓存，避免影响后续刷新
      if (isPatched) {
        createdApiKeyPatchRef.current = null;
      }
      setApiKeyList(formattedList);
    } catch (error) {
      console.error('Fetch API Key list failed:', error);
    }
  };

  // 进入页面/列表刷新后：
  // - 默认展开第一条
  // - 编辑/详情：展开对应条目（preferredActiveKey）
  // - 新增/删除：不保留旧展开，回到第一条
  useEffect(() => {
    if (!apiKeyList.length) {
      setActiveKeys([]);
      setPreferredActiveKey(null);
      setPreferredActiveApiKey(null);
      preferredActiveKeyAfterRefreshRef.current = null;
      forceFirstExpandRef.current = true;
      return;
    }

    const keySet = new Set(apiKeyList.map((i) => String(i.id)));
    const firstKey = String(apiKeyList[0].id);
    const preferredAfterRefreshKey = preferredActiveKeyAfterRefreshRef.current;
    const matchedByApiKey = preferredActiveApiKey
      ? apiKeyList.find((i) => i.api_key === preferredActiveApiKey)
      : undefined;

    setActiveKeys((prev) => {
      if (preferredAfterRefreshKey && keySet.has(preferredAfterRefreshKey)) {
        return [preferredAfterRefreshKey];
      }
      if (preferredActiveKey && keySet.has(preferredActiveKey)) {
        return [preferredActiveKey];
      }
      if (matchedByApiKey) {
        return [String(matchedByApiKey.id)];
      }
      if (forceFirstExpandRef.current) {
        return [firstKey];
      }
      const validPrev = (prev || []).filter((k) => keySet.has(String(k)));
      return validPrev.length > 0 ? validPrev : [firstKey];
    });

    if (preferredAfterRefreshKey && keySet.has(preferredAfterRefreshKey)) {
      preferredActiveKeyAfterRefreshRef.current = null;
    }
    if (preferredActiveKey && keySet.has(preferredActiveKey)) {
      setPreferredActiveKey(null);
    }
    if (matchedByApiKey) {
      setPreferredActiveApiKey(null);
    }
    // 每次列表刷新后，消费一次“强制展开第一条”标记，避免影响后续用户手动展开行为
    forceFirstExpandRef.current = false;
  }, [apiKeyList, preferredActiveKey, preferredActiveApiKey]);

  const handleCreateClick = () => {
    if (apiKeyList.length >= MAX_API_KEY_COUNT) {
      message.error(t('api-max-api-key-count'));
      return;
    }
    if (ensureHasTwoVerificationMethods()) {
      // 检查是否已确认过条款
      const termsConfirmed = localStorage.getItem(TERMS_CONFIRMED_KEY);

      if (!termsConfirmed) {
        // 第一次创建，显示条款确认弹框
        setTermsConfirmVisible(true);
      } else {
        // 已确认过条款，直接打开创建弹框
        setModalMode('create');
        setSelectedApiKey(null);
        setModalVisible(true);
      }
    }
  };

  // 处理条款确认
  const handleTermsConfirm = () => {
    if (apiKeyList.length >= MAX_API_KEY_COUNT) {
      message.error('最多只能创建10条API Key');
      return;
    }
    // 保存确认状态到 localStorage
    localStorage.setItem(TERMS_CONFIRMED_KEY, 'true');
    // 关闭条款弹框
    setTermsConfirmVisible(false);
    // 打开创建弹框
    setModalMode('create');
    setSelectedApiKey(null);
    setModalVisible(true);
  };

  // 处理条款拒绝
  const handleTermsCancel = () => {
    setTermsConfirmVisible(false);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedApiKey(null);
  };

  const handleModalSubmit = (values: any) => {
    console.log('Form values:', values);
    // 根据模式设置待执行的操作
    if (modalMode === 'edit') {
      setPendingAction({ type: 'edit-submit', data: { ...values, id: selectedApiKey?.id } });
    } else {
      setPendingAction({ type: 'create', data: values });
    }
    // 打开验证器（不关闭弹框）
    verifyRef.current?.changeModalVisible(true);
  };

  // 复制到剪贴板
  const handleCopy = (text: string) => {
    copy(text);
    message.success(t('copyTips'));
  };

  // 删除 API Key
  const handleDelete = (id: number) => {
    if (!ensureHasTwoVerificationMethods()) return;
    // 设置待执行的操作为删除
    setPendingAction({ type: 'delete', data: { id } });
    // 删除完成后列表会刷新：按需求回到第一条默认展开
    setPreferredActiveKey(null);
    forceFirstExpandRef.current = true;
    // 打开验证器
    verifyRef.current?.changeModalVisible(true);
  };

  // 查看详情
  const handleDetail = (id: number) => {
    if (!ensureHasTwoVerificationMethods()) return;
    const apiKey = apiKeyList.find(item => item.id === id);
    if (apiKey) {
      // 设置待执行的操作为查看详情
      setPendingAction({ type: 'detail', data: { id, apiKey } });
      // 详情验证通过后应展开该条
      setPreferredActiveKey(String(id));
      forceFirstExpandRef.current = false;
      // 先打开验证框
      verifyRef.current?.changeModalVisible(true);
    }
  };

  // 编辑 API Key
  const handleEdit = async (id: number) => {
    if (!ensureHasTwoVerificationMethods()) return;
    const apiKey = apiKeyList.find(item => item.id === id);
    if (apiKey) {
      try {
        // 编辑操作：展开该条
        setPreferredActiveKey(String(id));
        forceFirstExpandRef.current = false;
        setActiveKeys([String(id)]);
        // 调用基础详情接口获取数据（不需要验证码）
        const detailData = await getOpenApiKeyBase({ id });

        // 生成权限标签（与 fetchApiKeyList 中的逻辑一致）
        const permissions: string[] = [];
        if (detailData.futures_order) permissions.push(t('api-business-order'));
        if (detailData.futures_position) permissions.push(t('api-business-position'));
        if (detailData.spot_trade) permissions.push(t('api-business-trade'));
        if (detailData.asset_transfer) permissions.push(t('api-business-withdraw'));

        // 获取详情成功后，打开编辑弹框
        setSelectedApiKey({
          ...detailData,
          permissions,
        });
        setModalMode('edit');
        setModalVisible(true);
      } catch (error) {
        console.error('Get API Key base info for edit failed:', error);
        // 如果获取详情失败，使用列表数据
        setSelectedApiKey(apiKey);
        setModalMode('edit');
        setModalVisible(true);
      }
    }
  };


  // 验证通过后的确认操作（三选二：email / sms / 2fa 任意两项）
  type VerifyCodeParams = {
    email_code?: string;
    mobile_code?: string;
    '2fa_code'?: string;
    passkey_code?: string;
  };

  /**
   * 验证通过后的确认操作（三选二：email / sms / 2fa 任意两项）
   *
   * 注意：这里不再 catch 吞掉错误 —— 验证码错误时必须把异常抛回给
   * VerifyModalGather/VerifyFormModal，由其在对应输入框下方行内提示且保持弹框打开；
   * 只有本函数正常 resolve（不抛错）时，弹框才会被关闭。
   */
  const handleVerifyConfirm = async (verifyData: VerifyCodeParams) => {
    const verifyParams: VerifyCodeParams = {};
    if (verifyData?.email_code) verifyParams.email_code = verifyData.email_code;
    if (verifyData?.mobile_code) verifyParams.mobile_code = verifyData.mobile_code;
    if (verifyData?.['2fa_code']) verifyParams['2fa_code'] = verifyData['2fa_code'];
    if (verifyData?.passkey_code) verifyParams.passkey_code = verifyData.passkey_code;

    if (pendingAction.type === 'create') {
      if (apiKeyList.length >= MAX_API_KEY_COUNT) {
        message.error('最多只能创建10条API Key');
        return;
      }
      const formData = pendingAction.data;

      // 处理 IP 地址（用逗号分隔）
      const ipList = formData.ipAddress
        ? formData.ipAddress.split(',').filter((ip: string) => ip.trim()).map((ip: string) => ip.trim())
        : [];

      // 处理业务权限
      const businessTypes = formData.businessTypes || [];

      // 转换表单数据为接口参数（只传递为 true 的字段）
      const params: any = {
        name: formData.name,
        permission_type: formData.permission_type as 'rw' | 'r', // 'rw': 读写权限, 'r': 只读权限
        ips: ipList,
        ...verifyParams
      };

      // 只添加值为 true 的业务权限字段
      if (businessTypes.includes('futures_order')) {
        params.futures_order = true;
      }
      if (businessTypes.includes('futures_position')) {
        params.futures_position = true;
      }
      if (businessTypes.includes('spot_trade')) {
        params.spot_trade = true;
      }
      if (businessTypes.includes('asset_transfer')) {
        params.asset_transfer = true;
      }

      // 调用创建 API Key 的接口（验证码错误会在此 throw，交由验证弹框行内提示）
      const res = await postCreateOpenApiKey(params);

      message.success(t('api-create-success'));
      setModalVisible(false); // 验证通过后关闭创建弹框

      // 重新获取列表
      // 新增后：展开新建的这一条（接口返回 api_key，可用于定位）
      setPreferredActiveKey(null);
      setPreferredActiveApiKey(res?.api_key || null);
      // 用新增接口返回值补齐列表里拿不到的私密字段（如 api_secret）
      createdApiKeyPatchRef.current = res as unknown as Partial<ApiKeyItem>;
      // 兜底：如果找不到对应 api_key，则默认展开第一条
      forceFirstExpandRef.current = true;
      fetchApiKeyList(createdApiKeyPatchRef.current);

    } else if (pendingAction.type === 'edit-submit') {
      const formData = pendingAction.data;

      // 处理 IP 地址（用逗号分隔）
      const ipList = formData.ipAddress
        ? formData.ipAddress.split(',').filter((ip: string) => ip.trim()).map((ip: string) => ip.trim())
        : [];

      // 处理业务权限
      const businessTypes = formData.businessTypes || [];

      // 转换表单数据为接口参数（只传递为 true 的字段）
      const params: any = {
        id: formData.id,
        name: formData.name,
        permission_type: formData.permission_type as 'rw' | 'r',
        ips: ipList,
        ...verifyParams
      };

      // 只添加值为 true 的业务权限字段
      if (businessTypes.includes('futures_order')) {
        params.futures_order = true;
      }
      if (businessTypes.includes('futures_position')) {
        params.futures_position = true;
      }
      if (businessTypes.includes('spot_trade')) {
        params.spot_trade = true;
      }
      if (businessTypes.includes('asset_transfer')) {
        params.asset_transfer = true;
      }

      // 调用编辑 API Key 的接口（验证码错误会在此 throw，交由验证弹框行内提示）
      await postCreateOpenApiKey(params);

      message.success(t('api-edit-success'));
      setModalVisible(false); // 验证通过后关闭弹框

      // 重新获取列表
      // 编辑提交后：展开编辑的这条
      const editedId = formData?.id ?? selectedApiKey?.id;
      if (editedId) {
        const key = String(editedId);
        preferredActiveKeyAfterRefreshRef.current = key;
        setActiveKeys([key]);
      }
      forceFirstExpandRef.current = false;
      fetchApiKeyList();

    } else if (pendingAction.type === 'delete') {
      // 调用删除 API Key 的接口（验证码错误会在此 throw，交由验证弹框行内提示）
      await postDelOpenApiKey({
        id: pendingAction.data.id,
        ...verifyParams
      });

      message.success(t('api-delete-success'));

      // 重新获取列表
      // 删除后：按需求默认展开第一条
      setPreferredActiveKey(null);
      forceFirstExpandRef.current = true;
      fetchApiKeyList();

    } else if (pendingAction.type === 'detail') {
      // 调用查看详情的接口，传入验证码（验证码错误会在此 throw，交由验证弹框行内提示）
      const detailData = await getOpenApiKeyDetail({
        id: pendingAction.data.id,
        ...(verifyParams as any)
      });

      // 验证通过后，更新列表中对应项的 api_secret
      setApiKeyList(prevList =>
        prevList.map(item =>
          item.id === pendingAction.data.id
            ? { ...item, api_secret: detailData.api_secret }
            : item
        )
      );

      // 展开对应的 collapse 项（避免 list 更新触发 effect 回到第一条）
      setPreferredActiveKey(String(pendingAction.data.id));
      forceFirstExpandRef.current = false;
      setActiveKeys([String(pendingAction.data.id)]);
    }
  };

  // 渲染 Collapse 的额外操作按钮
  const renderExtra = (item: ApiKeyItem) => (
    <div className={styles.apiKeyHeaderRight} onClick={(e) => e.stopPropagation()}>
      <button className={styles.actionBtn} onClick={() => handleDetail(item.id)}>
        {t('api-detail')}
      </button>
      <button className={styles.actionBtn} onClick={() => handleEdit(item.id)}>
        {t('api-edit')}
      </button>
      <button className={`${styles.actionBtn} ${styles.actionBtnDelete}`} onClick={() => handleDelete(item.id)}>
        {t('api-delete')}
      </button>
    </div>
  );

  // 渲染 Collapse 的详情内容
  const renderPanelContent = (item: ApiKeyItem) => {
    const hasSecret = item.api_secret && item.api_secret !== '**********';

    return (
      <div className={styles.apiKeyDetail}>
        <div className={styles.qrCodeSection}>
          {/* QR Code 或占位符 */}
          {hasSecret ? (
            <QRCode value={item.api_secret} size={160} />
          ) : (
            <div className={styles.qrCodePlaceholder}>
              <img
                src={basePath + '/images/lock.svg'}
                alt="lock"
                width={32}
                height={32}
              />
            </div>
          )}
        </div>
        <div className={styles.detailContent}>
          {/* API Key */}
          <div className={styles.detailItem}>
            <div className={styles.detailLabel}>{t('api-key-label')}</div>
            <div className={styles.detailValue}>
              <span className={styles.detailValueText}>{item.api_key}</span>
              <span
                className={styles.copyIcon}
                onClick={() => handleCopy(item.api_key)}
              />
            </div>
          </div>

          {/* Secret Key */}
          <div className={styles.detailItem}>
            <div className={styles.detailLabel}>{t('api-secret-label')}</div>
            <div className={styles.detailValue}>
              <span className={styles.detailValueText}>{hasSecret ? item.api_secret : '**********'}</span>
              {hasSecret && (
                <span
                  className={styles.copyIcon}
                  onClick={() => handleCopy(item.api_secret)}
                />
              )}
            </div>
          </div>

          {/* IP 白名单 */}
          <div className={styles.detailItem}>
            <div className={styles.detailLabel}>{t('api-ip-whitelist')}</div>
            <div className={styles.detailValueSimple}>
              {Array.isArray(item.ips) ? item.ips.join(', ') : (item.ips || '-')}
            </div>
          </div>

          {/* 权限 */}
          <div className={styles.detailItem}>
            <div className={styles.detailLabel}>{t('api-permissions')}</div>
            <div className={styles.permissionsList}>
              <span className={styles.permissionsAll}>{item.permission_type === 'rw' ? t('api-permission-readwrite') : t('api-permission-readonly')}</span>
              <div className={styles.permissionTags}>
                {(item.permissions || []).map((permission, index) => (
                  <span key={index} className={styles.permissionTag}>
                    {permission}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 生成 Collapse 的 items
  const collapseItems = apiKeyList.map((item) => ({
    key: String(item.id),
    label: (
      <div className={styles.apiKeyHeaderLeft}>
        <span className={styles.apiKeyName}>{item.name}</span>
        <span className={styles.apiKeyType}>HMAC</span>
      </div>
    ),
    extra: renderExtra(item),
    children: renderPanelContent(item)
  }));

  return (
    <>
      <div className={styles.container}>
        {/* 头部区域 */}
        <div className={styles.headerSection}>
          <div className={styles.title}>{t('api-title')}</div>
          <button
            className={styles.createBtn}
            onClick={handleCreateClick}
            disabled={apiKeyList.length >= MAX_API_KEY_COUNT}
          >
            <PlusOutlined style={{ fontSize: '18px' }} />
            {t('api-create-btn')}
          </button>
        </div>

        {/* 提示区域 */}
        <div className={styles.noticeSection}>
          <div className={styles.noticeHeader}>
            <img
              src={basePath + '/images/notice-icon.svg'}
              alt="notice"
              width={14}
              height={14}
              className={styles.noticeIcon}
            />
            <span className={styles.noticeTitle}>{t('api-notice-title')}</span>
          </div>
          <div className={styles.noticeContent}>
            <div
              className={styles.noticeText}
              dangerouslySetInnerHTML={{ __html: t('api-notice-text') }}
            />
          </div>
        </div>

        {/* API Key 列表 */}
        {apiKeyList.length > 0 ? (
          <Collapse
            className={styles.apiKeyList}
            activeKey={activeKeys}
            onChange={(keys) => setActiveKeys(keys as string[])}
            items={collapseItems}
            expandIconPosition="end"
            bordered={false}
          />
        ) : (
          /* 空状态区域 */
          <div className={styles.emptySection}>
            <img
              src={basePath + '/images/empty.png'}
              alt="empty"
              width={80}
              height={80}
              className={styles.emptyImage}
            />
            <div className={styles.emptyText}>{t('api-empty-text')}</div>
          </div>
        )}
      </div>

      {/* 创建/编辑 API Key Modal */}
      <CreateApiModal
        visible={modalVisible}
        mode={modalMode}
        initialData={selectedApiKey}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
      />


      {/* 身份验证器（VerifyModalGather 替代了 VerifyEmail2faPhoneModal + VerifyRequiredModal） */}
      <VerifyModalGather
        ref={verifyRef}
        scene="openapi"
        actionType={pendingAction.type}
        onVerifyComplete={handleVerifyConfirm}
        zIndex={2000}
      />

      {/* 条款确认弹框 */}
      <TermsConfirmModal
        visible={termsConfirmVisible}
        onConfirm={handleTermsConfirm}
        onCancel={handleTermsCancel}
      />
    </>
  );
}

/**
 * https://nextjs.org/docs/basic-features/data-fetching/get-static-props
 *
 * 只在服务端执行，加载的语言内容最终会被打包生成到html中
 *
 * @param ctx
 * @returns
 */
export const getStaticProps = async (ctx) => {
  const { locale, locales, defaultLocale } = ctx;
  const lc = locale || defaultLocale;
  const messages = await getTmsMessages({
    project: ['setting', 'error_code', 'footer', 'verify-modal'],
    entry: import.meta.url,
    locale: lc,
    additions: ['title', 'description']
  });

  return {
    props: {
      locale: lc,
      locales,
      messages,
      title: messages.title,
      description: messages.description,
      ogImage: '/static/image/brand/ogImage.png'
    }
  };
};

export default withSettingPage(Home);
