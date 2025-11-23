# Social Media Sharing API Documentation

This document describes the backend API endpoints needed to support the social media sharing functionality.

## Endpoint: POST /api/social-media/share/{platform}/

### Supported Platforms
- `youtube` - Upload video to YouTube
- `linkedin` - Share post on LinkedIn
- `twitter` (or `x`) - Post tweet on Twitter/X
- `spotify` - Create playlist or upload podcast

### Request Format
The request should be sent as `multipart/form-data` with the following fields:

#### Common Fields
- `file_url` (string): URL of the media file to share
- `file_name` (string): Original filename
- `file_type` (string): File type (pdf, mp3, mp4, etc.)
- `platform_data` (JSON string): Platform-specific sharing data

#### Platform-Specific Data Formats

##### YouTube (`platform_data` JSON):
```json
{
  "title": "Episode 1: Getting Started",
  "description": "In this episode, we talk about...",
  "tags": ["podcast", "episode1", "tech"],
  "privacy_status": "unlisted",
  "category_id": "22"
}
```

##### LinkedIn (`platform_data` JSON):
```json
{
  "title": "Check out my latest content",
  "description": "I just published a new podcast episode...",
  "visibility": "CONNECTIONS"
}
```

##### Twitter/X (`platform_data` JSON):
```json
{
  "text": "Check out my latest podcast episode!",
  "reply_settings": "everyone"
}
```

##### Spotify (`platform_data` JSON):
```json
{
  "name": "My Podcast Episode",
  "description": "Latest episode of my podcast series",
  "public": false
}
```

### Response Format

#### Success Response (200):
```json
{
  "success": true,
  "message": "Successfully shared to {platform}",
  "platform_response": {
    // Platform-specific response data
    "id": "uploaded_content_id",
    "url": "https://platform.com/content/id"
  }
}
```

#### Error Response (400/500):
```json
{
  "success": false,
  "error": "Error message describing what went wrong",
  "details": {
    // Optional additional error details
  }
}
```

### Headers Required
- `X-CSRFToken`: CSRF token for authentication
- `Content-Type`: `multipart/form-data` (automatically set by browser)

### Authentication
- User must be authenticated (session-based)
- User must have connected the target social media account via OAuth

### Implementation Notes

1. **File Handling**: The backend should download the file from `file_url` and then upload it to the target platform
2. **OAuth Integration**: Ensure the user has connected their account for the target platform
3. **Error Handling**: Provide meaningful error messages for common issues (file too large, invalid credentials, etc.)
4. **Rate Limiting**: Consider implementing rate limiting to prevent abuse
5. **Logging**: Log all sharing attempts for debugging and analytics

### Example cURL Request
```bash
curl -X POST \
  http://localhost:8000/api/social-media/share/youtube/ \
  -H "X-CSRFToken: your-csrf-token" \
  -H "Cookie: sessionid=your-session-id" \
  -F "file_url=http://localhost:8000/media/podcasts/example.mp4" \
  -F "file_name=example.mp4" \
  -F "file_type=mp4" \
  -F 'platform_data={"title":"My Video","description":"Description here","tags":["tag1","tag2"],"privacy_status":"unlisted","category_id":"22"}'
```

## Database Models (Suggested)

### SocialMediaShare
```python
class SocialMediaShare(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    platform = models.CharField(max_length=50)
    media_file_url = models.URLField()
    platform_content_id = models.CharField(max_length=200, blank=True)
    platform_url = models.URLField(blank=True)
    share_data = models.JSONField()  # Store the platform_data
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('success', 'Success'),
        ('failed', 'Failed'),
    ])
    error_message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

This model helps track sharing history and troubleshoot issues.