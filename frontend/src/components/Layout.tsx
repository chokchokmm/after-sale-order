import { Layout as AntLayout, Menu, Button, Space } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  DashboardOutlined,
  UnorderedListOutlined,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useAuth } from "../contexts/AuthContext";

const { Header, Content, Sider } = AntLayout;

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      key: "/",
      icon: <DashboardOutlined />,
      label: "仪表盘",
    },
    {
      key: "/tickets",
      icon: <UnorderedListOutlined />,
      label: "工单列表",
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  // Handle logout and redirect to login page
  // 处理退出登录并重定向到登录页
  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <AntLayout style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        style={{
          background: "var(--bg-secondary)",
          borderRight: "1px solid rgba(255, 255, 255, 0.05)",
        }}
        width={220}
      >
        <div
          style={{
            padding: "20px 16px",
            textAlign: "center",
            fontWeight: 600,
            fontSize: "16px",
            color: "var(--accent-cyan)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
            textShadow: "0 0 10px rgba(0, 212, 255, 0.5)",
          }}
        >
          售后工单系统
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            background: "transparent",
            border: "none",
            marginTop: 8,
          }}
        />
      </Sider>
      <AntLayout style={{ background: "var(--bg-primary)" }}>
        <Header
          style={{
            padding: "0 24px",
            background: "rgba(10, 14, 39, 0.9)",
            backdropFilter: "blur(10px)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            height: 64,
          }}
        >
          <h1
            style={{
              margin: 0,
              color: "var(--text-primary)",
              fontSize: 18,
              fontWeight: 600,
              background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            售后工单管理系统
          </h1>
          {/* User info and logout button */}
          {/* 用户信息和退出按钮 */}
          <Space>
            <span style={{ color: "var(--text-secondary)" }}>
              <UserOutlined style={{ marginRight: 8, color: "var(--accent-cyan)" }} />
              {user?.username}
            </span>
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              style={{
                color: "var(--text-secondary)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--accent-cyan)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-secondary)";
              }}
            >
              退出登录
            </Button>
          </Space>
        </Header>
        <Content
          style={{
            margin: 16,
            background: "var(--bg-primary)",
          }}
        >
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: "rgba(26, 26, 46, 0.4)",
              backdropFilter: "blur(10px)",
              borderRadius: 16,
              border: "1px solid rgba(255, 255, 255, 0.05)",
              boxShadow: "0 4px 24px rgba(0, 0, 0, 0.2)",
            }}
          >
            <Outlet />
          </div>
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
