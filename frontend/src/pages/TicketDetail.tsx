import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Tag,
  Spin,
  Alert,
  Row,
  Col,
  Image,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import { ticketsApi } from "../api";
import type { Ticket, TicketStatus } from "../types";
import { getCategoryLabel, formatDate } from "../utils";
import StatusBadge from "../components/StatusBadge";
import GlowButton from "../components/GlowButton";
import TechCard from "../components/TechCard";

const TicketDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchTicket(id);
    }
  }, [id]);

  const fetchTicket = async (ticketId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ticketsApi.get(ticketId);
      setTicket(data);
    } catch (err) {
      setError("加载工单失败");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="tech-loading-container">
        <Spin size="large" />
        <style>{`
          .tech-loading-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 400px;
            background: var(--bg-primary);
          }
          .tech-loading-container .ant-spin-dot-item {
            background-color: var(--accent-cyan) !important;
          }
        `}</style>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="tech-error-container">
        <Alert message={error || "工单不存在"} type="error" showIcon />
        <style>{`
          .tech-error-container {
            padding: 24px;
            background: var(--bg-primary);
          }
          .tech-error-container .ant-alert {
            background: rgba(255, 77, 79, 0.1) !important;
            border: 1px solid rgba(255, 77, 79, 0.3) !important;
            border-radius: 12px !important;
          }
        `}</style>
      </div>
    );
  }

  const canEdit = ticket.status !== "COMPLETED";

  return (
    <div className="tech-page-container">
      {/* 操作栏 */}
      <div className="tech-action-bar">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/tickets")}
          className="tech-back-btn"
        >
          返回列表
        </Button>
        {canEdit && (
          <GlowButton
            icon={<EditOutlined />}
            onClick={() => navigate(`/tickets/${id}/edit`)}
            glowColor="cyan"
          >
            编辑
          </GlowButton>
        )}
      </div>

      {/* 四宫格布局 */}
      <Row gutter={16}>
        {/* 左上角 - 元数据 */}
        <Col span={12}>
          <TechCard
            title={<span className="tech-card-title" style={{ color: "var(--accent-purple)" }}>元数据</span>}
            glowColor="purple"
            className="tech-card"
          >
            <div className="tech-info-list">
              <div className="tech-info-row">
                <span className="tech-info-label">工单号</span>
                <span className="tech-id">{ticket.id}</span>
              </div>
              <div className="tech-info-row">
                <span className="tech-info-label">状态</span>
                <StatusBadge status={ticket.status as TicketStatus} />
              </div>
              <div className="tech-info-row">
                <span className="tech-info-label">优先级</span>
                <span className="tech-priority" data-priority={ticket.priority}>
                  {ticket.priority}
                </span>
              </div>
              <div className="tech-info-row">
                <span className="tech-info-label">创建人</span>
                <span className="tech-info-value">{ticket.createdBy || "未知"}</span>
              </div>
              <div className="tech-info-row">
                <span className="tech-info-label">创建时间</span>
                <span className="tech-time">{formatDate(ticket.createdAt)}</span>
              </div>
              {ticket.tags && ticket.tags.length > 0 && (
                <div className="tech-info-row">
                  <span className="tech-info-label">标签</span>
                  <div className="tech-tags">
                    {ticket.tags.map((tag, index) => (
                      <Tag key={index} className="tech-tag">{tag}</Tag>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TechCard>
        </Col>

        {/* 右上角 - 基本信息 */}
        <Col span={12}>
          <TechCard
            title={<span className="tech-card-title">基本信息</span>}
            glowColor="cyan"
            className="tech-card"
          >
            <div className="tech-info-list">
              <div className="tech-info-row">
                <span className="tech-info-label">来源系统</span>
                <span className="tech-info-value">{ticket.systemSource}</span>
              </div>
              <div className="tech-info-row">
                <span className="tech-info-label">工单类型</span>
                <span className="tech-info-value">{getCategoryLabel(ticket.category)}</span>
              </div>
              <div className="tech-info-row">
                <span className="tech-info-label">处理类型</span>
                <span className="tech-info-value">{ticket.handleType}</span>
              </div>
            </div>
          </TechCard>
        </Col>

        {/* 左下角 - 问题描述 */}
        <Col span={12}>
          <TechCard
            title={<span className="tech-card-title" style={{ color: "var(--accent-green)" }}>问题描述</span>}
            glowColor="green"
            className="tech-card"
          >
            <div className="tech-section-content" style={{ minHeight: 80 }}>
              {ticket.description}
            </div>

            {ticket.images && ticket.images.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div className="tech-section-title">
                  <PictureOutlined style={{ marginRight: 6 }} />
                  截图
                </div>
                <Image.PreviewGroup>
                  <div className="tech-images">
                    {ticket.images.map((img) => (
                      <Image
                        key={img.id}
                        src={img.url}
                        alt={img.filename}
                        width={80}
                        height={80}
                        style={{ objectFit: "cover", borderRadius: 6 }}
                      />
                    ))}
                  </div>
                </Image.PreviewGroup>
              </div>
            )}
          </TechCard>
        </Col>

        {/* 右下角 - 处理详情 */}
        <Col span={12}>
          <TechCard
            title={<span className="tech-card-title" style={{ color: "var(--accent-magenta)" }}>处理详情</span>}
            glowColor="magenta"
            className="tech-card"
          >
            <div className="tech-section-content">
              {ticket.handleDetail || "暂无"}
            </div>
          </TechCard>
        </Col>
      </Row>

      <style>{`
        .tech-page-container {
          padding: 0;
          min-height: 100%;
          background: var(--bg-primary);
        }

        .tech-action-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .tech-back-btn {
          background: rgba(26, 26, 46, 0.8) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          color: var(--text-secondary) !important;
          border-radius: 8px !important;
        }

        .tech-back-btn:hover {
          border-color: var(--accent-cyan) !important;
          color: var(--accent-cyan) !important;
        }

        .tech-card {
          height: 100%;
        }

        .tech-card .ant-card-body {
          height: calc(100% - 57px);
        }

        .tech-card-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--accent-cyan);
        }

        .tech-info-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .tech-info-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }

        .tech-info-row:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .tech-info-label {
          color: var(--text-muted);
          font-size: 13px;
          flex-shrink: 0;
        }

        .tech-info-value {
          color: var(--text-primary);
          font-size: 13px;
          text-align: right;
        }

        .tech-id {
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          color: var(--accent-cyan);
        }

        .tech-time {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          color: var(--text-secondary);
        }

        .tech-priority {
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .tech-priority[data-priority="P0"] {
          background: rgba(255, 0, 110, 0.15);
          color: #ff006e;
        }

        .tech-priority[data-priority="P1"] {
          background: rgba(255, 183, 3, 0.15);
          color: #ffb703;
        }

        .tech-priority[data-priority="P2"] {
          background: rgba(0, 212, 255, 0.15);
          color: #00d4ff;
        }

        .tech-priority[data-priority="P3"] {
          background: rgba(0, 255, 136, 0.15);
          color: #00ff88;
        }

        .tech-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          justify-content: flex-end;
        }

        .tech-tag {
          background: rgba(0, 212, 255, 0.1) !important;
          border: 1px solid rgba(0, 212, 255, 0.3) !important;
          border-radius: 12px !important;
          color: var(--accent-cyan) !important;
          font-size: 11px !important;
          margin: 0 !important;
          padding: 1px 8px !important;
        }

        .tech-section {
          margin-bottom: 16px;
        }

        .tech-section:last-child {
          margin-bottom: 0;
        }

        .tech-section-title {
          color: var(--text-muted);
          font-size: 12px;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
        }

        .tech-section-content {
          color: var(--text-secondary);
          font-size: 13px;
          line-height: 1.6;
          white-space: pre-wrap;
        }

        .tech-images {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
      `}</style>
    </div>
  );
};

export default TicketDetail;
