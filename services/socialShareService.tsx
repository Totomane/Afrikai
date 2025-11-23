// src/services/socialShareService.tsx
import { MediaFile } from './mediaService';

const API_BASE = 'http://localhost:8000';

export interface SocialShareData {
  // YouTube specific
  title?: string;
  description?: string;
  tags?: string[];
  privacy_status?: 'private' | 'public' | 'unlisted';
  category_id?: string;
  
  // LinkedIn specific
  visibility?: 'PUBLIC' | 'CONNECTIONS' | 'LOGGED_IN_MEMBERS';
  
  // Twitter specific
  text?: string;
  reply_settings?: 'everyone' | 'mentionedUsers' | 'following';
  
  // Spotify specific
  name?: string;
  public?: boolean;
}

export const shareToSocialMedia = async (
  platform: string,
  file: MediaFile,
  shareData: SocialShareData,
  csrfToken: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    console.log(`[API] Sharing "${file.name}" to ${platform}`);
    
    // Create FormData for file upload
    const formData = new FormData();
    
    // Add the file
    // Note: In a real app, you'd fetch the actual file blob here
    // For now, we'll send the file URL and let the backend handle it
    formData.append('file_url', file.url);
    formData.append('file_name', file.name);
    formData.append('file_type', file.type);
    
    // Add platform-specific data
    formData.append('platform_data', JSON.stringify(shareData));
    
    const apiUrl = `${API_BASE}/api/social-media/share/${platform.toLowerCase()}/`;
    console.log(`[API] POST ${apiUrl}`);
    
    const response = await fetch(`${API_BASE}/api/social-media/share/${platform.toLowerCase()}/`, {
      method: 'POST',
      headers: {
        'X-CSRFToken': csrfToken,
      },
      credentials: 'include',
      body: formData,
    });

    const result = await response.json();

    if (response.ok) {
      console.log(`[API] ${platform} share successful`);
      return { success: true, message: result.message };
    } else {
      console.error(`[API] ${platform} share failed (${response.status}):`, result.error);
      return { success: false, message: result.error || `Failed to share to ${platform}` };
    }
  } catch (error) {
    console.error(`[API] ${platform} network error:`, error);
    return { success: false, message: `Network error while sharing to ${platform}` };
  }
};

// Platform-specific validation
export const validateYouTubeData = (data: SocialShareData): string[] => {
  const errors: string[] = [];
  
  if (!data.title || data.title.trim().length === 0) {
    errors.push('Title is required');
  }
  
  if (data.title && data.title.length > 100) {
    errors.push('Title must be 100 characters or less');
  }
  
  if (data.description && data.description.length > 5000) {
    errors.push('Description must be 5000 characters or less');
  }
  
  return errors;
};

export const validateLinkedInData = (data: SocialShareData): string[] => {
  const errors: string[] = [];
  
  if (!data.title || data.title.trim().length === 0) {
    errors.push('Title is required');
  }
  
  if (data.title && data.title.length > 200) {
    errors.push('Title must be 200 characters or less');
  }
  
  if (data.description && data.description.length > 3000) {
    errors.push('Description must be 3000 characters or less');
  }
  
  return errors;
};

export const validateTwitterData = (data: SocialShareData): string[] => {
  const errors: string[] = [];
  
  if (!data.text || data.text.trim().length === 0) {
    errors.push('Tweet text is required');
  }
  
  if (data.text && data.text.length > 280) {
    errors.push('Tweet must be 280 characters or less');
  }
  
  return errors;
};

export const validateSpotifyData = (data: SocialShareData): string[] => {
  const errors: string[] = [];
  
  if (!data.name || data.name.trim().length === 0) {
    errors.push('Playlist name is required');
  }
  
  if (data.name && data.name.length > 100) {
    errors.push('Playlist name must be 100 characters or less');
  }
  
  if (data.description && data.description.length > 300) {
    errors.push('Description must be 300 characters or less');
  }
  
  return errors;
};