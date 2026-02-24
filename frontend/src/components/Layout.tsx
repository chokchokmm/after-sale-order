import { Layout as AntLayout, Menu, theme } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  DashboardOutlined,
  UnorderedListOutlined,
  PlusOutlined,
} from "@ant-design/icons";

const { Header, Content, Sider } = AntLayout;

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <h1 style={{ paddingLeft: "24px", margin: 0 }}>售后工单管理系统</h1>
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
