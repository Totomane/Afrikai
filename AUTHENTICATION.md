# Authentication System Documentation

## Overview

The authentication system has been updated to comply with your backend contract requirements. It implements CSRF token handling, comprehensive OAuth support, and password reset functionality.

## Backend Contract Implementation

### CSRF Token Handling
- All POST requests include `credentials: "include"` and `X-CSRFToken` header
- CSRF token obtained via preliminary GET request to `/api/auth/csrf/`
- Token automatically refreshed when needed

### Authentication Endpoints
- **Register**: `POST /api/auth/register/` with JSON body `{ username, email, password }`
- **Login**: `POST /api/auth/login/` with JSON body `{ username, password }`
- **Logout**: `POST /api/auth/logout/` with CSRF token
- **Current User**: `GET /api/auth/me/` with credentials only
- **Password Reset Request**: `POST /api/auth/password/reset/` with JSON body `{ email }`
- **Password Reset Confirm**: `POST /api/auth/password/reset/confirm/<token>/` with JSON body `{ password }`

### OAuth Implementation
- **Popup Flow**: Opens `/oauth/<provider>/start/` in popup window
- **Success Detection**: Listens for `window.onmessage` containing `"oauth-success"`
- **Connected Accounts**: `GET /api/oauth/connected-accounts/`
- **Disconnect**: `POST /api/oauth/disconnect/<provider>/`

## Components

### Core Components
- **AuthContext**: Main context provider with user state, CSRF token management, and authentication methods
- **LoginForm**: Updated with proper error handling and new response format
- **RegisterForm**: Updated with proper error handling and new response format
- **PasswordResetForm**: New component for requesting password resets
- **PasswordResetConfirmForm**: New component for confirming password resets with token
- **OAuthManager**: Component for managing OAuth provider connections

### Modal Components
- **AuthModal**: Simple modal with tab switching between login/register/reset
- **Modern/AuthModal**: Enhanced modal with animations and modern design

### Pages
- **PasswordResetConfirmPage**: Route page for handling email reset links

## AuthContext API

### State
- `user: AuthUser | null` - Current authenticated user
- `loading: boolean` - Initial loading state
- `csrfToken: string | null` - Current CSRF token
- `connectedProviders: string[]` - List of connected OAuth providers

### Methods
- `login(username, password)` - Login with credentials
- `register(username, email, password)` - Register new account
- `logout()` - Logout current user
- `resetPassword(email)` - Request password reset
- `confirmResetPassword(token, password)` - Confirm password reset
- `connectOAuthProvider(provider)` - Connect OAuth provider
- `disconnectOAuthProvider(provider)` - Disconnect OAuth provider
- `refreshConnectedProviders()` - Refresh connected providers list
- `refreshCSRFToken()` - Manually refresh CSRF token

## Usage Examples

### Basic Authentication
```tsx
import { useAuth } from './components/context/authContext';

function MyComponent() {
  const { user, login, logout } = useAuth();
  
  const handleLogin = async () => {
    const result = await login('username', 'password');
    if (result.success) {
      console.log('Login successful');
    } else {
      console.error(result.message);
    }
  };
  
  return user ? (
    <div>Welcome {user.username}!</div>
  ) : (
    <button onClick={handleLogin}>Login</button>
  );
}
```

### OAuth Integration
```tsx
import { OAuthManager } from './components/OAuthManager';

function AccountSettings() {
  return (
    <div>
      <h2>Account Settings</h2>
      <OAuthManager />
    </div>
  );
}
```

### Password Reset
```tsx
import { PasswordResetForm } from './components/PasswordResetForm';

function ForgotPassword() {
  return (
    <PasswordResetForm 
      onSuccess={() => console.log('Reset email sent')}
      onCancel={() => navigate('/login')}
    />
  );
}
```

## Security Features

1. **CSRF Protection**: All POST requests include CSRF tokens
2. **Credential Management**: All requests include `credentials: "include"`
3. **Token Refresh**: Automatic CSRF token refresh when needed
4. **OAuth Security**: Popup-based OAuth flow with origin validation
5. **Error Handling**: Comprehensive error handling with user feedback

## Migration Notes

- The `useAuth` hook now returns objects with `{ success, message }` format instead of booleans
- CSRF tokens are automatically managed by the context
- OAuth methods have been moved to the auth context for consistency
- All forms now include proper error display and validation

## Environment Variables

Make sure to set your API base URL:
```
VITE_API_URL=http://localhost:8000
```

This system provides a complete, secure, and user-friendly authentication experience that follows modern best practices and your backend contract requirements.