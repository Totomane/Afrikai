// src/components/ui/SocialShareModal.tsx
import React, { useState } from 'react';
import { MediaFile } from '../../services/mediaService';
import { useToast } from './Toast';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: MediaFile;
  platform: string;
  onSubmit: (platform: string, data: any) => Promise<void>;
}

interface YouTubeFormData {
  title: string;
  description: string;
  tags: string[];
  privacy_status: 'private' | 'public' | 'unlisted';
  category_id: string;
}

interface LinkedInFormData {
  title: string;
  description: string;
  visibility: 'PUBLIC' | 'CONNECTIONS' | 'LOGGED_IN_MEMBERS';
}

interface TwitterFormData {
  text: string;
  reply_settings: 'everyone' | 'mentionedUsers' | 'following';
}

interface SpotifyFormData {
  name: string;
  description: string;
  public: boolean;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  file,
  platform,
  onSubmit
}) => {
  console.log(`[MODAL] Rendering ${platform} modal for "${file?.name}"`);
  
  const { showSuccess, showError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // YouTube form state
  const [youtubeForm, setYoutubeForm] = useState<YouTubeFormData>({
    title: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
    description: `Generated content from ${file.name}`,
    tags: [],
    privacy_status: 'unlisted',
    category_id: '22' // People & Blogs
  });

  // LinkedIn form state
  const [linkedinForm, setLinkedinForm] = useState<LinkedInFormData>({
    title: file.name.replace(/\.[^/.]+$/, ''),
    description: `Check out this content: ${file.name}`,
    visibility: 'CONNECTIONS'
  });

  // Twitter form state
  const [twitterForm, setTwitterForm] = useState<TwitterFormData>({
    text: `Check out my latest content: ${file.name.replace(/\.[^/.]+$/, '')}`,
    reply_settings: 'everyone'
  });

  // Spotify form state
  const [spotifyForm, setSpotifyForm] = useState<SpotifyFormData>({
    name: file.name.replace(/\.[^/.]+$/, ''),
    description: `Podcast episode: ${file.name}`,
    public: false
  });

  const [tagInput, setTagInput] = useState('');

  const handleAddTag = () => {
    if (tagInput.trim() && !youtubeForm.tags.includes(tagInput.trim())) {
      setYoutubeForm(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setYoutubeForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`[MODAL] Submitting ${platform} form`);
    setIsSubmitting(true);

    try {
      let formData;
      switch (platform.toLowerCase()) {
        case 'youtube':
          formData = youtubeForm;
          break;
        case 'linkedin':
          formData = linkedinForm;
          break;
        case 'x':
        case 'twitter':
          formData = twitterForm;
          break;
        case 'spotify':
          formData = spotifyForm;
          break;
        default:
          throw new Error('Unsupported platform');
      }
      await onSubmit(platform, formData);
      showSuccess('Content Shared!', `Successfully shared to ${platform}`);
      onClose();
    } catch (error) {
      console.error(`[MODAL] ${platform} form error:`, error);
      showError('Share Failed', `Failed to share to ${platform}. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderYouTubeForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Video Title *
        </label>
        <input
          type="text"
          value={youtubeForm.title}
          onChange={(e) => setYoutubeForm(prev => ({ ...prev, title: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="Enter video title"
          required
          maxLength={100}
        />
        <p className="text-xs text-gray-500 mt-1">{youtubeForm.title.length}/100 characters</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={youtubeForm.description}
          onChange={(e) => setYoutubeForm(prev => ({ ...prev, description: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent h-24 resize-none"
          placeholder="Enter video description"
          maxLength={5000}
        />
        <p className="text-xs text-gray-500 mt-1">{youtubeForm.description.length}/5000 characters</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags
        </label>
        <div className="flex space-x-2 mb-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Add a tag"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {youtubeForm.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-2 text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Privacy Status
        </label>
        <select
          value={youtubeForm.privacy_status}
          onChange={(e) => setYoutubeForm(prev => ({ ...prev, privacy_status: e.target.value as any }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
        >
          <option value="private">Private</option>
          <option value="unlisted">Unlisted</option>
          <option value="public">Public</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <select
          value={youtubeForm.category_id}
          onChange={(e) => setYoutubeForm(prev => ({ ...prev, category_id: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
        >
          <option value="1">Film & Animation</option>
          <option value="2">Autos & Vehicles</option>
          <option value="10">Music</option>
          <option value="15">Pets & Animals</option>
          <option value="17">Sports</option>
          <option value="19">Travel & Events</option>
          <option value="20">Gaming</option>
          <option value="22">People & Blogs</option>
          <option value="23">Comedy</option>
          <option value="24">Entertainment</option>
          <option value="25">News & Politics</option>
          <option value="26">Howto & Style</option>
          <option value="27">Education</option>
          <option value="28">Science & Technology</option>
        </select>
      </div>
    </div>
  );

  const renderLinkedInForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Post Title *
        </label>
        <input
          type="text"
          value={linkedinForm.title}
          onChange={(e) => setLinkedinForm(prev => ({ ...prev, title: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter post title"
          required
          maxLength={200}
        />
        <p className="text-xs text-gray-500 mt-1">{linkedinForm.title.length}/200 characters</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={linkedinForm.description}
          onChange={(e) => setLinkedinForm(prev => ({ ...prev, description: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32 resize-none"
          placeholder="Enter post description"
          maxLength={3000}
        />
        <p className="text-xs text-gray-500 mt-1">{linkedinForm.description.length}/3000 characters</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Visibility
        </label>
        <select
          value={linkedinForm.visibility}
          onChange={(e) => setLinkedinForm(prev => ({ ...prev, visibility: e.target.value as any }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="CONNECTIONS">Connections only</option>
          <option value="LOGGED_IN_MEMBERS">All LinkedIn members</option>
          <option value="PUBLIC">Public</option>
        </select>
      </div>
    </div>
  );

  const renderTwitterForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tweet Text *
        </label>
        <textarea
          value={twitterForm.text}
          onChange={(e) => setTwitterForm(prev => ({ ...prev, text: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent h-24 resize-none"
          placeholder="What's happening?"
          required
          maxLength={280}
        />
        <p className="text-xs text-gray-500 mt-1">{twitterForm.text.length}/280 characters</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Who can reply?
        </label>
        <select
          value={twitterForm.reply_settings}
          onChange={(e) => setTwitterForm(prev => ({ ...prev, reply_settings: e.target.value as any }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
        >
          <option value="everyone">Everyone</option>
          <option value="following">People you follow</option>
          <option value="mentionedUsers">Only people you mention</option>
        </select>
      </div>
    </div>
  );

  const renderSpotifyForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Playlist Name *
        </label>
        <input
          type="text"
          value={spotifyForm.name}
          onChange={(e) => setSpotifyForm(prev => ({ ...prev, name: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="Enter playlist name"
          required
          maxLength={100}
        />
        <p className="text-xs text-gray-500 mt-1">{spotifyForm.name.length}/100 characters</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={spotifyForm.description}
          onChange={(e) => setSpotifyForm(prev => ({ ...prev, description: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent h-24 resize-none"
          placeholder="Enter playlist description"
          maxLength={300}
        />
        <p className="text-xs text-gray-500 mt-1">{spotifyForm.description.length}/300 characters</p>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="spotify-public"
          checked={spotifyForm.public}
          onChange={(e) => setSpotifyForm(prev => ({ ...prev, public: e.target.checked }))}
          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
        />
        <label htmlFor="spotify-public" className="ml-2 block text-sm text-gray-700">
          Make playlist public
        </label>
      </div>
    </div>
  );

  if (!isOpen) return null;

  const getPlatformIcon = () => {
    switch (platform.toLowerCase()) {
      case 'youtube':
        return (
          <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        );
      case 'linkedin':
        return (
          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        );
      case 'x':
      case 'twitter':
        return (
          <svg className="w-6 h-6 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        );
      case 'spotify':
        return (
          <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const renderPlatformForm = () => {
    switch (platform.toLowerCase()) {
      case 'youtube':
        return renderYouTubeForm();
      case 'linkedin':
        return renderLinkedInForm();
      case 'x':
      case 'twitter':
        return renderTwitterForm();
      case 'spotify':
        return renderSpotifyForm();
      default:
        return <div>Platform not supported yet</div>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[300] flex items-center justify-center p-4 animate-modalFadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-modalSlideIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center space-x-3">
            {getPlatformIcon()}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Share to {platform}
              </h2>
              <p className="text-sm text-gray-500">Configure your content for sharing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-all duration-200 hover:scale-110"
            title="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* File Info */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">{file.name}</p>
              <p className="text-sm text-gray-500">{file.type.toUpperCase()} • {(file.size / (1024 * 1024)).toFixed(1)} MB</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 max-h-96 overflow-y-auto">
          {renderPlatformForm()}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 hover:scale-105"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 flex items-center space-x-2 shadow-lg"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Sharing...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span>Share to {platform}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};