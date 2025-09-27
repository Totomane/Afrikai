// src/services/mediaService.tsx
import api from './api';

export interface MediaFile {
  id: string;
  name: string;
  type: 'pdf' | 'mp3' | 'mp4';
  url: string;
  downloadUrl: string;
  createdAt: string;
  size: number;
  country?: string;
  year?: number;
}

export interface MediaResponse {
  reports: MediaFile[];
  podcasts: MediaFile[];
  videos: MediaFile[];
}

// Fetch all media files from backend
export const fetchMediaFiles = async (): Promise<MediaResponse> => {
  console.log('[MediaService] Starting to fetch media files from backend...');
  
  try {
    // Since you don't have list endpoints yet, we'll try to fetch them
    // You'll need to add these endpoints to your backend:
    // - /report/list 
    // - /podcast/list
    
    const reports: MediaFile[] = [];
    const podcasts: MediaFile[] = [];

    // Try to fetch reports list (you need to add this endpoint)
    try {
      console.log(' [MediaService] Fetching reports list from /report/list...');
      const reportsResponse = await api.get('/report/list');
      console.log('[MediaService] Reports response received:', reportsResponse.data);
      console.log('📊 [MediaService] Number of reports found:', reportsResponse.data.files?.length || 0);
      
      const reportFiles = reportsResponse.data.files || [];
      reports.push(...reportFiles.map((report: any) => ({
        id: report.id || report.name || Math.random().toString(36),
        name: report.name || 'Unnamed Report',
        type: 'pdf' as const,
        url: `http://localhost:8000${report.download_url.replace('/api/media/download/', '/media/view/')}`, // View URL (direct file access)
        downloadUrl: report.download_url, // Download URL (API endpoint)
        createdAt: report.created ? new Date(report.created * 1000).toISOString() : new Date().toISOString(),
        size: report.size || 0,
        country: report.country,
        year: report.year ? parseInt(report.year) : undefined,
      })));
      
      console.log('📄 [MediaService] Processed reports:', reports);
    } catch (error) {
      console.warn('⚠️ [MediaService] Report list endpoint not available yet:', error);
    }

    // Try to fetch podcasts list (you need to add this endpoint)
    try {
      console.log(' [MediaService] Fetching podcasts list from /podcast/list...');
      const podcastsResponse = await api.get('/podcast/list');
      console.log('[MediaService] Podcasts response received:', podcastsResponse.data);
      console.log('📊 [MediaService] Number of podcasts found:', podcastsResponse.data.files?.length || 0);
      
      const podcastFiles = podcastsResponse.data.files || [];
      podcasts.push(...podcastFiles.map((podcast: any) => ({
        id: podcast.id || podcast.name || Math.random().toString(36),
        name: podcast.name || 'Unnamed Podcast',
        type: 'mp3' as const,
        url: `http://localhost:8000${podcast.download_url.replace('/api/media/download/', '/media/view/')}`, // View URL (direct file access)
        downloadUrl: podcast.download_url, // Download URL (API endpoint)
        createdAt: podcast.created ? new Date(podcast.created * 1000).toISOString() : new Date().toISOString(),
        size: podcast.size || 0,
        country: podcast.country,
        year: podcast.year ? parseInt(podcast.year) : undefined,
      })));
      
      console.log('🎵 [MediaService] Processed podcasts:', podcasts);
    } catch (error) {
      console.warn('⚠️ [MediaService] Podcast list endpoint not available yet:', error);
    }

    const result = {
      reports,
      podcasts,
      videos: [], // Will be implemented in the future
    };
    
    console.log('✅ [MediaService] Final media files result:', result);
    console.log(`📊 [MediaService] Total files: ${reports.length + podcasts.length} (${reports.length} reports, ${podcasts.length} podcasts)`);
    
    return result;
  } catch (error) {
    console.error('Error fetching media files:', error);
    // Return empty arrays if there's an error
    return {
      reports: [],
      podcasts: [],
      videos: [],
    };
  }
};

// Download a specific file
export const downloadFile = async (downloadUrl: string, fileName: string): Promise<void> => {
  console.log(`⬇️ [MediaService] Starting download for file: "${fileName}"`);
  
  try {
    // Remove /api/ prefix if present to avoid double /api/api/ in URL
    const cleanDownloadUrl = downloadUrl.replace('/api/', '/');
    console.log(`🔗 [MediaService] Clean Download URL: ${cleanDownloadUrl}`);
    
    console.log('📡 [MediaService] Making API request to download file...');
    const response = await api.get(cleanDownloadUrl, {
      responseType: 'blob',
    });
    
    console.log('✅ [MediaService] File downloaded successfully from backend');
    console.log(`📊 [MediaService] File size: ${response.data.size} bytes`);
    console.log(`📋 [MediaService] Content type: ${response.headers['content-type'] || 'unknown'}`);
    
    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    
    console.log('🖱️ [MediaService] Creating download link and triggering download...');
    // Append to html link element page
    document.body.appendChild(link);
    
    // Start download
    link.click();
    
    // Clean up and remove the link
    link.remove();
    window.URL.revokeObjectURL(url);
    
    console.log(`✅ [MediaService] Download completed successfully for "${fileName}"`);
  } catch (error) {
    console.error(`❌ [MediaService] Error downloading file "${fileName}":`, error);
    throw error;
  }
};

// Open file in new tab
export const openFileInNewTab = (fileUrl: string): void => {
  // Remove /api/ prefix if present to avoid double /api/api/ in URL
  const cleanFileUrl = fileUrl.replace('/api/', '/');
  const fullUrl = `http://localhost:8000/api${cleanFileUrl}`;
  
  console.log(`🔗 [MediaService] Opening file in new tab: ${fullUrl}`);
  
  try {
    const newWindow = window.open(fullUrl, '_blank');
    
    if (newWindow) {
      console.log('✅ [MediaService] File opened successfully in new tab');
    } else {
      console.warn('⚠️ [MediaService] Pop-up blocked or failed to open new tab');
    }
  } catch (error) {
    console.error('❌ [MediaService] Error opening file in new tab:', error);
  }
};

// Delete a media file
export const deleteMediaFile = async (fileId: string): Promise<void> => {
  console.log(`🗑️ [MediaService] Starting deletion for file ID: ${fileId}`);
  
  try {
    const deleteUrl = `/media/delete/${fileId}`;
    console.log(`🔗 [MediaService] Delete URL: ${deleteUrl}`);
    
    console.log('📡 [MediaService] Making API request to delete file...');
    await api.delete(deleteUrl);
    
    console.log(`✅ [MediaService] File deleted successfully (ID: ${fileId})`);
  } catch (error) {
    console.error(`❌ [MediaService] Error deleting file (ID: ${fileId}):`, error);
    throw error;
  }
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Format date
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};