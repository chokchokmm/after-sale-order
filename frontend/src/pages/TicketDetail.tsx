import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
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
  Dropdown,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  VerifiedOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { ticketsApi } from "../api";
import type { Ticket } from "../types";
import { statusConfig, priorityConfig, getCategoryLabel, formatDate } from "../utils";
import type { TicketStatus, MenuProps } from "antd";

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

  const handleClose = async () => {
    if (!id) return;
    try {
      await ticketsApi.close(id);
      message.success("工单已关闭");
      fetchTicket(id);
    } catch (err) {
      message.error("关闭失败");
      console.error(err);
    }
  };

  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (!id) return;
    try {
      await ticketsApi.update(id, { status: newStatus });
      const statusLabels: Record<TicketStatus, string> = {
        OPEN: "待处理",
        PROCESSING: "处理中",
        CLOSED: "已关闭",
        VERIFIED: "已验证",
      };
      message.success(`状态已更新为：${statusLabels[newStatus]}`);
      fetchTicket(id);
    } catch (err) {
      message.error("状态更新失败");
      console.error(err);
    }
  };

  const getStatusActions = (): MenuProps['items'] => {
    const items: MenuProps['items'] = [];

    if (ticket.status === "OPEN") {
      items.push({
        key: 'start',
        label: '开始处理',
        icon: <PlayCircleOutlined />,
        onClick: () => handleStatusChange("PROCESSING"),
      });
    }

    if (ticket.status === "PROCESSING") {
      items.push({
        key: 'complete',
        label: '完成处理',
        icon: <CheckCircleOutlined />,
        onClick: () => handleStatusChange("CLOSED"),
      });
    }

    if (ticket.status === "CLOSED") {
      items.push({
        key: 'verify',
        label: '验证通过',
        icon: <VerifiedOutlined />,
        onClick: () => handleStatusChange("VERIFIED"),
      });
    }

    if (ticket.status !== "CLOSED" && ticket.status !== "VERIFIED") {
      items.push({
        type: 'divider',
      });
      items.push({
        key: 'close',
        label: '关闭工单',
        icon: <CloseCircleOutlined />,
        danger: true,
        onClick: handleClose,
      });
    }

    return items;
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await ticketsApi.delete(id);
      message.success("删除成功");
      navigate("/tickets");
    } catch (err) {
      message.error("删除失败");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error || !ticket) {
    return <Alert message={error || "工单不存在"} type="error" showIcon />;
  }

  const canEdit = ticket.status !== "CLOSED" && ticket.status !== "VERIFIED";
  const showStatusActions = ticket.status === "OPEN" || ticket.status === "PROCESSING" || ticket.status === "CLOSED";

  // 根据状态显示主要操作按钮
  const getPrimaryActionButton = () => {
    switch (ticket.status) {
      case "OPEN":
        return (
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={() => handleStatusChange("PROCESSING")}
          >
            开始处理
          </Button>
        );
      case "PROCESSING":
        return (
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={() => handleStatusChange("CLOSED")}
          >
            完成处理
          </Button>
        );
      case "CLOSED":
        return (
          <Button
            type="primary"
            icon={<VerifiedOutlined />}
            onClick={() => handleStatusChange("VERIFIED")}
          >
            验证通过
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/tickets")}
        >
          返回列表
        </Button>
        {getPrimaryActionButton()}
        {showStatusActions && (
          <Dropdown menu={{ items: getStatusActions() }} placement="bottomLeft">
            <Button icon={<MoreOutlined />}>
              更多操作
            </Button>
          </Dropdown>
        )}
        {canEdit && (
          <Button
            icon={<EditOutlined />}
            onClick={() => navigate(`/tickets/${id}/edit`)}
          >
            编辑
          </Button>
        )}
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={handleDelete}
        >
          删除
        </Button>
      </Space>

      <Row gutter={16}>
        <Col span={16}>
          <Card title="工单详情">
            <Descriptions column={2} bordered>
              <Descriptions.Item label="工单 ID" span={2}>
                {ticket.id}
              </Descriptions.Item>

              <Descriptions.Item label="来源系统">
                <Tag>{ticket.systemSource}</Tag>
              </Descriptions.Item>

              <Descriptions.Item label="工单类型">
                {getCategoryLabel(ticket.category)}
              </Descriptions.Item>

              <Descriptions.Item label="处理类型">
                <Tag color="blue">{ticket.handleType}</Tag>
              </Descriptions.Item>

              <Descriptions.Item label="优先级">
                <Tag color={priorityConfig[ticket.priority].color}>
                  {priorityConfig[ticket.priority].label}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="状态">
                <Tag color={statusConfig[ticket.status].color}>
                  {statusConfig[ticket.status].label}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="创建时间" span={2}>
                {formatDate(ticket.createdAt)}
              </Descriptions.Item>

              {ticket.updatedAt && ticket.updatedAt !== ticket.createdAt && (
                <Descriptions.Item label="更新时间" span={2}>
                  {formatDate(ticket.updatedAt)}
                </Descriptions.Item>
              )}

              {ticket.closedAt && (
                <Descriptions.Item label="关闭时间" span={2}>
                  {formatDate(ticket.closedAt)}
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider />

            <div style={{ marginTop: 16 }}>
              <h4>问题描述</h4>
              <p style={{ whiteSpace: "pre-wrap" }}>{ticket.description}</p>
            </div>

            <Divider />

            <div style={{ marginTop: 16 }}>
              <h4>处理详情</h4>
              <p style={{ whiteSpace: "pre-wrap" }}>{ticket.handleDetail}</p>
            </div>

            {ticket.solutionTemplate && (
              <>
                <Divider />
                <div style={{ marginTop: 16 }}>
                  <h4>解决方案模板</h4>
                  <p style={{ whiteSpace: "pre-wrap" }}>{ticket.solutionTemplate}</p>
                </div>
              </>
            )}

            {ticket.tags && ticket.tags.length > 0 && (
              <>
                <Divider />
                <div style={{ marginTop: 16 }}>
                  <h4>标签</h4>
                  <Space wrap>
                    {ticket.tags.map((tag, index) => (
                      <Tag key={index}>{tag}</Tag>
                    ))}
                  </Space>
                </div>
              </>
            )}
          </Card>
        </Col>

        <Col span={8}>
          <Card title="元数据" style={{ marginBottom: 16 }}>
            <Descriptions column={1} size="small">
              {ticket.createdBy && (
                <Descriptions.Item label="创建人">
                  {ticket.createdBy}
                </Descriptions.Item>
              )}
              {ticket.assignedTo && (
                <Descriptions.Item label="指派人">
                  {ticket.assignedTo}
                </Descriptions.Item>
              )}
              {ticket.aiMetadata && ticket.aiMetadata.keywords.length > 0 && (
                <Descriptions.Item label="AI 关键词">
                  <Space wrap>
                    {ticket.aiMetadata.keywords.map((keyword, index) => (
                      <Tag key={index} color="purple">
                        {keyword}
                      </Tag>
                    ))}
                  </Space>
                </Descriptions.Item>
              )}
              {ticket.aiMetadata && ticket.aiMetadata.similarTickets.length > 0 && (
                <Descriptions.Item label="相似工单">
                  {ticket.aiMetadata.similarTickets.map((similarId) => (
                    <Tag key={similarId}>{similarId.slice(-8)}</Tag>
                  ))}
                </Descriptions.Item>
              )}
              {ticket.aiMetadata && ticket.aiMetadata.suggestedSolution && (
                <Descriptions.Item label="AI 建议方案">
                  {ticket.aiMetadata.suggestedSolution}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TicketDetail;
