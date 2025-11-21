/**
 * Bank Analyzer Page
 * Modern, user-friendly bank statement analysis with Gemini AI
 */
import { useState } from 'react';
import { Building2, Sparkles, FileText, Download, Brain, CheckCircle, ArrowRight } from 'lucide-react';
import { StatementUpload } from '../components/bank/StatementUpload';
import { StatementPreview } from '../components/bank/StatementPreview';
import { AnalysisSummaryCard } from '../components/bank/AnalysisSummaryCard';
import { CategoryChart } from '../components/bank/CategoryChart';
import { MerchantBarChart } from '../components/bank/MerchantBarChart';
import { SpendSummaryCard } from '../components/bank/SpendSummaryCard';
import { Button } from '../components/ui/Button';
import { useBankUpload } from '../hooks/useBankUpload';
import { useBankAnalysis } from '../hooks/useBankAnalysis';
import { downloadReport } from '../api/bank';

export function BankAnalyzer() {
  const [showPreview, setShowPreview] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const {
    uploadData,
    isUploading,
    uploadError,
    upload,
    reset: resetUpload,
  } = useBankUpload();

  const {
    analysisData,
    isAnalyzing,
    analysisError,
    analyze,
    reset: resetAnalysis,
  } = useBankAnalysis();

  const handleUpload = async (fileOrText: File | string) => {
    resetAnalysis();
    setShowPreview(false);
    await upload(fileOrText);
    setShowPreview(true);
  };

  const handleAnalyze = async () => {
    if (uploadData) {
      await analyze(uploadData.raw_text);
    }
  };

  const handleReset = () => {
    resetUpload();
    resetAnalysis();
    setShowPreview(false);
  };

  const handleDownloadReport = async () => {
    if (!uploadData || !analysisData) return;
    
    setIsDownloading(true);
    try {
      const blob = await downloadReport(uploadData.raw_text, analysisData);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bank_analysis_report_${new Date().getTime()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download report:', error);
      alert('Failed to download report. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Modern Header with Animation */}
        <div className="text-center space-y-4 animate-fadeIn">
          <div className="inline-block">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 rounded-full p-4 shadow-xl">
                <Building2 className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Bank Statement Analyzer
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload your bank statement and get AI-powered financial insights in seconds
          </p>
          
          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <div className="flex items-center space-x-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">AI-Powered</span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200">
              <FileText className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">OCR Support</span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200">
              <Download className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-gray-700">PDF Reports</span>
            </div>
          </div>
        </div>

        {/* Upload Section with Enhanced Styling */}
        {!uploadData && (
          <div className="max-w-3xl mx-auto animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8">
              <StatementUpload
                onUpload={handleUpload}
                isUploading={isUploading}
                error={uploadError}
              />
            </div>
            
            {/* Trust Indicators */}
            <div className="mt-6 flex items-center justify-center space-x-8 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Secure & Private</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>AI-Powered Analysis</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Instant Results</span>
              </div>
            </div>
          </div>
        )}

        {/* Preview Section with Modern Buttons */}
        {uploadData && showPreview && !analysisData && (
          <div className="space-y-6 animate-fadeIn">
            <StatementPreview data={uploadData} />
            
            <div className="flex justify-center gap-4">
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="group px-10 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                {isAnalyzing ? (
                  <span className="flex items-center">
                    <svg className="animate-spin h-6 w-6 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Analyzing with Gemini AI...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Brain className="w-6 h-6 mr-2 group-hover:animate-pulse" />
                    Analyze with Gemini AI
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
              
              <Button
                onClick={handleReset}
                variant="secondary"
                className="px-10 py-4 text-lg font-semibold hover:shadow-lg transition-all duration-300"
              >
                Upload New Statement
              </Button>
            </div>

            {analysisError && (
              <div className="max-w-2xl mx-auto p-5 bg-red-50 border-2 border-red-200 rounded-2xl animate-shake">
                <div className="flex items-start space-x-3">
                  <div className="bg-red-200 rounded-full p-2">
                    <svg className="w-5 h-5 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-red-900">Analysis Error</p>
                    <p className="text-sm text-red-700 mt-1">{analysisError}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Analysis Results Section with Modern Design */}
        {analysisData && (
          <div className="space-y-8 animate-fadeIn">
            {/* Action Buttons with Modern Styling */}
            <div className="flex justify-end gap-3">
              <Button 
                onClick={handleDownloadReport}
                disabled={isDownloading}
                className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                {isDownloading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 group-hover:animate-bounce" />
                    Download PDF Report
                  </>
                )}
              </Button>
              
              <Button 
                onClick={handleReset} 
                variant="secondary"
                className="flex items-center gap-2 px-6 py-3 hover:shadow-lg transition-all duration-300"
              >
                <FileText className="w-5 h-5" />
                Analyze Another Statement
              </Button>
            </div>

            {/* Summary Cards */}
            <AnalysisSummaryCard summary={analysisData.summary} />

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CategoryChart categoryBreakdown={analysisData.summary.category_breakdown} />
              <SpendSummaryCard summary={analysisData.summary} />
            </div>

            {/* Merchant Chart */}
            <MerchantBarChart transactions={analysisData.transactions} />

            {/* Anomalies Section with Modern Cards */}
            {analysisData.anomalies.length > 0 && (
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-lg border-2 border-yellow-200 p-6 animate-fadeIn">
                <div className="flex items-center space-x-3 mb-5">
                  <div className="bg-yellow-200 rounded-xl p-2">
                    <svg className="w-6 h-6 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Anomalies Detected
                  </h3>
                  <span className="ml-auto bg-yellow-200 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {analysisData.anomalies.length} found
                  </span>
                </div>
                <div className="space-y-3">
                  {analysisData.anomalies.map((anomaly, index) => (
                    <div
                      key={index}
                      className="flex items-start p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-yellow-100"
                    >
                      <span className="bg-yellow-100 rounded-lg p-2 mr-3 flex-shrink-0">
                        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </span>
                      <span className="text-sm text-gray-700 leading-relaxed">{anomaly}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Duplicate Charges with Enhanced Design */}
            {analysisData.duplicate_charges.length > 0 && (
              <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl shadow-lg border-2 border-red-200 p-6 animate-fadeIn">
                <div className="flex items-center space-x-3 mb-5">
                  <div className="bg-red-200 rounded-xl p-2">
                    <svg className="w-6 h-6 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Duplicate Charges
                  </h3>
                  <span className="ml-auto bg-red-200 text-red-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {analysisData.duplicate_charges.length} found
                  </span>
                </div>
                <div className="space-y-3">
                  {analysisData.duplicate_charges.map((charge, index) => (
                    <div
                      key={index}
                      className="flex items-start p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-red-100"
                    >
                      <span className="bg-red-100 rounded-lg p-2 mr-3 flex-shrink-0">
                        <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <span className="text-sm text-gray-700 leading-relaxed">{charge}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Subscriptions Detected with Modern Grid */}
            {analysisData.subscriptions_detected.length > 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg border-2 border-blue-200 p-6 animate-fadeIn">
                <div className="flex items-center space-x-3 mb-5">
                  <div className="bg-blue-200 rounded-xl p-2">
                    <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Subscriptions Detected
                  </h3>
                  <span className="ml-auto bg-blue-200 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {analysisData.subscriptions_detected.length} active
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {analysisData.subscriptions_detected.map((sub, index) => (
                    <div
                      key={index}
                      className="group p-4 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all transform hover:-translate-y-1 border border-blue-100 text-center"
                    >
                      <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{sub.charAt(0)}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 block truncate">{sub}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations with Enhanced Cards */}
            {analysisData.recommendations.length > 0 && (
              <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 rounded-2xl shadow-xl border-2 border-purple-200 p-6 animate-fadeIn">
                <div className="flex items-center space-x-3 mb-5">
                  <div className="bg-purple-200 rounded-xl p-2">
                    <Sparkles className="w-6 h-6 text-purple-700" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    AI Recommendations
                  </h3>
                  <span className="ml-auto bg-purple-200 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full">
                    Powered by Gemini
                  </span>
                </div>
                <div className="space-y-4">
                  {analysisData.recommendations.map((recommendation, index) => (
                    <div
                      key={index}
                      className="group flex items-start p-5 bg-white rounded-xl shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 border border-purple-100"
                    >
                      <div className={`flex-shrink-0 rounded-xl p-3 mr-4 ${
                        index === 0 ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
                        index === 1 ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                        'bg-gradient-to-br from-purple-500 to-pink-600'
                      }`}>
                        {index === 0 ? (
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                          </svg>
                        ) : index === 1 ? (
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <span className="text-sm text-gray-700 leading-relaxed block">
                          {recommendation}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transaction Details Table with Modern Design */}
            {analysisData.transactions.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 animate-fadeIn">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-200 rounded-xl p-2">
                      <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Transaction Details
                    </h3>
                  </div>
                  <span className="bg-gray-200 text-gray-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {analysisData.transactions.length} total
                  </span>
                </div>
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="text-left py-4 px-4 text-sm font-bold text-gray-700">Date</th>
                        <th className="text-left py-4 px-4 text-sm font-bold text-gray-700">Merchant</th>
                        <th className="text-left py-4 px-4 text-sm font-bold text-gray-700">Category</th>
                        <th className="text-right py-4 px-4 text-sm font-bold text-gray-700">Amount</th>
                        <th className="text-center py-4 px-4 text-sm font-bold text-gray-700">Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysisData.transactions.slice(0, 50).map((txn, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors">
                          <td className="py-4 px-4 text-sm text-gray-600">
                            {txn.date || 'N/A'}
                          </td>
                          <td className="py-4 px-4 text-sm font-semibold text-gray-900">
                            {txn.merchant}
                          </td>
                          <td className="py-4 px-4 text-sm">
                            <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-full text-xs font-semibold">
                              {txn.category}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-sm font-bold text-right">
                            <span className={txn.type === 'debit' ? 'text-red-600' : 'text-green-600'}>
                              {txn.type === 'debit' ? '-' : '+'}₹{txn.amount.toFixed(2)}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              txn.type === 'debit' 
                                ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800' 
                                : 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800'
                            }`}>
                              {txn.type}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {analysisData.transactions.length > 50 && (
                    <div className="mt-4 py-3 text-center text-sm text-gray-500 bg-gray-50">
                      Showing 50 of {analysisData.transactions.length} transactions
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
