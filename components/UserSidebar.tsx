// src/components/UserSidebar.tsx
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

import { LoginPage } from '../pages/auth/LoginPage';
import { SignupPage } from '../pages/auth/SignupPage';
import { useAuth } from './context/authContext';
import { useToast } from './ui/Toast';
import { SocialShareModal } from './ui/SocialShareModal';
import { shareToSocialMedia, SocialShareData } from '../services/socialShareService';

interface UserSidebarProps {
  className?: string;
}

export const UserSidebar: React.FC<UserSidebarProps> = ({ className = '' }) => {
  const { user, logout, connectedProviders, connectOAuthProvider, disconnectOAuthProvider, refreshConnectedProviders, csrfToken } = useAuth();
  const { showSuccess, showError } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaResponse>({
    reports: [],
    podcasts: [],
    videos: []
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'navigation' | 'media'>('navigation');
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showSignupPopup, setShowSignupPopup] = useState(false);
  const [socialShareMenu, setSocialShareMenu] = useState<{fileId: string, isOpen: boolean}>({ fileId: '', isOpen: false });
  const [socialShareModal, setSocialShareModal] = useState<{isOpen: boolean, file: MediaFile | null, platform: string}>({ isOpen: false, file: null, platform: '' });
  
  // Debug: Log modal state changes (only when meaningful)
  React.useEffect(() => {
    if (socialShareModal.isOpen && socialShareModal.file) {
      console.log(`[MODAL] Opening ${socialShareModal.platform} modal for ${socialShareModal.file.name}`);
    } else if (!socialShareModal.isOpen && !socialShareModal.file) {
      console.log(`[MODAL] Modal closed`);
    }
  }, [socialShareModal]);

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

  // Refresh connected accounts when user first logs in
  useEffect(() => {
    if (user) {
      refreshConnectedProviders();
    }
  }, [user?.id, refreshConnectedProviders]); // Only run when user ID changes



  // Close social share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (socialShareMenu.isOpen) {
        setSocialShareMenu({ fileId: '', isOpen: false });
      }
    };

    if (socialShareMenu.isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [socialShareMenu.isOpen]);

  const loadMediaFiles = async () => {
    setLoading(true);
    try {
      const files = await fetchMediaFiles();
      setMediaFiles(files);
    } catch (error) {
      console.error('[DEBUG] Failed to load media files:', error);
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

  const handleShareToSocial = (file: MediaFile, platform: string) => {
    console.log(`[SHARE] Opening ${platform} in new tab for file: ${file.name}`);
    console.log(`[SHARE] File details:`, { id: file.id, name: file.name, type: file.type, url: file.url });
    
    // Close the dropdown menu
    setSocialShareMenu({ fileId: '', isOpen: false });
    
    // Create sharing URL with file data as query parameters
    const shareData = {
      fileName: file.name,
      fileType: file.type,
      fileUrl: file.url,
      fileId: file.id,
      platform: platform.toLowerCase()
    };
    
    const queryParams = new URLSearchParams({
      data: JSON.stringify(shareData)
    });
    
    // Open in new tab with share form
    const shareUrl = `/share?${queryParams.toString()}`;
    console.log(`[SHARE] Opening URL in new tab:`, shareUrl);
    console.log(`[SHARE] Share data being passed:`, shareData);
    console.log(`[SHARE] Query parameters:`, queryParams.toString());
    
    try {
      const newWindow = window.open(shareUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
      if (newWindow) {
        console.log(`[SHARE] New tab opened successfully for ${platform}`);
      } else {
        console.error(`[SHARE] Failed to open new tab - popup blocked?`);
      }
    } catch (error) {
      console.error(`[SHARE] Error opening new tab:`, error);
    }
  };

  const handleSocialShareSubmit = async (platform: string, shareData: SocialShareData) => {
    if (!socialShareModal.file || !csrfToken) {
      console.error(`[SHARE] Missing required data for ${platform} share`);
      showError('Share Error', 'Missing required data for sharing');
      return;
    }

    try {
      console.log(`[SHARE] Submitting to ${platform}...`);
      const result = await shareToSocialMedia(platform, socialShareModal.file, shareData, csrfToken);
      
      if (result.success) {
        console.log(`[SHARE] ${platform} share successful`);
        showSuccess('Content Shared!', result.message || `Successfully shared to ${platform}`);
        setSocialShareModal({ isOpen: false, file: null, platform: '' });
      } else {
        console.error(`[SHARE] ${platform} share failed:`, result.message);
        showError('Share Failed', result.message || `Failed to share to ${platform}`);
      }
    } catch (error) {
      console.error(`[SHARE] ${platform} error:`, error);
      showError('Share Error', 'An unexpected error occurred while sharing');
    }
  };

  const toggleSocialShareMenu = (fileId: string) => {
    console.log(`[MENU TOGGLE] Toggling social menu for file: ${fileId}`);
    setSocialShareMenu(prev => {
      const newState = {
        fileId: fileId,
        isOpen: prev.fileId === fileId ? !prev.isOpen : true
      };
      console.log(`[MENU TOGGLE] New menu state:`, newState);
      return newState;
    });
  };

  const handleConnectAccount = async (platform: string) => {
    const provider = platform.toLowerCase();
    
    console.log(`[UI:Connect:${platform}] USER_INITIATED: Starting connection process`);
    
    // Don't allow connecting if already connected
    if (connectedProviders.includes(provider)) {
      console.log(`[UI:Connect:${platform}] ALREADY_CONNECTED: Provider already in list`);
      showError('Already Connected', `Your ${platform} account is already connected.`);
      return;
    }
    
    try {
      console.log(`[UI:Connect:${platform}] NEW_TAB_WARNING: Will open OAuth in new tab`);
      
      // Show user that a new tab will open
      showSuccess('Opening OAuth...', `Opening ${platform} authentication in a new tab. Complete the process there and return here.`);
      
      console.log(`[UI:Connect:${platform}] INITIATING_FLOW: Starting OAuth new tab`);
      const success = await connectOAuthProvider(platform);
      
      if (success) {
        console.log(`[UI:Connect:${platform}] CONNECTION_SUCCESS: Account connected via new tab`);
        showSuccess('Account Connected!', `Your ${platform} account has been successfully connected.`);
      } else {
        console.log(`[UI:Connect:${platform}] CONNECTION_FAILED: OAuth flow failed`);
        showError('Connection Failed', `Failed to connect to ${platform}. This might be due to new tab being blocked. Please allow new tabs for this site and try again.`);
      }
    } catch (error) {
      console.error(`[UI:Connect:${platform}] CONNECTION_ERROR: Exception during connection`);
      console.error(`[UI:Connect:${platform}] ERROR_DETAILS:`, error);
      showError('Connection Error', `Failed to connect to ${platform}. Please ensure new tabs are allowed and try again.`);
    }
  };

  const handleDisconnectAccount = async (platform: string) => {
    const provider = platform.toLowerCase();
    
    console.log(`[UI] User disconnecting ${platform}`);
    
    try {
      const success = await disconnectOAuthProvider(provider);
      
      if (success) {
        console.log(`[UI] ${platform} disconnected successfully`);
        showSuccess('Account Disconnected', `Your ${platform} account has been disconnected.`);
      } else {
        console.log(`[UI] ${platform} disconnect failed`);
        showError('Disconnection Failed', `Failed to disconnect from ${platform}. Please try again.`);
      }
    } catch (error) {
      console.error(`[OAuth] Error disconnecting ${provider}:`, error);
      showError('Disconnection Error', `Failed to disconnect from ${platform}. Please try again.`);
    }
  };


  const toggleDashboard = () => {
    setIsDashboardOpen(!isDashboardOpen);
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
          ${isOpen ? 'w-1/2 shadow-2xl scale-110' : ''}
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
        ${isOpen ? 'w-1/2 translate-x-0' : 'w-0 -translate-x-full'}
        overflow-hidden
      `}>
        <div className="pt-20 px-6 h-full flex flex-col">
          {/* Login/Signup Buttons - only show when not authenticated */}
          {!user && (
            <div className="mb-6 opacity-0 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowLoginPopup(true)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span>Login</span>
                </button>
                <button
                  onClick={() => setShowSignupPopup(true)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span>Sign Up</span>
                </button>
              </div>
            </div>
          )}

          {/* User Profile Section - only show when authenticated */}
          {user && (
            <div className="mb-6 opacity-0 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">{user.username}</h3>
                  <p className="text-gray-300 text-sm">{user.email || 'Member'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="mb-6 opacity-0 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            <div className="w-full flex bg-gray-800/50 rounded-lg p-1">
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
                {/* Dashboard with Submenu */}
                <div className="opacity-0 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
                  <button 
                    onClick={toggleDashboard}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 group"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="group-hover:scale-110 transition-transform duration-200">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                        </svg>
                      </span>
                      <span className="font-medium">Dashboard</span>
                    </div>
                    <svg 
                      className={`w-4 h-4 transition-transform duration-200 ${isDashboardOpen ? 'rotate-180' : ''}`}
                      fill="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path d="M7 10l5 5 5-5z"/>
                    </svg>
                  </button>
                  
                  {/* Submenu */}
                  {isDashboardOpen && (
                    <div className="mt-2 ml-8 space-y-3 animate-fadeIn">
                      {/* LinkedIn */}
                      <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                          <span className="text-white font-medium">LinkedIn</span>
                        </div>
                        {connectedProviders.includes('linkedin') ? (
                          <button
                            onClick={() => handleDisconnectAccount('LinkedIn')}
                            className="px-3 py-1.5 bg-green-600 hover:bg-red-600 text-white text-sm rounded-md transition-colors duration-200 flex items-center space-x-1"
                            title="Click to disconnect"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                            </svg>
                            <span>Connected</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleConnectAccount('LinkedIn')}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors duration-200"
                          >
                            Connect Account
                          </button>
                        )}
                      </div>

                      {/* YouTube */}
                      <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                          </svg>
                          <span className="text-white font-medium">YouTube</span>
                        </div>
                        {connectedProviders.includes('youtube') ? (
                          <button
                            onClick={() => handleDisconnectAccount('YouTube')}
                            className="px-3 py-1.5 bg-green-600 hover:bg-red-600 text-white text-sm rounded-md transition-colors duration-200 flex items-center space-x-1"
                            title="Click to disconnect"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                            </svg>
                            <span>Connected</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleConnectAccount('YouTube')}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors duration-200"
                          >
                            Connect Account
                          </button>
                        )}
                      </div>

                      {/* Spotify */}
                      <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                          </svg>
                          <span className="text-white font-medium">Spotify</span>
                        </div>
                        {connectedProviders.includes('spotify') ? (
                          <button
                            onClick={() => handleDisconnectAccount('Spotify')}
                            className="px-3 py-1.5 bg-green-600 hover:bg-red-600 text-white text-sm rounded-md transition-colors duration-200 flex items-center space-x-1"
                            title="Click to disconnect"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                            </svg>
                            <span>Connected</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleConnectAccount('Spotify')}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors duration-200"
                          >
                            Connect Account
                          </button>
                        )}
                      </div>

                      {/* X (Twitter) */}
                      <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                          <span className="text-white font-medium">X</span>
                        </div>
                        {connectedProviders.includes('x') ? (
                          <button
                            onClick={() => handleDisconnectAccount('X')}
                            className="px-3 py-1.5 bg-green-600 hover:bg-red-600 text-white text-sm rounded-md transition-colors duration-200 flex items-center space-x-1"
                            title="Click to disconnect"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                            </svg>
                            <span>Connected</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleConnectAccount('X')}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors duration-200"
                          >
                            Connect Account
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

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
                      connectedProviders={connectedProviders}
                      socialShareMenu={socialShareMenu}
                      onDownload={handleDownload}
                      onOpenInTab={handleOpenInTab}
                      onDelete={handleDelete}
                      onShareToSocial={handleShareToSocial}
                      onToggleSocialMenu={toggleSocialShareMenu}
                      emptyMessage="No reports generated yet"
                    />

                    {/* MP3 Podcasts */}
                    <MediaSection
                      title="Audio Podcasts"
                      files={mediaFiles.podcasts}
                      connectedProviders={connectedProviders}
                      socialShareMenu={socialShareMenu}
                      onDownload={handleDownload}
                      onOpenInTab={handleOpenInTab}
                      onDelete={handleDelete}
                      onShareToSocial={handleShareToSocial}
                      onToggleSocialMenu={toggleSocialShareMenu}
                      emptyMessage="No podcasts generated yet"
                    />

                    {/* Videos (Future) */}
                    <MediaSection
                      title="Videos"
                      files={mediaFiles.videos}
                      connectedProviders={connectedProviders}
                      socialShareMenu={socialShareMenu}
                      onDownload={handleDownload}
                      onOpenInTab={handleOpenInTab}
                      onDelete={handleDelete}
                      onShareToSocial={handleShareToSocial}
                      onToggleSocialMenu={toggleSocialShareMenu}
                      emptyMessage="Video generation coming soon..."
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer - only show logout when authenticated */}
          {activeTab === 'navigation' && user && (
            <div className="absolute bottom-6 left-6 right-6 opacity-0 animate-fadeIn" style={{ animationDelay: '0.9s' }}>
              <div className="border-t border-gray-700 pt-4">
                <button 
                  onClick={logout}
                  className="w-full flex items-center space-x-3 text-gray-300 hover:text-red-400 transition-colors duration-200 group"
                >
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
      
      {/* Login Popup */}
      {showLoginPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full max-h-[90vh]">
            <div className="bg-white rounded-lg max-h-[90vh] overflow-y-auto relative">
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={() => setShowLoginPopup(false)}
                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <LoginPage onSuccess={() => setShowLoginPopup(false)} />
            </div>
          </div>
        </div>
      )}
      
      {/* Signup Popup */}
      {showSignupPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full max-h-[90vh]">
            <div className="bg-white rounded-lg max-h-[90vh] overflow-y-auto relative">
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={() => setShowSignupPopup(false)}
                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <SignupPage onSuccess={() => setShowSignupPopup(false)} />
            </div>
          </div>
        </div>
      )}
      
      {/* Social Share Modal */}
      {(() => {
        const shouldRender = socialShareModal.file && socialShareModal.isOpen;
        return shouldRender ? (
          <SocialShareModal
            isOpen={socialShareModal.isOpen}
            onClose={() => {
              console.log(`[MODAL] Closing modal`);
              setSocialShareModal({ isOpen: false, file: null, platform: '' });
            }}
            file={socialShareModal.file}
            platform={socialShareModal.platform}
            onSubmit={handleSocialShareSubmit}
          />
        ) : null;
      })()}
      

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
  connectedProviders: string[];
  socialShareMenu: {fileId: string, isOpen: boolean};
  onDownload: (file: MediaFile) => void;
  onOpenInTab: (file: MediaFile) => void;
  onDelete: (fileId: string) => void;
  onShareToSocial: (file: MediaFile, platform: string) => void;
  onToggleSocialMenu: (fileId: string) => void;
  emptyMessage: string;
}

const MediaSection: React.FC<MediaSectionProps> = ({
  title,
  files,
  connectedProviders,
  socialShareMenu,
  onDownload,
  onOpenInTab,
  onDelete,
  onShareToSocial,
  onToggleSocialMenu,
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
              connectedProviders={connectedProviders}
              socialShareMenu={socialShareMenu}
              onDownload={() => onDownload(file)}
              onOpenInTab={() => onOpenInTab(file)}
              onDelete={() => onDelete(file.id)}
              onShareToSocial={(platform) => onShareToSocial(file, platform)}
              onToggleSocialMenu={() => onToggleSocialMenu(file.id)}
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
  connectedProviders: string[];
  socialShareMenu: {fileId: string, isOpen: boolean};
  onDownload: () => void;
  onOpenInTab: () => void;
  onDelete: () => void;
  onShareToSocial: (platform: string) => void;
  onToggleSocialMenu: () => void;
}

const MediaFileItem: React.FC<MediaFileItemProps> = ({
  file,
  connectedProviders,
  socialShareMenu,
  onDownload,
  onOpenInTab,
  onDelete,
  onShareToSocial,
  onToggleSocialMenu,
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
            <button 
              onClick={onOpenInTab}
              className="text-white text-sm font-medium truncate hover:text-blue-400 transition-colors cursor-pointer text-left w-full max-w-[200px]"
              title={`${file.name} - Click to open in new tab`}
            >
              {file.name}
            </button>
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
          {/* Social Share */}
          <div className="relative">
            <button
              onClick={() => {
                console.log('[SHARE BUTTON] Share dropdown button clicked');
                onToggleSocialMenu();
              }}
              className="p-1.5 text-gray-400 hover:text-purple-400 hover:bg-purple-400/10 rounded transition-all duration-200"
              title="Share to social media"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </button>
            
            {/* Social Share Dropdown Menu */}
            {socialShareMenu.isOpen && socialShareMenu.fileId === file.id && (
              <div 
                className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl min-w-[180px]"
                style={{
                  position: 'absolute',
                  zIndex: 99999,
                  pointerEvents: 'auto'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-2">
                  <div className="text-xs text-gray-400 mb-2 px-2">Share to:</div>
                  {connectedProviders.length === 0 ? (
                    <div className="text-xs text-gray-500 px-2 py-1">No connected accounts</div>
                  ) : (
                    <div className="space-y-1">
                      {connectedProviders.includes('linkedin') && (
                        <button
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('[SOCIAL CLICK] LinkedIn button clicked!');
                            console.log('[SOCIAL SELECT] Selected platform: LinkedIn');
                            onShareToSocial('linkedin');
                          }}
                          className="w-full flex items-center space-x-2 px-2 py-1.5 text-sm text-white hover:bg-blue-600/20 rounded transition-colors cursor-pointer bg-blue-600/10"
                        >
                          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                          <span>LinkedIn</span>
                        </button>
                      )}
                      {connectedProviders.includes('youtube') && (
                        <button
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('[SOCIAL CLICK] YouTube button clicked!');
                            console.log('[SOCIAL SELECT] Selected platform: YouTube');
                            onShareToSocial('youtube');
                          }}
                          className="w-full flex items-center space-x-2 px-2 py-1.5 text-sm text-white hover:bg-red-600/20 rounded transition-colors cursor-pointer bg-red-600/10"
                        >
                          <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                          </svg>
                          <span>YouTube</span>
                        </button>
                      )}
                      {connectedProviders.includes('spotify') && (
                        <button
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('[SOCIAL CLICK] Spotify button clicked!');
                            console.log('[SOCIAL SELECT] Selected platform: Spotify');
                            onShareToSocial('spotify');
                          }}
                          className="w-full flex items-center space-x-2 px-2 py-1.5 text-sm text-white hover:bg-green-600/20 rounded transition-colors cursor-pointer bg-green-600/10"
                        >
                          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                          </svg>
                          <span>Spotify</span>
                        </button>
                      )}
                      {connectedProviders.includes('twitter') && (
                        <button
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('[SOCIAL CLICK] Twitter button clicked!');
                            console.log('[SOCIAL SELECT] Selected platform: Twitter');
                            onShareToSocial('twitter');
                          }}
                          className="w-full flex items-center space-x-2 px-2 py-1.5 text-sm text-white hover:bg-blue-400/20 rounded transition-colors cursor-pointer bg-blue-400/10"
                        >
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                          <span>X (Twitter)</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
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
