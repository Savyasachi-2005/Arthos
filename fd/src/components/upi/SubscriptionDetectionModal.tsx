/**
 * Modal to show detected subscriptions and allow user to add them
 */
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { X, CheckCircle, AlertCircle, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { DetectedSubscription, SubscriptionPayload } from '../../types';
import { createSubscriptionsBatch } from '../../api/subscriptions';
import { Button } from '../ui/Button';

interface SubscriptionDetectionModalProps {
  detectedSubscriptions: DetectedSubscription[];
  onClose: () => void;
  onSuccess: () => void;
  autoAdd?: boolean; // Auto-add high-confidence subscriptions
}

export const SubscriptionDetectionModal: React.FC<SubscriptionDetectionModalProps> = ({
  detectedSubscriptions,
  onClose,
  onSuccess,
  autoAdd = false,
}) => {
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<Set<string>>(
    new Set(detectedSubscriptions.map((_, idx) => idx.toString()))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAutoAdded, setHasAutoAdded] = useState(false);

  // Auto-add high-confidence subscriptions on mount
  React.useEffect(() => {
    const handleAutoAddEffect = async () => {
      if (autoAdd && !hasAutoAdded) {
        const highConfidenceSubscriptions = detectedSubscriptions.filter(
          (sub) => sub.confidence >= 0.7  // Lower threshold for auto-add
        );
        
        if (highConfidenceSubscriptions.length > 0) {
          setHasAutoAdded(true);
          
          const loadingToast = toast.loading(
            `🔄 Auto-adding ${highConfidenceSubscriptions.length} subscription${highConfidenceSubscriptions.length !== 1 ? 's' : ''}...`
          );

          try {
            const subscriptionsToAdd: SubscriptionPayload[] = highConfidenceSubscriptions.map((sub) => ({
              name: sub.name,
              amount: sub.amount,
              billing_cycle: sub.billing_cycle,
              renewal_date: sub.renewal_date,
            }));

            await createSubscriptionsBatch(subscriptionsToAdd);

            toast.dismiss(loadingToast);
            
            // Show detailed success message with subscription names
            const subNames = highConfidenceSubscriptions.slice(0, 3).map(s => s.name).join(', ');
            const extraCount = highConfidenceSubscriptions.length > 3 ? ` and ${highConfidenceSubscriptions.length - 3} more` : '';
            
            toast.success(
              `✅ Successfully added: ${subNames}${extraCount}!`,
              {
                duration: 6000,
                style: {
                  background: '#10b981',
                  color: '#fff',
                  fontWeight: 'bold',
                },
              }
            );
            
            // Show another toast to guide user
            setTimeout(() => {
              toast(
                `📊 Visit Subscriptions page to manage your ${highConfidenceSubscriptions.length} subscription${highConfidenceSubscriptions.length !== 1 ? 's' : ''}`,
                {
                  duration: 5000,
                  icon: '💡',
                }
              );
            }, 1000);

            onSuccess();
            
            // Close modal if all subscriptions were auto-added
            if (highConfidenceSubscriptions.length === detectedSubscriptions.length) {
              setTimeout(() => onClose(), 2000);
            }
          } catch (error: any) {
            toast.dismiss(loadingToast);
            toast.error(
              `❌ Failed to add subscriptions: ${error.response?.data?.detail || 'Please try again'}`,
              {
                duration: 6000,
              }
            );
          }
        }
      }
    };
    
    handleAutoAddEffect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoAdd]);

  const toggleSubscription = (index: string) => {
    const newSelected = new Set(selectedSubscriptions);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedSubscriptions(newSelected);
  };

  const handleAddSubscriptions = async () => {
    if (selectedSubscriptions.size === 0) {
      toast.error('Please select at least one subscription to add');
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading('Adding subscriptions...');

    try {
      const subscriptionsToAdd: SubscriptionPayload[] = detectedSubscriptions
        .filter((_, idx) => selectedSubscriptions.has(idx.toString()))
        .map((sub) => ({
          name: sub.name,
          amount: sub.amount,
          billing_cycle: sub.billing_cycle,
          renewal_date: sub.renewal_date,
        }));

      await createSubscriptionsBatch(subscriptionsToAdd);

      toast.dismiss(loadingToast);
      toast.success(
        `Successfully added ${subscriptionsToAdd.length} subscription${
          subscriptionsToAdd.length > 1 ? 's' : ''
        }!`,
        {
          icon: '🎉',
          duration: 4000,
        }
      );

      onSuccess();
      onClose();
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.detail || 'Failed to add subscriptions');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600 bg-green-100';
    if (confidence >= 0.7) return 'text-blue-600 bg-blue-100';
    return 'text-yellow-600 bg-yellow-100';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.9) return 'High Confidence';
    if (confidence >= 0.7) return 'Medium Confidence';
    return 'Low Confidence';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 rounded-xl p-2">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Subscriptions Detected!</h2>
                <p className="text-purple-100 text-sm mt-1">
                  We found {detectedSubscriptions.length} potential subscription{detectedSubscriptions.length > 1 ? 's' : ''} in your transactions
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {detectedSubscriptions.map((subscription, index) => (
            <div
              key={index}
              className={`border-2 rounded-xl p-5 cursor-pointer transition-all ${
                selectedSubscriptions.has(index.toString())
                  ? 'border-purple-500 bg-purple-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }`}
              onClick={() => toggleSubscription(index.toString())}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {/* Checkbox */}
                  <div className="flex-shrink-0 mt-1">
                    <div
                      className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                        selectedSubscriptions.has(index.toString())
                          ? 'bg-purple-600 border-purple-600'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {selectedSubscriptions.has(index.toString()) && (
                        <CheckCircle className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </div>

                  {/* Subscription Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{subscription.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-semibold">Category:</span> {subscription.category}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">₹{subscription.amount.toFixed(2)}</div>
                        <div className="text-sm text-gray-600 capitalize mt-1">{subscription.billing_cycle}</div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getConfidenceColor(
                          subscription.confidence
                        )}`}
                      >
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {getConfidenceLabel(subscription.confidence)} ({Math.round(subscription.confidence * 100)}%)
                      </span>
                      <span className="text-xs text-gray-500">
                        Next renewal: {new Date(subscription.renewal_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedSubscriptions.size} of {detectedSubscriptions.length} subscription{selectedSubscriptions.size !== 1 ? 's' : ''} selected
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={onClose}
                variant="outline"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddSubscriptions}
                disabled={selectedSubscriptions.size === 0 || isSubmitting}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    Add {selectedSubscriptions.size} Subscription{selectedSubscriptions.size !== 1 ? 's' : ''}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
