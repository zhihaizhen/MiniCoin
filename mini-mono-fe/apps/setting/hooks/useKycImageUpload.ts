import { useState } from 'react';
import { message } from 'antd';
import { useFm } from '@better-bit-fe/base-hooks';

export interface ImageState {
  file: File | null;
  preview: string | null;
  error: string | null;
  serverPath: string | null;
}

export const useKycImageUpload = (form: any) => {
  const t = useFm();

  const [idFrontState, setIdFrontState] = useState<ImageState>({
    file: null,
    preview: null,
    error: null,
    serverPath: null
  });

  const [idBackState, setIdBackState] = useState<ImageState>({
    file: null,
    preview: null,
    error: null,
    serverPath: null
  });

  const [handheldState, setHandheldState] = useState<ImageState>({
    file: null,
    preview: null,
    error: null,
    serverPath: null
  });

  // 映射图片 ID 到对应的状态设置函数
  const imageStateSetters: Record<
    string,
    React.Dispatch<React.SetStateAction<ImageState>>
  > = {
    identity_front: setIdFrontState,
    identity_back: setIdBackState,
    identity_person: setHandheldState
  };

  // 自定义处理文件选择函数
  const handleCustomImageSelect = (
    id: string,
    file: File | null,
    previewUrl: string | null
  ) => {
    console.log('handleCustomImageSelect', id, file, previewUrl);
    const setter = imageStateSetters[id];

    if (setter) {
      if (file) {
        const localPreviewUrl = URL.createObjectURL(file);
        console.log(`为${id}创建了本地预览URL: ${localPreviewUrl}`);

        setter({
          file: file,
          preview: localPreviewUrl,
          error: null,
          serverPath: null
        });

        form.setFieldsValue({ [id]: undefined });
      } else if (previewUrl) {
        setter({
          file: null,
          preview: previewUrl,
          error: null,
          serverPath: null
        });

        form.setFieldsValue({ [id]: undefined });
      }
    } else {
      console.warn(`未找到 ID '${id}' 对应的状态设置函数`);
    }
  };

  // 处理上传成功
  const genericUploadSuccessHandler = (id: string, response: any) => {
    console.log(`上传成功 - ${id}:`, response);

    const serverPath = response?.data;
    if (!serverPath) {
      console.error('服务器未返回有效的文件路径:', response);
      message.error(t('setting.upFail1'));
      return;
    }

    const setter = imageStateSetters[id];
    if (setter) {
      setter((prev) => ({
        ...prev,
        serverPath: serverPath,
        error: null
      }));

      form.setFieldsValue({ [id]: serverPath });
    }
  };

  // 处理上传错误
  const genericUploadErrorHandler = (id: string, error: any) => {
    console.error(`上传失败 - ${id}:`, error);
    const setter = imageStateSetters[id];
    if (setter) {
      setter((prev) => ({
        ...prev,
        error: t('setting.upFail2'),
        serverPath: null
      }));

      form.setFieldsValue({ [id]: undefined });
    }
  };

  return {
    idFrontState,
    idBackState,
    handheldState,
    setIdFrontState,
    setIdBackState,
    setHandheldState,
    handleCustomImageSelect,
    genericUploadSuccessHandler,
    genericUploadErrorHandler
  };
};
