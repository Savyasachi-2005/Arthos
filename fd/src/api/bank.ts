/**
 * Bank statement analysis API client
 */
import apiClient from './client';
import type {
  StatementUploadResponse,
  AnalyzeStatementRequest,
  AnalyzeStatementResponse,
  BankAnalysisHistoryResponse,
} from '../types';

/**
 * Upload bank statement file (image/PDF) or raw text for extraction
 */
export async function uploadStatement(
  fileOrText: File | string
): Promise<StatementUploadResponse> {
  const formData = new FormData();
  
  if (typeof fileOrText === 'string') {
    // Raw text upload
    formData.append('raw_text', fileOrText);
  } else {
    // File upload
    formData.append('file', fileOrText);
  }
  
  const response = await apiClient.post<StatementUploadResponse>(
    '/bank/upload-statement',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  
  return response.data;
}

/**
 * Analyze bank statement text using Gemini AI
 */
export async function analyzeStatement(
  rawText: string
): Promise<AnalyzeStatementResponse> {
  const payload: AnalyzeStatementRequest = {
    raw_text: rawText,
  };
  
  const response = await apiClient.post<AnalyzeStatementResponse>(
    '/bank/analyze',
    payload
  );
  
  return response.data;
}

/**
 * Get bank analysis history
 */
export async function getBankHistory(
  limit: number = 10,
  offset: number = 0
): Promise<BankAnalysisHistoryResponse> {
  const response = await apiClient.get<BankAnalysisHistoryResponse>(
    '/bank/history',
    {
      params: { limit, offset },
    }
  );
  
  return response.data;
}

/**
 * Upload and analyze in one call (convenience method)
 */
export async function uploadAndAnalyze(
  fileOrText: File | string
): Promise<AnalyzeStatementResponse> {
  // First upload/extract
  const uploadResult = await uploadStatement(fileOrText);
  
  // Then analyze
  const analysisResult = await analyzeStatement(uploadResult.raw_text);
  
  return analysisResult;
}

/**
 * Download PDF report of analysis
 */
export async function downloadReport(
  rawText: string, 
  analysisData: AnalyzeStatementResponse
): Promise<Blob> {
  const payload = {
    raw_text: rawText,
    analysis_data: analysisData,
  };
  
  const response = await apiClient.post(
    '/bank/download-report',
    payload,
    {
      responseType: 'blob',
    }
  );
  
  return response.data;
}
