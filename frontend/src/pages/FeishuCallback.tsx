import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Spin, message } from "antd";
import { useAuth } from "../contexts/AuthContext";
import { authApi } from "../api/auth";

const FeishuCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { feishuLogin } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const errorParam = searchParams.get("error");

      if (errorParam) {
        setError("飞书授权失败");
        message.error("飞书授权失败");
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      if (!code) {
        setError("未收到授权码");
        message.error("未收到授权码");
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      if (!state) {
        setError("state 参数缺失");
        message.error("state 参数缺失");
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      try {
        const response = await authApi.feishuLogin(code, state);

        if (response.success && response.user) {
          feishuLogin(response.user);
          message.success("登录成功");
          navigate("/");
        } else {
          setError(response.message || "登录失败");
          message.error(response.message || "登录失败");
          setTimeout(() => navigate("/login"), 2000);
        }
      } catch (err) {
        console.error("Feishu login error:", err);
        setError("登录失败，请重试");
        message.error("登录失败，请重试");
        setTimeout(() => navigate("/login"), 2000);
      }
    };

    handleCallback();
  }, [searchParams, feishuLogin, navigate]);

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "linear-gradient(135deg, #0a0e27 0%, #1a1a2e 100%)",
        }}
      >
        <div
          style={{
            color: "#ff4d4f",
            fontSize: 18,
            marginBottom: 16,
          }}
        >
          {error}
        </div>
        <Spin />
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #0a0e27 0%, #1a1a2e 100%)",
      }}
    >
      <Spin size="large" />
      <div
        style={{
          color: "var(--text-secondary)",
          marginTop: 16,
          fontSize: 14,
        }}
      >
        正在登录...
      </div>
    </div>
  );
};

export default FeishuCallback;
