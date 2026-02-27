import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';

interface LoginFormValues {
  username: string;
  password: string;
}

/**
 * Login page component
 * Displays login form and handles authentication
 *
 * 登录页面组件
 * 显示登录表单并处理认证
 */
function Login() {
  const { user, isLoading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();

  // Get the redirect path from location state, default to '/'
  // 从 location state 获取重定向路径，默认为 '/'
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  // Redirect if already logged in
  // 如果已登录则重定向
  useEffect(() => {
    if (user && !isLoading) {
      navigate(from, { replace: true });
    }
  }, [user, isLoading, navigate, from]);

  // Show loading while checking auth state
  // 检查认证状态时显示加载
  if (isLoading) {
    return (
      <div className="tech-login-loading">
        <div className="tech-loading-spinner">加载中...</div>
        <style>{`
          .tech-login-loading {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: linear-gradient(135deg, #0a0e27 0%, #1a1a2e 50%, #16213e 100%);
          }
          .tech-loading-spinner {
            color: var(--accent-cyan, #00d4ff);
            font-size: 18px;
            animation: pulse 1.5s ease-in-out infinite;
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>
    );
  }

  // Don't render form if already logged in
  // 如果已登录则不渲染表单
  if (user) {
    return null;
  }

  /**
   * Handle form submission
   * 处理表单提交
   */
  const handleSubmit = async (values: LoginFormValues) => {
    const success = await login({
      username: values.username,
      password: values.password,
    });

    if (success) {
      message.success('登录成功');
      navigate(from, { replace: true });
    } else {
      message.error('密码错误');
    }
  };

  return (
    <div className="tech-login-container">
      {/* T041: Dark gradient background with animated elements */}
      <div className="tech-login-bg">
        <div className="tech-orb tech-orb-1"></div>
        <div className="tech-orb tech-orb-2"></div>
        <div className="tech-orb tech-orb-3"></div>
        <div className="tech-grid"></div>
      </div>

      {/* T042: Glass-morphism Card */}
      <Card className="tech-login-card">
        <div className="tech-login-header">
          <div className="tech-login-icon">
            <span className="tech-icon-inner">AS</span>
          </div>
          <h1 className="tech-login-title">售后工单系统</h1>
          <p className="tech-login-subtitle">After-Sale Order System</p>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          className="tech-login-form"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入账号' }]}
          >
            <Input
              prefix={<UserOutlined className="tech-input-icon" />}
              placeholder="请输入账号"
              size="large"
              className="tech-login-input"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined className="tech-input-icon" />}
              placeholder="请输入密码"
              size="large"
              className="tech-login-input"
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            {/* T044: Login button with gradient and glow effects */}
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              className="tech-login-btn"
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        <div className="tech-login-footer">
          <span>Powered by AI</span>
        </div>
      </Card>

      {/* Custom styles for tech-themed Login */}
      <style>{`
        /* T041: Dark Gradient Background */
        .tech-login-container {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0e27 0%, #1a1a2e 50%, #16213e 100%);
          overflow: hidden;
        }

        /* Animated background elements */
        .tech-login-bg {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
        }

        .tech-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.4;
          animation: float 20s ease-in-out infinite;
        }

        .tech-orb-1 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(0, 212, 255, 0.3) 0%, transparent 70%);
          top: -100px;
          right: -100px;
          animation-delay: 0s;
        }

        .tech-orb-2 {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(123, 44, 191, 0.3) 0%, transparent 70%);
          bottom: -50px;
          left: -50px;
          animation-delay: -7s;
        }

        .tech-orb-3 {
          width: 250px;
          height: 250px;
          background: radial-gradient(circle, rgba(255, 0, 110, 0.2) 0%, transparent 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation-delay: -14s;
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -30px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .tech-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: grid-move 30s linear infinite;
        }

        @keyframes grid-move {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 50px 50px;
          }
        }

        /* T042: Glass-morphism Card */
        .tech-login-card {
          position: relative;
          width: 420px;
          background: rgba(26, 26, 46, 0.7) !important;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          border-radius: 20px !important;
          box-shadow:
            0 0 40px rgba(0, 212, 255, 0.1),
            0 25px 50px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
          padding: 40px !important;
          animation: card-appear 0.6s ease-out;
        }

        @keyframes card-appear {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .tech-login-card .ant-card-body {
          padding: 0 !important;
        }

        /* Login Header */
        .tech-login-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .tech-login-icon {
          width: 70px;
          height: 70px;
          margin: 0 auto 16px;
          background: linear-gradient(135deg, rgba(0, 212, 255, 0.2) 0%, rgba(123, 44, 191, 0.2) 100%);
          border: 2px solid rgba(0, 212, 255, 0.3);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 30px rgba(0, 212, 255, 0.2);
        }

        .tech-icon-inner {
          font-size: 24px;
          font-weight: 700;
          color: var(--accent-cyan, #00d4ff);
          letter-spacing: 2px;
        }

        .tech-login-title {
          margin: 0 0 8px;
          font-size: 24px;
          font-weight: 600;
          color: #ffffff;
          letter-spacing: 2px;
        }

        .tech-login-subtitle {
          margin: 0;
          font-size: 12px;
          color: rgba(160, 160, 176, 0.8);
          text-transform: uppercase;
          letter-spacing: 3px;
        }

        /* T043: Input Focus Glow Effects */
        .tech-login-form .ant-form-item {
          margin-bottom: 20px;
        }

        .tech-login-form .ant-form-item-explain-error {
          color: #ff4d4f !important;
          font-size: 12px;
          margin-top: 4px;
          padding-left: 4px;
          border-left: 2px solid #ff4d4f;
        }

        .tech-login-input {
          background: rgba(22, 33, 62, 0.6) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 12px !important;
          transition: all 0.3s ease !important;
        }

        .tech-login-input:hover {
          border-color: rgba(0, 212, 255, 0.3) !important;
        }

        .tech-login-input:focus,
        .tech-login-input-focused,
        .tech-login-input.ant-input-affix-wrapper-focused {
          border-color: var(--accent-cyan, #00d4ff) !important;
          box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1), 0 0 20px rgba(0, 212, 255, 0.2) !important;
          background: rgba(22, 33, 62, 0.8) !important;
        }

        .tech-login-input .ant-input {
          background: transparent !important;
          color: #ffffff !important;
        }

        .tech-login-input .ant-input::placeholder {
          color: rgba(160, 160, 176, 0.6) !important;
        }

        .tech-login-input input::placeholder {
          color: rgba(160, 160, 176, 0.6) !important;
        }

        .tech-input-icon {
          color: rgba(160, 160, 176, 0.8);
          transition: color 0.3s ease;
        }

        .tech-login-input:focus .tech-input-icon,
        .tech-login-input-focused .tech-input-icon {
          color: var(--accent-cyan, #00d4ff);
        }

        /* Password visibility toggle */
        .tech-login-input .ant-input-password-icon {
          color: rgba(160, 160, 176, 0.6);
          transition: color 0.3s ease;
        }

        .tech-login-input .ant-input-password-icon:hover {
          color: var(--accent-cyan, #00d4ff);
        }

        /* T044: Login Button with Gradient and Glow */
        .tech-login-btn {
          height: 48px !important;
          margin-top: 8px;
          background: linear-gradient(135deg, #00d4ff 0%, #7b2cbf 100%) !important;
          border: none !important;
          border-radius: 12px !important;
          font-size: 16px !important;
          font-weight: 600 !important;
          letter-spacing: 4px !important;
          color: #ffffff !important;
          box-shadow: 0 4px 20px rgba(0, 212, 255, 0.3);
          transition: all 0.3s ease !important;
        }

        .tech-login-btn:hover {
          background: linear-gradient(135deg, #00d4ff 0%, #9b4dca 100%) !important;
          box-shadow: 0 6px 30px rgba(0, 212, 255, 0.5);
          transform: translateY(-2px);
        }

        .tech-login-btn:active {
          transform: translateY(0);
          box-shadow: 0 2px 15px rgba(0, 212, 255, 0.4);
        }

        /* Login Footer */
        .tech-login-footer {
          text-align: center;
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .tech-login-footer span {
          font-size: 11px;
          color: rgba(160, 160, 176, 0.5);
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        /* Responsive */
        @media (max-width: 480px) {
          .tech-login-card {
            width: 90%;
            max-width: 380px;
            padding: 30px !important;
          }

          .tech-login-title {
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  );
}

export default Login;
