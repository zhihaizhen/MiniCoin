import React, { useState, useEffect } from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import { message, Upload, Progress } from 'antd';
import styles from './index.module.less';
import { Env } from '@region-lib/env';
import { ReactComponent as UploadArrowIcon } from '~/public/images/kyc/upload-arrow.svg';

const { API_HOST } = Env;
const { Dragger } = Upload;

interface ImageUploadProps {
    /** 唯一标识符，用于父组件区分不同的上传实例 */
    id: string;
    /** 初始状态下显示的标签文字，例如 "上传护照封面" */
    labelText: string;
    /** 占位符图片的 URL */
    placeholderImage: string;
    /** 当用户选择图片后的回调函数 */
    onImageSelect: (id: string, file: File | null, previewUrl: string | null) => void;
    /** 已上传到服务器的图片 URL (用于显示) */
    uploadedImageUrl?: string | null;
    /** 本地选择的图片预览 URL (如果父组件管理预览状态) */
    previewImageUrl?: string | null;
    /** 上传或校验错误信息 */
    error?: string | null;
    /** 是否成功上传并通过校验 (用于显示成功状态，如蓝色边框) */
    isSuccess?: boolean;
    /** 外部传入的 className，用于父组件控制布局 */
    className?: string;
    /** 上传接口URL */
    action: string;
    /** 上传文件时 FormData 中的 name */
    name?: string;
    /** 上传成功后的回调函数 */
    onUploadSuccess?: (response: any) => void;
    /** 上传失败后的回调函数 */
    onUploadError?: (error: any) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
    id,
    labelText,
    placeholderImage,
    onImageSelect,
    uploadedImageUrl,
    previewImageUrl,
    error,
    isSuccess,
    className,
    action,
    name = 'kyc-file',
    onUploadSuccess,
    onUploadError,
}) => {
    const t = useFm()
    // 内部预览状态，仅当外部没有提供 previewImageUrl 时使用
    const [internalPreview, setInternalPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [uploadProgress, setUploadProgress] = useState<number>(0);

    // 决定显示哪个图片：优先外部已上传的，其次外部预览，再次内部预览
    const imageToDisplay = uploadedImageUrl || previewImageUrl || internalPreview;

    useEffect(() => {
        if (!previewImageUrl && !uploadedImageUrl) {
            setInternalPreview(null);
        }
    }, [previewImageUrl, uploadedImageUrl]);

    const uploadProps = {
        name,
        multiple: false,
        accept: '.png,.jpg,.jpeg',
        action: `${API_HOST}/user/private/v3/upload-kyc-file`,
        showUploadList: false,
        beforeUpload: (file: File) => {
            // 验证文件类型
            const isImageType = file.type === 'image/jpeg' || file.type === 'image/png';
            if (!isImageType) {
                message.error(t('upload.invalid_format'));
                return Upload.LIST_IGNORE;
            }

            // 验证文件大小
            const isLt10M = file.size / 1024 / 1024 < 10;
            if (!isLt10M) {
                message.error(t('upload.size_limit'));
                return Upload.LIST_IGNORE;
            }

            // 立即使用本地文件生成预览URL并通知父组件
            const localPreviewUrl = URL.createObjectURL(file);
            setInternalPreview(localPreviewUrl);
            onImageSelect(id, file, localPreviewUrl);

            // 返回文件，继续上传过程
            return file;
        },
        onChange: ({ file }) => {
            const { status, response, percent } = file;

            if (status === 'uploading') {
                setIsLoading(true);
                setUploadProgress(percent || 0);
                return;
            }

            if (status === 'done') {
                setIsLoading(false);
                setUploadProgress(100);
                if (response?.code === 0) {
                    // 获取服务器返回的图片URL
                    const imageUrl = response?.data?.data;
                    // 更新内部预览状态 - 保留本地预览，服务器URL将在父组件中使用
                    // setInternalPreview(imageUrl);
                    // 通知父组件上传成功
                    onUploadSuccess && onUploadSuccess(response);
                    // 不再重新传递图片URL，避免覆盖本地预览
                    // onImageSelect(id, null, imageUrl);
                } else {
                    const errorMsg = response?.message || t('upload_failed');
                    message.error(errorMsg);
                    onUploadError && onUploadError(response);
                }
                return;
            }

            if (status === 'error') {
                setIsLoading(false);
                setUploadProgress(0);
                message.error(t('upload_failed'));
                onUploadError && onUploadError(file);
                return;
            }
        },
    };

    const containerClasses = [
        styles.uploadContainer,
        className || '',
        imageToDisplay ? styles.hasImage : '',
        error ? styles.error : '',
        isSuccess && !error && imageToDisplay ? styles.success : '',
    ].filter(Boolean).join(' ');

    return (
        <div className={containerClasses}>
            <Dragger {...uploadProps} className={styles.draggerWrapper}>
                <div className={styles.contentContainer}>
                    <div className={styles.imageContainer}>
                        {imageToDisplay ? (
                            <img src={imageToDisplay} alt={labelText} className={styles.uploadedImage} />
                        ) : (
                            <img src={placeholderImage} alt={labelText} className={styles.placeholderIcon} />
                        )}
                    </div>

                    <div className={styles.uploadTextContainer}>
                        {t('kyc.upload.clickToUpload')}
                        <UploadArrowIcon className={styles.uploadArrow} />
                    </div>

                    {isLoading && (
                        <div className={styles.loadingOverlay}>
                            <div style={{ fontSize: '21px', marginBottom: '16px', color: '#18191C', fontWeight: 400 }}>{t('uploading')}</div>
                            <Progress strokeColor='var(--text-brand-default)' size={{
                                width: 135,
                                height: 3
                            }} percent={uploadProgress} showInfo={false} />

                        </div>
                    )}
                </div>
            </Dragger>
            {error && <div className={styles.errorMessage}>{error}</div>}
        </div>
    );
};

export default ImageUpload; 