import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ConfigProvider, message } from "antd";
import zhCN from "antd/locale/zh_CN";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { getThemeConfig } from "./config/theme";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import TicketList from "./pages/TicketList";
import TicketForm from "./pages/TicketForm";
import TicketDetail from "./pages/TicketDetail";
import Login from "./pages/Login";
import FeishuCallback from "./pages/FeishuCallback";
import SmartAssistant from "./components/SmartAssistant";

// Theme wrapper component - handles dynamic theme updates
// 主题包装器组件 - 处理动态主题更新
function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const themeConfig = getThemeConfig(theme);

  return (
    <ConfigProvider
      locale={zhCN}
      theme={themeConfig}
    >
      {children}
    </ConfigProvider>
  );
}

// Smart Assistant wrapper - only shows on ticket list page
function SmartAssistantWrapper() {
  const location = useLocation();
  const navigate = useNavigate();

  // Only show on /tickets page
  if (location.pathname !== "/tickets") {
    return null;
  }

  return (
    <SmartAssistant
      onProblemResolved={() => {
        message.success("问题已就自助解决");
      }}
      onCreateTicket={(description) => {
        navigate("/tickets/new", { state: { description } });
      }}
    />
  );
}

function App() {
  return (
    <ThemeProvider>
      <ThemeWrapper>
        <BrowserRouter>
          <Routes>
            {/* Public route - Login page */}
            {/* 公开路由 - 登录页面 */}
            <Route path="/login" element={<Login />} />

            {/* Public route - Feishis OAuth callback callback */}
            {/* 公开路由 - 飞书 OAuth 回调 */}
            <Route path="/auth/feishu/callback" element={<FeishuCallback />} />

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
          <SmartAssistantWrapper />
        </BrowserRouter>
      </ThemeWrapper>
    </ThemeProvider>
  );
}

export default App;
