import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider, theme as antdTheme } from "antd";
import zhCN from "antd/locale/zh_CN";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import TicketList from "./pages/TicketList";
import TicketForm from "./pages/TicketForm";
import TicketDetail from "./pages/TicketDetail";

function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: "#1890ff",
          borderRadius: 8,
        },
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="tickets" element={<TicketList />} />
            <Route path="tickets/new" element={<TicketForm />} />
            <Route path="tickets/:id" element={<TicketDetail />} />
            <Route path="tickets/:id/edit" element={<TicketForm />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
