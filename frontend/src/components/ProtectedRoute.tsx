import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * ProtectedRoute component
 * Redirects unauthenticated users to login page
 *
 * ProtectedRoute 组件
 * 将未认证用户重定向到登录页面
 */
function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth state
  // 检查认证状态时显示加载动画
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  // Redirect to login if not authenticated, preserving the intended destination
  // 如果未认证则重定向到登录页，保留目标路径
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render protected content
  // 渲染受保护的内容
  return <>{children}</>;
}

export default ProtectedRoute;
