import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider, theme as antdTheme } from "antd";
import zhCN from "antd/locale/zh_CN";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import TicketList from "./pages/TicketList";
import TicketForm from "./pages/TicketForm";
import TicketDetail from "./pages/TicketDetail";
import Login from "./pages/Login";

// Custom dark theme configuration
const darkThemeConfig = {
  algorithm: antdTheme.darkAlgorithm,
  token: {
    colorPrimary: "#00d4ff",
    colorBgBase: "#0a0e27",
    colorTextBase: "#ffffff",
    colorSuccess: "#00ff88",
    colorWarning: "#ffb703",
    colorError: "#ff006e",
    colorInfo: "#00d4ff",
    borderRadius: 8,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  components: {
    Card: {
      colorBgContainer: "rgba(26, 26, 46, 0.6)",
      colorBorder: "rgba(255, 255, 255, 0.1)",
    },
    Table: {
      colorBgContainer: "transparent",
      headerBg: "rgba(255, 255, 255, 0.05)",
      rowHoverBg: "rgba(0, 212, 255, 0.05)",
      borderColor: "rgba(255, 255, 255, 0.05)",
    },
    Menu: {
      colorBgContainer: "transparent",
      colorItemBg: "transparent",
      colorItemBgHover: "rgba(0, 212, 255, 0.1)",
      colorItemBgSelected: "rgba(0, 212, 255, 0.15)",
      colorItemText: "#a0a0b0",
      colorItemTextHover: "#00d4ff",
      colorItemTextSelected: "#00d4ff",
    },
    Input: {
      colorBgContainer: "rgba(255, 255, 255, 0.05)",
      colorBorder: "rgba(255, 255, 255, 0.1)",
      colorBgContainerDisabled: "rgba(255, 255, 255, 0.02)",
      hoverBorderColor: "rgba(0, 212, 255, 0.3)",
      activeBorderColor: "#00d4ff",
    },
    Select: {
      colorBgContainer: "rgba(255, 255, 255, 0.05)",
      colorBorder: "rgba(255, 255, 255, 0.1)",
      optionSelectedBg: "rgba(0, 212, 255, 0.15)",
    },
    Button: {
      colorPrimary: "#00d4ff",
      colorPrimaryHover: "#40dfff",
      colorPrimaryActive: "#00a8cc",
      primaryShadow: "0 0 10px rgba(0, 212, 255, 0.3)",
    },
    Tag: {
      colorBgContainer: "transparent",
    },
    Spin: {
      colorPrimary: "#00d4ff",
    },
    Message: {
      colorBgElevated: "rgba(26, 26, 46, 0.95)",
    },
    Modal: {
      colorBgElevated: "rgba(26, 26, 46, 0.98)",
    },
    Dropdown: {
      colorBgElevated: "rgba(26, 26, 46, 0.95)",
    },
    Form: {
      labelColor: "#a0a0b0",
    },
    Descriptions: {
      labelBg: "rgba(255, 255, 255, 0.05)",
    },
    Pagination: {
      colorBgContainer: "rgba(255, 255, 255, 0.05)",
      colorBorder: "rgba(255, 255, 255, 0.1)",
    },
  },
};

function App() {
  return (
    <ConfigProvider locale={zhCN} theme={darkThemeConfig}>
      <BrowserRouter>
        <Routes>
          {/* Public route - Login page */}
          {/* 公开路由 - 登录页面 */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes - require authentication */}
          {/* 受保护路由 - 需要认证 */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="tickets" element={<TicketList />} />
            <Route path="tickets/new" element={<TicketForm />} />
            <Route path="tickets/:id" element={<TicketDetail />} />
            <Route path="tickets/:id/edit" element={<TicketForm />} />
          </Route>

          {/* Catch-all redirect to home */}
          {/* 兜底重定向到首页 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
