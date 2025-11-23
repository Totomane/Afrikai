// src/pages/SharePage.tsx
import React, { useState, useEffect } from 'react';
import { SocialShareForm } from '../components/ui/SocialShareForm';
import { MediaFile } from '../services/mediaService';
import { shareToSocialMedia, SocialShareData } from '../services/socialShareService';
import { useAuth } from '../components/context/authContext';

interface SharePageProps {}

export const SharePage: React.FC<SharePageProps> = () => {
  const { csrfToken } = useAuth();
  const [shareData, setShareData] = useState<{
    file: MediaFile | null;
    platform: string;
  }>({ file: null, platform: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // Parse URL parameters to get sharing data
    const urlParams = new URLSearchParams(window.location.search);
    const dataParam = urlParams.get('data');
    
    if (dataParam) {
      try {
        const parsedData = JSON.parse(dataParam);
        console.log('[SHARE PAGE] Received share data:', parsedData);
        
        const file: MediaFile = {
          id: parsedData.fileId,
          name: parsedData.fileName,
          type: parsedData.fileType,
          url: parsedData.fileUrl,
          downloadUrl: parsedData.fileUrl,
          size: 0, // Not needed for sharing
          createdAt: new Date().toISOString()
        };
        
        setShareData({
          file,
          platform: parsedData.platform
        });
      } catch (error) {
        console.error('[SHARE PAGE] Error parsing share data:', error);
        setMessage({ type: 'error', text: 'Invalid sharing data received' });
      }
    } else {
      setMessage({ type: 'error', text: 'No sharing data provided' });
    }
  }, []);

  const handleSubmit = async (platform: string, formData: SocialShareData) => {
    if (!shareData.file || !csrfToken) {
      setMessage({ type: 'error', text: 'Missing required data for sharing' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      console.log('[SHARE PAGE] Submitting to platform:', platform);
      const result = await shareToSocialMedia(platform, shareData.file, formData, csrfToken);
      
      if (result.success) {
        setMessage({ type: 'success', text: `Successfully shared to ${platform}!` });
        // Close the window after a short delay
        setTimeout(() => {
          window.close();
        }, 2000);
      } else {
        setMessage({ type: 'error', text: result.message || `Failed to share to ${platform}` });
      }
    } catch (error) {
      console.error('[SHARE PAGE] Share error:', error);
      setMessage({ type: 'error', text: 'An unexpected error occurred while sharing' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    window.close();
  };

  if (!shareData.file) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="mb-4">
              <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.96-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Share Data...</h2>
            {message && (
              <div className={`mt-4 p-4 rounded-lg ${
                message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
              }`}>
                {message.text}
              </div>
            )}
            <button
              onClick={handleClose}
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close Window
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"/>
              </svg>
              <h1 className="text-2xl font-bold text-gray-900">Share Content</h1>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'error' ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'
          }`}>
            <div className="flex items-center">
              <svg className={`w-5 h-5 mr-2 ${
                message.type === 'error' ? 'text-red-500' : 'text-green-500'
              }`} fill="currentColor" viewBox="0 0 20 20">
                {message.type === 'error' ? (
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                ) : (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                )}
              </svg>
              {message.text}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <SocialShareForm
            file={shareData.file}
            platform={shareData.platform}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
};