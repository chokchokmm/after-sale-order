import { Layout as AntLayout, Menu, theme, Button, Space } from "antd";
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
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

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
    <AntLayout style={{ minHeight: "100vh" }}>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        style={{
          background: colorBgContainer,
        }}
      >
        <div style={{ padding: "16px", textAlign: "center", fontWeight: "bold", fontSize: "18px" }}>
          售后工单系统
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <AntLayout>
        <Header
          style={{
            padding: "0 24px",
            background: colorBgContainer,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h1 style={{ margin: 0 }}>售后工单管理系统</h1>
          {/* User info and logout button */}
          {/* 用户信息和退出按钮 */}
          <Space>
            <span>
              <UserOutlined style={{ marginRight: 8 }} />
              {user?.username}
            </span>
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              退出登录
            </Button>
          </Space>
        </Header>
        <Content style={{ margin: "16px" }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
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
