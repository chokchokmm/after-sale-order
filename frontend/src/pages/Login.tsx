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
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <span>加载中...</span>
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
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: '#f0f2f5',
    }}>
      <Card
        title="售后工单系统 - 登录"
        style={{ width: 400, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入账号' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="请输入账号"
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
              size="large"
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block size="large">
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default Login;
