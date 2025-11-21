/**
 * UPI Input component for pasting SMS messages
 */
import React, { useState } from 'react';
import { TextArea } from '../ui/TextArea';
import { Button } from '../ui/Button';
import { validateRawText } from '../../utils/validators';
import { Send, AlertCircle } from 'lucide-react';

interface UpiInputProps {
  onAnalyze: (text: string) => void;
  loading?: boolean;
}

const EXAMPLE_SMS = `Rs. 249.00 paid to Zomato on 20-11-2025. UPI Ref: 12345
Your a/c XX1234 was debited by INR 219.00 for UPI payment to OLA CABS on 2025-11-20.
Payment of ₹1,299 to Amazon was successful on 19/11/2025
INR 499.00 paid to Netflix. Next billing date 01-12-2025`;

export const UpiInput: React.FC<UpiInputProps> = ({ onAnalyze, loading = false }) => {
  const [rawText, setRawText] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    // Validate input
    const validation = validateRawText(rawText);
    
    if (!validation.valid) {
      setError(validation.error || 'Invalid input');
      return;
    }

    setError('');
    onAnalyze(rawText);
  };

  const handlePasteExample = () => {
    setRawText(EXAMPLE_SMS);
    setError('');
  };

  const handleClear = () => {
    setRawText('');
    setError('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Ctrl+Enter
    if (e.ctrlKey && e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">
            Paste UPI Messages
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Paste your SMS or bank notification messages below (one per line)
          </p>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePasteExample}
          disabled={loading}
        >
          Use Example
        </Button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Supported Formats
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>• Rs. / INR / ₹ amount formats</p>
              <p>• "paid to", "debited by", "payment to" patterns</p>
              <p>• Date formats: DD-MM-YYYY, DD/MM/YYYY, DD Mon YYYY</p>
            </div>
          </div>
        </div>
      </div>

      {/* Text Area */}
      <TextArea
        value={rawText}
        onChange={(e) => {
          setRawText(e.target.value);
          if (error) setError('');
        }}
        onKeyDown={handleKeyDown}
        placeholder="Paste your UPI/SMS messages here...

Example:
Rs. 249.00 paid to Zomato on 20-11-2025
INR 219.00 paid to OLA CABS on 20-11-2025
Payment of ₹1,299 to Amazon was successful"
        rows={12}
        error={error}
        helperText={!error ? `Tip: Press Ctrl+Enter to analyze quickly. ${rawText.length} characters` : undefined}
      />

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleSubmit}
          loading={loading}
          disabled={!rawText.trim() || loading}
          className="flex-1"
        >
          <Send className="h-4 w-4 mr-2" />
          Analyze Transactions
        </Button>
        
        <Button
          variant="outline"
          onClick={handleClear}
          disabled={loading || !rawText}
        >
          Clear
        </Button>
      </div>

      {/* Character count */}
      <div className="text-xs text-text-muted text-right">
        {rawText.split('\n').filter(line => line.trim()).length} lines • {rawText.length} / 50,000 characters
      </div>
    </div>
  );
};
