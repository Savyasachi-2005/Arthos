/**
 * React hook for uploading bank statements
 */
import { useState } from 'react';
import { uploadStatement } from '../api/bank';
import type { StatementUploadResponse } from '../types';

interface UseBankUploadResult {
  uploadData: StatementUploadResponse | null;
  isUploading: boolean;
  uploadError: string | null;
  upload: (fileOrText: File | string) => Promise<void>;
  reset: () => void;
}

export function useBankUpload(): UseBankUploadResult {
  const [uploadData, setUploadData] = useState<StatementUploadResponse | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const upload = async (fileOrText: File | string) => {
    setIsUploading(true);
    setUploadError(null);
    
    try {
      const result = await uploadStatement(fileOrText);
      setUploadData(result);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Upload failed';
      setUploadError(errorMessage);
      setUploadData(null);
    } finally {
      setIsUploading(false);
    }
  };

  const reset = () => {
    setUploadData(null);
    setUploadError(null);
  };

  return {
    uploadData,
    isUploading,
    uploadError,
    upload,
    reset,
  };
}
