import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Descriptions,
  Button,
  Space,
  Tag,
  message,
  Spin,
  Alert,
  Row,
  Col,
  Divider,
  Image,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  RobotOutlined,
  TagsOutlined,
  LinkOutlined,
  BulbOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import { ticketsApi } from "../api";
import type { Ticket, TicketStatus, TicketPriority } from "../types";
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
        <div className="tech-spinner">
          <Spin size="large" />
        </div>
        <style>{`
          .tech-loading-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 400px;
            background: var(--bg-primary);
          }
          .tech-spinner .ant-spin-dot-item {
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
            min-height: 100%;
          }
          .tech-error-container .ant-alert {
            background: rgba(255, 77, 79, 0.1) !important;
            border: 1px solid rgba(255, 77, 79, 0.3) !important;
            border-radius: var(--radius-md) !important;
          }
          .tech-error-container .ant-alert-message {
            color: #ff4d4f !important;
          }
        `}</style>
      </div>
    );
  }

  const canEdit = ticket.status !== "COMPLETED";

  return (
    <div className="tech-page-container">
      {/* Action Buttons Header */}
      <div className="tech-detail-header">
        <Space size="middle">
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
        </Space>
      </div>

      <Row gutter={16}>
        <Col span={16}>
          <TechCard
            title={<span className="tech-card-title">工单详情</span>}
            glowColor="cyan"
            className="tech-detail-card"
            headStyle={{
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <Descriptions column={2} className="tech-descriptions">
              <Descriptions.Item label="工单 ID" span={2}>
                <span className="tech-id-text">{ticket.id}</span>
              </Descriptions.Item>

              <Descriptions.Item label="来源系统">
                <span className="tech-source-badge">{ticket.systemSource}</span>
              </Descriptions.Item>

              <Descriptions.Item label="工单类型">
                <span className="tech-value-text">{getCategoryLabel(ticket.category)}</span>
              </Descriptions.Item>

              <Descriptions.Item label="处理类型">
                <span className="tech-handle-type-badge">{ticket.handleType}</span>
              </Descriptions.Item>

              <Descriptions.Item label="优先级">
                <StatusBadge priority={ticket.priority as TicketPriority} />
              </Descriptions.Item>

              <Descriptions.Item label="状态">
                <StatusBadge
                  status={ticket.status as TicketStatus}
                  animated={ticket.status === "PROCESSING"}
                />
              </Descriptions.Item>

              <Descriptions.Item label="创建时间" span={2}>
                <span className="tech-time-text">{formatDate(ticket.createdAt)}</span>
              </Descriptions.Item>

              {ticket.updatedAt && ticket.updatedAt !== ticket.createdAt && (
                <Descriptions.Item label="更新时间" span={2}>
                  <span className="tech-time-text">{formatDate(ticket.updatedAt)}</span>
                </Descriptions.Item>
              )}

              {ticket.closedAt && (
                <Descriptions.Item label="关闭时间" span={2}>
                  <span className="tech-time-text">{formatDate(ticket.closedAt)}</span>
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider className="tech-divider" />

            <div className="tech-section">
              <h4 className="tech-section-title">问题描述</h4>
              <p className="tech-description-text">{ticket.description}</p>
            </div>

            {/* Images Section */}
            {ticket.images && ticket.images.length > 0 && (
              <>
                <Divider className="tech-divider" />
                <div className="tech-section">
                  <h4 className="tech-section-title">
                    <PictureOutlined style={{ marginRight: 8 }} />
                    截图
                  </h4>
                  <Image.PreviewGroup>
                    <div className="tech-images-container">
                      {ticket.images.map((img) => (
                        <Image
                          key={img.id}
                          src={img.url}
                          alt={img.filename}
                          width={100}
                          height={100}
                          className="tech-image-item"
                          style={{ objectFit: 'cover', borderRadius: 8 }}
                        />
                      ))}
                    </div>
                  </Image.PreviewGroup>
                </div>
              </>
            )}

            {ticket.status !== "OPEN" && (
              <>
                <Divider className="tech-divider" />
                <div className="tech-section">
                  <h4 className="tech-section-title">处理详情</h4>
                  <p className="tech-description-text">
                    {ticket.handleDetail || "暂无处理详情"}
                  </p>
                </div>
              </>
            )}

            {ticket.solutionTemplate && (
              <>
                <Divider className="tech-divider" />
                <div className="tech-section">
                  <h4 className="tech-section-title">解决方案模板</h4>
                  <p className="tech-description-text">{ticket.solutionTemplate}</p>
                </div>
              </>
            )}

            {ticket.tags && ticket.tags.length > 0 && (
              <>
                <Divider className="tech-divider" />
                <div className="tech-section">
                  <h4 className="tech-section-title">
                    <TagsOutlined style={{ marginRight: 8 }} />
                    标签
                  </h4>
                  <div className="tech-tags-container">
                    {ticket.tags.map((tag, index) => (
                      <Tag key={index} className="tech-glow-tag">
                        {tag}
                      </Tag>
                    ))}
                  </div>
                </div>
              </>
            )}
          </TechCard>
        </Col>

        <Col span={8}>
          <TechCard
            title={<span className="tech-card-title tech-card-title-purple">元数据</span>}
            glowColor="purple"
            className="tech-detail-card"
            style={{ marginBottom: 16 }}
            headStyle={{
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <Descriptions column={1} size="small" className="tech-descriptions">
              {ticket.createdBy && (
                <Descriptions.Item label="创建人">
                  <span className="tech-value-text">{ticket.createdBy}</span>
                </Descriptions.Item>
              )}
              {ticket.assignedTo && (
                <Descriptions.Item label="指派人">
                  <span className="tech-value-text">{ticket.assignedTo}</span>
                </Descriptions.Item>
              )}
            </Descriptions>
          </TechCard>

          {/* T030: AI Metadata Section with distinctive styling */}
          {ticket.aiMetadata && (
            <TechCard
              title={
                <span className="tech-card-title tech-card-title-magenta">
                  <RobotOutlined style={{ marginRight: 8 }} />
                  AI 智能分析
                </span>
              }
              glowColor="magenta"
              className="tech-detail-card tech-ai-card"
              headStyle={{
                borderBottom: "1px solid rgba(255, 0, 110, 0.2)",
              }}
            >
              {ticket.aiMetadata.keywords.length > 0 && (
                <div className="tech-ai-section">
                  <div className="tech-ai-section-header">
                    <TagsOutlined className="tech-ai-icon" />
                    <span>关键词</span>
                  </div>
                  <div className="tech-ai-keywords">
                    {ticket.aiMetadata.keywords.map((keyword, index) => (
                      <Tag key={index} className="tech-ai-keyword-tag">
                        {keyword}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}

              {ticket.aiMetadata.similarTickets.length > 0 && (
                <div className="tech-ai-section">
                  <div className="tech-ai-section-header">
                    <LinkOutlined className="tech-ai-icon" />
                    <span>相似工单</span>
                  </div>
                  <div className="tech-ai-similar">
                    {ticket.aiMetadata.similarTickets.map((similarId) => (
                      <Button
                        key={similarId}
                        type="link"
                        size="small"
                        onClick={() => navigate(`/tickets/${similarId}`)}
                        className="tech-similar-ticket-link"
                      >
                        {similarId.slice(-8)}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {ticket.aiMetadata.suggestedSolution && (
                <div className="tech-ai-section">
                  <div className="tech-ai-section-header">
                    <BulbOutlined className="tech-ai-icon" />
                    <span>AI 建议方案</span>
                  </div>
                  <p className="tech-ai-suggestion">
                    {ticket.aiMetadata.suggestedSolution}
                  </p>
                </div>
              )}
            </TechCard>
          )}
        </Col>
      </Row>

      {/* Custom styles for tech-themed TicketDetail */}
      <style>{`
        /* T026: Page Container Dark Background */
        .tech-page-container {
          padding: 0;
          min-height: 100%;
          background: var(--bg-primary);
        }

        /* Header Section */
        .tech-detail-header {
          margin-bottom: 16px;
        }

        .tech-back-btn {
          background: rgba(22, 33, 62, 0.6) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          color: var(--text-secondary) !important;
          border-radius: var(--radius-sm) !important;
          transition: all 0.3s ease;
        }

        .tech-back-btn:hover {
          border-color: var(--accent-cyan) !important;
          color: var(--accent-cyan) !important;
          box-shadow: 0 0 15px rgba(0, 212, 255, 0.2);
        }

        /* T027: TechCard Styling */
        .tech-detail-card {
          background: rgba(26, 26, 46, 0.6) !important;
        }

        .tech-detail-card .ant-card-head {
          background: transparent !important;
        }

        .tech-detail-card .ant-card-body {
          background: transparent !important;
        }

        /* Card Title */
        .tech-card-title {
          color: var(--accent-cyan);
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .tech-card-title-purple {
          color: var(--accent-purple);
        }

        .tech-card-title-magenta {
          color: var(--accent-magenta);
        }

        /* T028: Descriptions Styling */
        .tech-descriptions .ant-descriptions-item-label {
          color: var(--text-muted) !important;
          font-weight: 500;
        }

        .tech-descriptions .ant-descriptions-item-content {
          color: var(--text-primary) !important;
        }

        .tech-descriptions .ant-descriptions-row:hover {
          background: rgba(0, 212, 255, 0.02) !important;
        }

        /* Text Styles */
        .tech-id-text {
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-weight: 500;
          color: var(--accent-cyan);
          font-size: 14px;
        }

        .tech-value-text {
          color: var(--text-primary);
        }

        .tech-time-text {
          color: var(--text-secondary);
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
        }

        .tech-source-badge {
          background: rgba(0, 212, 255, 0.1);
          border: 1px solid rgba(0, 212, 255, 0.3);
          border-radius: 8px;
          padding: 2px 10px;
          color: var(--accent-cyan);
          font-size: 12px;
        }

        .tech-handle-type-badge {
          background: rgba(123, 44, 191, 0.1);
          border: 1px solid rgba(123, 44, 191, 0.3);
          border-radius: 8px;
          padding: 2px 10px;
          color: var(--accent-magenta);
          font-size: 12px;
        }

        /* T031: Divider and Section Headings */
        .tech-divider {
          border-color: rgba(255, 255, 255, 0.08) !important;
          margin: 20px 0;
        }

        .tech-divider::after {
          content: '';
          display: block;
          width: 50px;
          height: 2px;
          background: linear-gradient(90deg, var(--accent-cyan), transparent);
          margin-top: -1px;
        }

        .tech-section {
          margin-top: 16px;
        }

        .tech-section-title {
          color: var(--accent-cyan);
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          letter-spacing: 0.5px;
        }

        .tech-description-text {
          color: var(--text-secondary);
          white-space: pre-wrap;
          line-height: 1.6;
        }

        /* Tags Container */
        .tech-tags-container {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .tech-glow-tag {
          background: rgba(0, 212, 255, 0.1) !important;
          border: 1px solid rgba(0, 212, 255, 0.3) !important;
          border-radius: 16px !important;
          padding: 4px 12px !important;
          color: var(--accent-cyan) !important;
          font-size: 13px;
          margin: 0 !important;
          transition: all 0.3s ease;
        }

        .tech-glow-tag:hover {
          box-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
          transform: translateY(-1px);
        }

        /* T030: AI Metadata Section */
        .tech-ai-card {
          background: rgba(26, 26, 46, 0.6) !important;
          border: 1px solid rgba(255, 0, 110, 0.2) !important;
          box-shadow: 0 0 5px rgba(255, 0, 110, 0.2), 0 4px 30px rgba(0, 0, 0, 0.3) !important;
        }

        .tech-ai-section {
          margin-bottom: 16px;
        }

        .tech-ai-section:last-child {
          margin-bottom: 0;
        }

        .tech-ai-section-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          color: var(--accent-magenta);
          font-size: 13px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .tech-ai-icon {
          font-size: 14px;
        }

        .tech-ai-keywords {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .tech-ai-keyword-tag {
          background: rgba(255, 0, 110, 0.1) !important;
          border: 1px solid rgba(255, 0, 110, 0.3) !important;
          border-radius: 8px !important;
          padding: 2px 10px !important;
          color: var(--accent-magenta) !important;
          font-size: 12px;
          margin: 0 !important;
        }

        .tech-ai-similar {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }

        .tech-similar-ticket-link {
          color: var(--accent-magenta) !important;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          padding: 2px 8px !important;
          height: auto !important;
          background: rgba(255, 0, 110, 0.1) !important;
          border: 1px solid rgba(255, 0, 110, 0.2) !important;
          border-radius: 6px !important;
          transition: all 0.3s ease;
        }

        .tech-similar-ticket-link:hover {
          background: rgba(255, 0, 110, 0.2) !important;
          box-shadow: 0 0 10px rgba(255, 0, 110, 0.3);
          text-shadow: 0 0 8px rgba(255, 0, 110, 0.5);
        }

        .tech-ai-suggestion {
          color: var(--text-secondary);
          font-size: 13px;
          line-height: 1.6;
          padding: 10px 12px;
          background: rgba(255, 0, 110, 0.05);
          border-left: 3px solid var(--accent-magenta);
          border-radius: 0 8px 8px 0;
          margin: 0;
        }

        /* Images Section */
        .tech-images-container {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .tech-image-item {
          border: 1px solid rgba(255, 255, 255, 0.1);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .tech-image-item:hover {
          border-color: var(--accent-cyan) !important;
          box-shadow: 0 0 15px rgba(0, 212, 255, 0.3);
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
};

export default TicketDetail;
