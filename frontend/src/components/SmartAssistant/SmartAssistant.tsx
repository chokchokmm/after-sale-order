import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Spin, message } from "antd";
import {
  MessageOutlined,
  CloseOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { chatApi } from "../../api/chat";
import type { SimilarTicket } from "../../types/chat";
import { useTheme } from "../../contexts/ThemeContext";

const { TextArea } = Input;

interface SmartAssistantProps {
  onProblemResolved?: () => void;
  onCreateTicket?: (description: string) => void;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  similarTickets?: SimilarTicket[];
}

const SmartAssistant: React.FC<SmartAssistantProps> = ({
  onCreateTicket,
}) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "你好！我是智能客服助手。请按以下格式描述你遇到的问题：\n问题描述:您的问题内容\n\n例如：问题描述:订单无法支付",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Toggle chat panel visibility
  const handleToggle = () => {
    setIsOpen(!isOpen);
    setTimeout(scrollToBottom, 100);
  };

  // Send message
  const handleSend = async () => {
    if (!inputValue.trim() || loading) return;

    const userMessage = inputValue.trim();
    setInputValue("");

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const response = await chatApi.ask(userMessage);

      // Add assistant message
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.message,
          similarTickets: response.similarTickets,
        },
      ]);

      setTimeout(scrollToBottom, 100);
    } catch (error) {
      message.error("发送消息失败");
      console.error(error);
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "抱歉，处理您的消息时出现错误，请稍后再试。",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Navigate to ticket detail
  const handleTicketClick = (ticketId: string) => {
    navigate(`/tickets/${ticketId}`);
    setIsOpen(false);
  };

  // Create ticket with problem description
  const handleCreateTicket = (description: string) => {
    setIsOpen(false);
    onCreateTicket?.(description);
  };

  // Render message
  const renderMessage = (msg: ChatMessage, index: number) => {
    const isUser = msg.role === "user";
    return (
      <div key={index} style={{ marginBottom: 12 }}>
        <div
          style={{
            display: "flex",
            justifyContent: isUser ? "flex-end" : "flex-start",
          }}
        >
          <div
            style={{
              maxWidth: "85%",
              padding: "10px 14px",
              borderRadius: 12,
              background: isUser
                ? isDark ? "rgba(0, 212, 255, 0.15)" : "rgba(0, 212, 255, 0.2)"
                : isDark ? "rgba(22, 33, 62, 0.8)" : "rgba(240, 242, 245, 0.95)",
              border: isUser
                ? "1px solid rgba(0, 212, 255, 0.3)"
                : isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
              color: "var(--text-primary)",
              fontSize: 14,
              lineHeight: 1.5,
              whiteSpace: "pre-wrap",
            }}
          >
            {msg.content}
          </div>
        </div>

        {/* Show similar tickets if available */}
        {!isUser && msg.similarTickets && msg.similarTickets.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <div
              style={{
                color: "var(--text-secondary)",
                fontSize: 12,
                marginBottom: 6,
              }}
            >
              相似工单 ({msg.similarTickets.length})
            </div>
            {msg.similarTickets.map((ticket) => (
              <SimilarTicketCard
                key={ticket.id}
                ticket={ticket}
                onClick={() => handleTicketClick(ticket.id)}
              />
            ))}
            <Button
              size="small"
              type="primary"
              onClick={() => {
                const problem = messages
                  .filter((m) => m.role === "user")
                  .pop()?.content.replace("问题描述:", "")
                  .trim() || "";
                handleCreateTicket(problem);
              }}
              style={{
                marginTop: 8,
                background:
                  "linear-gradient(135deg, var(--accent-cyan) 0%, #0099cc 100%)",
                border: "none",
                borderRadius: 6,
              }}
            >
              创建工单
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Floating button */}
      <div
        onClick={handleToggle}
        style={{
          position: "fixed",
          right: 24,
          bottom: 16,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: isOpen
            ? isDark ? "rgba(22, 33, 62, 0.95)" : "rgba(255, 255, 255, 0.95)"
            : "linear-gradient(135deg, var(--accent-cyan) 0%, #0099cc 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: isOpen
            ? isDark ? "none" : "0 2px 10px rgba(0, 0, 0, 0.15)"
            : "0 4px 20px rgba(0, 212, 255, 0.4)",
          transition: "all 0.3s ease",
          zIndex: 1000,
          border: isOpen && !isDark ? "1px solid rgba(0, 0, 0, 0.1)" : "none",
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.transform = "scale(1.1)";
            e.currentTarget.style.boxShadow =
              "0 6px 30px rgba(0, 212, 255, 0.6)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow =
              "0 4px 20px rgba(0, 212, 255, 0.4)";
          }
        }}
      >
        {isOpen ? (
          <CloseOutlined style={{ color: isDark ? "var(--text-secondary)" : "#666", fontSize: 20 }} />
        ) : (
          <MessageOutlined style={{ color: "#fff", fontSize: 24 }} />
        )}
      </div>

      {/* Chat panel */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            right: 24,
            bottom: 88,
            width: 380,
            height: 520,
            background: isDark ? "rgba(26, 26, 46, 0.95)" : "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(12px)",
            border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
            borderRadius: 16,
            boxShadow: "0 8px 40px rgba(0, 0, 0, 0.4)",
            display: "flex",
            flexDirection: "column",
            zIndex: 999,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px 20px",
              borderBottom: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <MessageOutlined style={{ color: "var(--accent-cyan)", fontSize: 18 }} />
            <span style={{ color: "var(--accent-cyan)", fontWeight: 600, fontSize: 15 }}>
              智能客服
            </span>
          </div>

          {/* Messages area */}
          <div
            style={{
              flex: 1,
              overflow: "auto",
              padding: 16,
            }}
          >
            {messages.map((msg, index) => renderMessage(msg, index))}
            {loading && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: 12,
                    background: isDark ? "rgba(22, 33, 62, 0.8)" : "rgba(240, 242, 245, 0.95)",
                    border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
                  }}
                >
                  <Spin size="small" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div
            style={{
              padding: 16,
              borderTop: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
              background: isDark ? "rgba(22, 33, 62, 0.5)" : "rgba(240, 242, 245, 0.5)",
            }}
          >
            <div style={{ display: "flex", gap: 8 }}>
              <TextArea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onPressEnter={(e) => {
                  if (!e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="问题描述:您的问题内容"
                autoSize={{ minRows: 1, maxRows: 3 }}
                style={{
                  background: isDark ? "rgba(22, 33, 62, 0.8)" : "#ffffff",
                  border: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.15)",
                  borderRadius: 8,
                  color: "var(--text-primary)",
                  resize: "none",
                }}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSend}
                loading={loading}
                disabled={!inputValue.trim()}
                style={{
                  background: inputValue.trim()
                    ? "linear-gradient(135deg, var(--accent-cyan) 0%, #0099cc 100%)"
                    : isDark ? "rgba(22, 33, 62, 0.8)" : "rgba(240, 242, 245, 0.8)",
                  border: "none",
                  borderRadius: 8,
                  height: "auto",
                  alignSelf: "flex-end",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Similar Ticket Card Component
interface SimilarTicketCardProps {
  ticket: SimilarTicket;
  onClick: () => void;
}

const SimilarTicketCard: React.FC<SimilarTicketCardProps> = ({
  ticket,
  onClick,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <div
      onClick={onClick}
      style={{
        background: isDark ? "rgba(22, 33, 62, 0.6)" : "rgba(240, 242, 245, 0.8)",
        border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
        borderRadius: 8,
        padding: 10,
        marginBottom: 8,
        cursor: "pointer",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(0, 212, 255, 0.3)";
        e.currentTarget.style.background = isDark ? "rgba(22, 33, 62, 0.8)" : "rgba(240, 242, 245, 1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)";
        e.currentTarget.style.background = isDark ? "rgba(22, 33, 62, 0.6)" : "rgba(240, 242, 245, 0.8)";
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 6,
        }}
      >
        <span
          style={{ color: "var(--accent-cyan)", fontSize: 13, fontWeight: 500 }}
        >
          {ticket.id}
        </span>
        <span
          style={{
            color: "var(--accent-green)",
            fontSize: 12,
            background: "rgba(0, 255, 136, 0.1)",
            padding: "2px 8px",
            borderRadius: 10,
          }}
        >
          {(ticket.score * 100).toFixed(0)}% 相似
        </span>
      </div>
      <div
        style={{
          color: "var(--text-secondary)",
          fontSize: 12,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {ticket.description}
      </div>
    </div>
  );
};

export default SmartAssistant;
