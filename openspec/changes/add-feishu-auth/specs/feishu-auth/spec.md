# Feishu Auth Specification

## ADDED Requirements

### Requirement: User can initiate Feishu login
The system SHALL provide a "飞书登录" button on the login page that redirects users to Feishu OAuth authorization page.

#### Scenario: User clicks Feishu login button
- **WHEN** user clicks "飞书登录" button on login page
- **THEN** system redirects to Feishu authorization URL with app_id, redirect_uri, and state parameters

### Requirement: System handles Feishu OAuth callback
The system SHALL handle the OAuth callback at `/auth/feishu/callback`, extract the authorization code, and exchange it for user information.

#### Scenario: Successful OAuth callback
- **WHEN** Feishu redirects to callback URL with valid code parameter
- **THEN** system extracts code from URL
- **THEN** system sends code to backend API
- **THEN** system receives user information
- **THEN** system stores user info in localStorage
- **THEN** system redirects to home page

#### Scenario: OAuth callback with error
- **WHEN** Feishu redirects to callback URL with error parameter
- **THEN** system displays error message
- **THEN** system shows login page with "飞书登录失败" message

### Requirement: Backend exchanges code for access token
The backend SHALL exchange the authorization code for an access token using Feishu API.

#### Scenario: Exchange code for token
- **WHEN** backend receives POST /api/auth/feishu/login with code
- **THEN** backend calls Feishu token API with app_id, app_secret, and code
- **THEN** backend receives user_access_token

#### Scenario: Invalid or expired code
- **WHEN** Feishu returns error for code exchange
- **THEN** backend returns error response with message "授权码无效或已过期"

### Requirement: Backend retrieves user info from Feishu
The backend SHALL use the access token to retrieve user information from Feishu API.

#### Scenario: Get user info success
- **WHEN** backend has valid user_access_token
- **THEN** backend calls Feishu user_info API
- **THEN** backend receives user name, open_id, email, avatar
- **THEN** backend returns user info to frontend

#### Scenario: Get user info failure
- **WHEN** Feishu user_info API returns error
- **THEN** backend returns error response with message "获取用户信息失败"

### Requirement: Frontend stores extended user info
The frontend SHALL store extended user information in localStorage including Feishu-specific fields.

#### Scenario: Store user info after Feishu login
- **WHEN** frontend receives user info from backend
- **THEN** frontend stores AuthUser object with username, avatar, email, feishuOpenId, loginType="feishu"
- **THEN** AuthContext is updated with new user

### Requirement: Login page shows both login options
The login page SHALL display both password login form and Feishu login button.

#### Scenario: Display login options
- **WHEN** user visits login page
- **THEN** page shows username/password form
- **THEN** page shows "飞书登录" button
