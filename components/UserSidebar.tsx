import React, { useState, useEffect } from 'react';
import { 
  MediaFile, 
  MediaResponse, 
  fetchMediaFiles, 
  downloadFile, 
  openFileInNewTab, 
  deleteMediaFile, 
  formatFileSize, 
  formatDate 
} from '../services/mediaService';

interface UserSidebarProps {
  className?: string;
}

export const UserSidebar: React.FC<UserSidebarProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaResponse>({
    reports: [],
    podcasts: [],
    videos: []
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'navigation' | 'media'>('navigation');

  const handleMouseEnter = () => {
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    setIsOpen(false);
  };

  // Load media files when sidebar opens
  useEffect(() => {
    if (isOpen && activeTab === 'media') {
      loadMediaFiles();
    }
  }, [isOpen, activeTab]);

  const loadMediaFiles = async () => {
    setLoading(true);
    try {
      const files = await fetchMediaFiles();
      setMediaFiles(files);
    } catch (error) {
      console.error('Failed to load media files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (file: MediaFile) => {
    try {
      await downloadFile(file.downloadUrl, file.name);
    } catch (error) {
      console.error('Failed to download file:', error);
    }
  };

  const handleOpenInTab = (file: MediaFile) => {
    openFileInNewTab(file.url);
  };

  const handleDelete = async (fileId: string) => {
    try {
      await deleteMediaFile(fileId);
      await loadMediaFiles(); // Refresh the list
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  };

  return (
    <div 
      className={`fixed top-0 left-0 z-[100] ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Logo Button */}
      <div className="relative">
        <div className={`
          w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 
          flex items-center justify-center cursor-pointer shadow-lg
          transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-xl
          m-4 relative z-10
          ${isOpen ? 'w-180 shadow-2xl scale-110' : ''}
        `}>
          {/* Logo Icon */}
          <svg 
            className="w-4 h-4 text-white transition-transform duration-300"
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
          
          {/* Pulse animation when closed */}
          {!isOpen && (
            <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20"></div>
          )}
        </div>
      </div>

      {/* Sidebar Panel */}
      <div className={`
        fixed top-0 left-0 h-screen bg-gradient-to-b from-gray-900/95 to-black/95 
        backdrop-blur-lg shadow-2xl
        transition-all duration-500 ease-in-out
        ${isOpen ? 'w-180 translate-x-0' : 'w-0 -translate-x-full'}
        overflow-hidden
      `}>
        <div className="pt-20 px-6 h-full flex flex-col">
          {/* User Profile Section */}
          <div className="mb-6 opacity-0 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">U</span>
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">User Name</h3>
                <p className="text-gray-300 text-sm">Premium Member</p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mb-6 opacity-0 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            <div className="w-180 flex bg-gray-800/50 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('navigation')}
                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === 'navigation'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Navigation
              </button>
              <button
                onClick={() => setActiveTab('media')}
                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === 'media'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Media
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'navigation' ? (
              /* Navigation Menu */
              <nav className="space-y-2">
                <MenuItem 
                  icon={
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                    </svg>
                  }
                  text="Dashboard"
                  delay="0.4s"
                />

                <MenuItem 
                  icon={
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
                    </svg>
                  }
                  text="Analytics"
                  delay="0.5s"
                />

                <MenuItem 
                  icon={
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8s0-6-6-6zm4 18H6V4h7v5h5v11z"/>
                    </svg>
                  }
                  text="Reports"
                  delay="0.6s"
                />

                <MenuItem 
                  icon={
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
                    </svg>
                  }
                  text="Settings"
                  delay="0.7s"
                />

                <MenuItem 
                  icon={
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
                    </svg>
                  }
                  text="Help & Support"
                  delay="0.8s"
                />
              </nav>
            ) : (
              /* Media Files Section */
              <div className="h-full overflow-y-auto opacity-0 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* PDF Reports */}
                    <MediaSection
                      title="PDF Reports"
                      files={mediaFiles.reports}
                      onDownload={handleDownload}
                      onOpenInTab={handleOpenInTab}
                      onDelete={handleDelete}
                      emptyMessage="No reports generated yet"
                    />

                    {/* MP3 Podcasts */}
                    <MediaSection
                      title="Audio Podcasts"
                      files={mediaFiles.podcasts}
                      onDownload={handleDownload}
                      onOpenInTab={handleOpenInTab}
                      onDelete={handleDelete}
                      emptyMessage="No podcasts generated yet"
                    />

                    {/* Videos (Future) */}
                    <MediaSection
                      title="Videos"
                      files={mediaFiles.videos}
                      onDownload={handleDownload}
                      onOpenInTab={handleOpenInTab}
                      onDelete={handleDelete}
                      emptyMessage="Video generation coming soon..."
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {activeTab === 'navigation' && (
            <div className="absolute bottom-6 left-6 right-6 opacity-0 animate-fadeIn" style={{ animationDelay: '0.9s' }}>
              <div className="border-t border-gray-700 pt-4">
                <button className="w-full flex items-center space-x-3 text-gray-300 hover:text-red-400 transition-colors duration-200 group">
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5z"/>
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Menu Item Component
interface MenuItemProps {
  icon: React.ReactNode;
  text: string;
  delay: string;
  onClick?: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, text, delay, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 group opacity-0 animate-fadeIn"
      style={{ animationDelay: delay }}
    >
      <span className="group-hover:scale-110 transition-transform duration-200">
        {icon}
      </span>
      <span className="font-medium">{text}</span>
    </button>
  );
};

// Media Section Component
interface MediaSectionProps {
  title: string;
  files: MediaFile[];
  onDownload: (file: MediaFile) => void;
  onOpenInTab: (file: MediaFile) => void;
  onDelete: (fileId: string) => void;
  emptyMessage: string;
}

const MediaSection: React.FC<MediaSectionProps> = ({
  title,
  files,
  onDownload,
  onOpenInTab,
  onDelete,
  emptyMessage,
}) => {
  return (
    <div className="mb-6">
      <h4 className="text-white font-semibold text-sm mb-3 flex items-center">
        {title}
        <span className="ml-2 bg-blue-600 text-xs px-2 py-1 rounded-full">
          {files.length}
        </span>
      </h4>
      
      {files.length === 0 ? (
        <div className="text-gray-400 text-sm py-4 text-center">
          {emptyMessage}
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <MediaFileItem
              key={file.id}
              file={file}
              onDownload={() => onDownload(file)}
              onOpenInTab={() => onOpenInTab(file)}
              onDelete={() => onDelete(file.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Media File Item Component
interface MediaFileItemProps {
  file: MediaFile;
  onDownload: () => void;
  onOpenInTab: () => void;
  onDelete: () => void;
}

const MediaFileItem: React.FC<MediaFileItemProps> = ({
  file,
  onDownload,
  onOpenInTab,
  onDelete,
}) => {
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return (
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
          </svg>
        );
      case 'mp3':
        return (
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z"/>
          </svg>
        );
      case 'mp4':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17,10.5V7A1,1 0 0,0 16,6H4A1,1 0 0,0 3,7V17A1,1 0 0,0 4,18H16A1,1 0 0,0 17,17V13.5L21,17.5V6.5L17,10.5Z"/>
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
          </svg>
        );
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-3 hover:bg-gray-700/50 transition-all duration-200 group">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          <div className="flex-shrink-0 mt-0.5">
            {getFileIcon(file.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {file.name}
            </p>
            <div className="flex items-center space-x-2 text-xs text-gray-400 mt-1">
              <span>{formatFileSize(file.size)}</span>
              <span>•</span>
              <span>{formatDate(file.createdAt)}</span>
            </div>
            {file.country && (
              <div className="flex items-center space-x-2 text-xs text-blue-400 mt-1">
                <span>{file.country}</span>
                {file.year && (
                  <>
                    <span>•</span>
                    <span>{file.year}</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {/* Open in Tab */}
          <button
            onClick={onOpenInTab}
            className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded transition-all duration-200"
            title="Open in new tab"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>
          
          {/* Download */}
          <button
            onClick={onDownload}
            className="p-1.5 text-gray-400 hover:text-green-400 hover:bg-green-400/10 rounded transition-all duration-200"
            title="Download file"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
          
          {/* Delete */}
          <button
            onClick={onDelete}
            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-all duration-200"
            title="Delete file"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSidebar;
