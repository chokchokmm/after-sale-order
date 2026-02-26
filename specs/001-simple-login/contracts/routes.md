# Route Contract

**Date**: 2025-02-26
**Feature**: 001-simple-login

## Overview

路由配置变更，新增登录路由和路由保护机制。

## Route Structure

### Before

```
/                    → Dashboard (public)
/tickets             → TicketList (public)
/tickets/new         → TicketForm (public)
/tickets/:id         → TicketDetail (public)
/tickets/:id/edit    → TicketForm (public)
```

### After

```
/login               → Login (public)
/                    → Dashboard (protected)
/tickets             → TicketList (protected)
/tickets/new         → TicketForm (protected)
/tickets/:id         → TicketDetail (protected)
/tickets/:id/edit    → TicketForm (protected)
```

## ProtectedRoute Component

Wrapper component that redirects unauthenticated users to login page.

```tsx
interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps): JSX.Element
```

**Behavior**:
| Condition | Result |
|-----------|--------|
| `user` exists | Render children |
| `user` is null | Redirect to `/login` |
| `isLoading` is true | Render loading spinner |

## Login Route

**Path**: `/login`

**Component**: `Login`

**Behavior**:
| Condition | Result |
|-----------|--------|
| Already logged in | Redirect to `/` |
| Not logged in | Show login form |

## Navigation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    User visits /tickets                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ ProtectedRoute  │
                    └─────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
         isLoading?      user exists?     user is null
              │               │               │
              ▼               ▼               ▼
        Show <Spin>     Render page    Redirect to
                                         /login
```

## Redirect Logic

### After Login Success

Redirect to the originally requested URL or fallback to `/`.

```tsx
const from = location.state?.from?.pathname || '/';
navigate(from, { replace: true });
```

### After Logout

Redirect to `/login`.

```tsx
navigate('/login', { replace: true });
```

## URL State

When redirecting to login, store the original URL for post-login redirect:

```tsx
// In ProtectedRoute
<Navigate to="/login" state={{ from: location }} replace />
```
