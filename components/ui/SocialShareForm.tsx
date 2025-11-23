// src/components/ui/SocialShareForm.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MediaFile } from '../../services/mediaService';
import { SocialShareData } from '../../services/socialShareService';

interface SocialShareFormProps {
  file: MediaFile;
  platform: string;
  onSubmit: (platform: string, data: SocialShareData) => void;
  isSubmitting?: boolean;
}

export const SocialShareForm: React.FC<SocialShareFormProps> = ({
  file,
  platform,
  onSubmit,
  isSubmitting = false
}) => {
  const [formData, setFormData] = useState<SocialShareData>({
    title: '',
    description: '',
    tags: '',
    visibility: 'public'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    // Platform-specific validation
    switch (platform) {
      case 'youtube':
        if (formData.title.length > 100) {
          newErrors.title = 'YouTube title must be 100 characters or less';
        }
        if (formData.description.length > 5000) {
          newErrors.description = 'YouTube description must be 5000 characters or less';
        }
        break;
      case 'linkedin':
        if (formData.description.length > 1300) {
          newErrors.description = 'LinkedIn post description must be 1300 characters or less';
        }
        break;
      case 'twitter':
        if (formData.description.length > 280) {
          newErrors.description = 'Twitter post must be 280 characters or less';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(platform, formData);
    }
  };

  const handleInputChange = (field: keyof SocialShareData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getPlatformIcon = () => {
    switch (platform) {
      case 'youtube':
        return (
          <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        );
      case 'linkedin':
        return (
          <svg className="w-8 h-8 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        );
      case 'twitter':
        return (
          <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
          </svg>
        );
      case 'spotify':
        return (
          <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.659.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
        );
      default:
        return (
          <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"/>
          </svg>
        );
    }
  };

  const getPlatformName = () => {
    return platform.charAt(0).toUpperCase() + platform.slice(1);
  };

  const getCharacterLimit = (field: 'title' | 'description') => {
    switch (platform) {
      case 'youtube':
        return field === 'title' ? 100 : 5000;
      case 'linkedin':
        return field === 'title' ? 200 : 1300;
      case 'twitter':
        return field === 'title' ? 200 : 280;
      default:
        return 1000;
    }
  };

  const getRemainingChars = (field: 'title' | 'description') => {
    const limit = getCharacterLimit(field);
    const current = formData[field].length;
    return limit - current;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        {getPlatformIcon()}
        <div>
          <h3 className="text-xl font-bold text-gray-900">Share to {getPlatformName()}</h3>
          <p className="text-gray-600">Sharing: {file.name}</p>
        </div>
      </div>

      {/* File Preview */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {file.type.startsWith('audio/') ? (
              <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            ) : file.type.startsWith('video/') ? (
              <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
              </svg>
            ) : (
              <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {file.name}
            </p>
            <p className="text-sm text-gray-500">
              {file.type}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={`Enter ${platform} title`}
            maxLength={getCharacterLimit('title')}
          />
          <div className="flex justify-between mt-1">
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title}</p>
            )}
            <p className={`text-sm ml-auto ${
              getRemainingChars('title') < 10 ? 'text-red-600' : 'text-gray-500'
            }`}>
              {getRemainingChars('title')} characters remaining
            </p>
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            rows={platform === 'twitter' ? 3 : 6}
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={`Enter ${platform} description`}
            maxLength={getCharacterLimit('description')}
          />
          <div className="flex justify-between mt-1">
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description}</p>
            )}
            <p className={`text-sm ml-auto ${
              getRemainingChars('description') < 50 ? 'text-red-600' : 'text-gray-500'
            }`}>
              {getRemainingChars('description')} characters remaining
            </p>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <input
            type="text"
            id="tags"
            value={formData.tags}
            onChange={(e) => handleInputChange('tags', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={platform === 'twitter' ? '#hashtag1 #hashtag2' : 'tag1, tag2, tag3'}
          />
          <p className="text-sm text-gray-500 mt-1">
            {platform === 'twitter' 
              ? 'Use hashtags with # symbol (e.g., #music #podcast)'
              : 'Separate tags with commas'
            }
          </p>
        </div>

        {/* Visibility (for platforms that support it) */}
        {['youtube', 'linkedin'].includes(platform) && (
          <div>
            <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 mb-2">
              Visibility
            </label>
            <select
              id="visibility"
              value={formData.visibility}
              onChange={(e) => handleInputChange('visibility', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              {platform === 'youtube' && <option value="unlisted">Unlisted</option>}
            </select>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => window.close()}
            className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                <span>Sharing...</span>
              </div>
            ) : (
              `Share to ${getPlatformName()}`
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
};