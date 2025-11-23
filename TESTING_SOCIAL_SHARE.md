# 🧪 Social Media Share Testing Guide

## How to Test the Social Media Sharing Feature

### Step 1: Open the Application
1. Go to http://localhost:5174/ in your browser
2. Open Developer Tools (F12) and go to the Console tab
3. Log in to your account if not already logged in

### Step 2: Navigate to Media Files
1. Hover over the circular logo in the top-left corner
2. Wait for the sidebar to expand
3. Click on the "Media" tab in the sidebar navigation
4. You should see your media files (PDF reports, audio podcasts, etc.)

### Step 3: Test Social Sharing
1. Hover over any media file in the list
2. You should see action buttons appear on the right side
3. Click the **share button** (network/share icon) 
4. A dropdown menu should appear with connected social platforms
5. Click on **YouTube** (or any other platform)

### Step 4: Check Debug Logs
Watch the console for debug messages that should appear like:
```
[SOCIAL SHARE DEBUG] YouTube button clicked for file: example.mp4
[SOCIAL SHARE DEBUG] Function called with: {file: "example.mp4", platform: "YouTube"}
[SOCIAL SHARE DEBUG] Opening YouTube share modal for example.mp4
[SOCIAL SHARE DEBUG] Setting modal state to: {isOpen: true, file: {...}, platform: "YouTube"}
[SOCIAL MODAL DEBUG] Component rendered with props: {isOpen: true, fileName: "example.mp4", platform: "YouTube", hasOnSubmit: true}
[SOCIAL MODAL DEBUG] Modal is rendering for platform: YouTube, file: example.mp4
```

### Step 5: Test the Modal Form
1. The YouTube sharing modal should open with a form
2. Fill out the form fields (title, description, etc.)
3. Click "Share to YouTube" button
4. Watch for more debug logs showing the API call

### Expected Debug Flow:
```
1. [SOCIAL SHARE DEBUG] YouTube button clicked for file: filename
2. [SOCIAL SHARE DEBUG] Function called with: {...}
3. [SOCIAL SHARE DEBUG] Opening YouTube share modal for filename
4. [SOCIAL MODAL DEBUG] Component rendered with props: {...}
5. [SOCIAL MODAL DEBUG] Modal is rendering for platform: YouTube
6. (User fills form and submits)
7. [SOCIAL MODAL DEBUG] Form submitted for platform: YouTube
8. [SOCIAL SERVICE DEBUG] Starting YouTube share for filename
9. [SOCIAL SERVICE DEBUG] Making API call to: http://localhost:8000/...
10. (API call results)
```

## 🔍 Troubleshooting

### If the modal doesn't open:
- Check console for any error messages
- Make sure you're clicking on a connected platform (green "Connected" button)
- Verify the debug logs show the button click is being registered

### If you don't see any media files:
- Make sure you're logged in
- Try generating some content first (reports, podcasts)
- The media files come from your backend's media generation endpoints

### If the share button doesn't appear:
- Make sure you're hovering over the media file item
- The buttons should appear on the right side when hovering
- Try refreshing the page if the UI seems stuck

## 🎯 What Should Happen:
1. **Click YouTube** → **Modal Opens** → **Form Appears** → **Can Submit**
2. **Debug logs** should show each step of the process
3. **No errors** in the console (except expected API 404 since backend endpoint may not exist yet)

If you're still not seeing the modal, please check the console logs and let me know what debug messages you see!