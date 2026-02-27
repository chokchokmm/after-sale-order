import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import {
  Table,
  Button,
  Space,
  Input,
  Select,
  message,
  Card,
  Row,
  Col,
  Dropdown,
} from "antd";
import type { ColumnsType, TablePaginationConfig, MenuProps } from "antd/es/table";
import {
  PlusOutlined,
  EyeOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { ticketsApi } from "../api";
import type { Ticket, TicketListParams, TicketPriority, TicketStatus } from "../types";
import { getCategoryLabel, formatDate } from "../utils";
import StatusBadge from "../components/StatusBadge";
import GlowButton from "../components/GlowButton";

const { Search } = Input;
const { Option } = Select;

// Neon colors for consistent styling
const NEON_COLORS = {
  cyan: "#00d4ff",
  magenta: "#ff006e",
  green: "#00ff88",
  amber: "#ffb703",
};

const TicketList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState(0);
  const [params, setParams] = useState<TicketListParams>({
    page: 1,
    pageSize: 10,
  });
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [initialized, setInitialized] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const statusParam = searchParams.get("status");

    if (statusParam) {
      const newStatus = statusParam.includes(",") ? statusParam.split(",")[0] : statusParam;
      setParams(prev => ({
        ...prev,
        status: newStatus as TicketStatus,
      }));
      setStatusFilter(newStatus);
    }
    setInitialized(true);
  }, [location.search]);

  useEffect(() => {
    if (initialized) {
      if (statusFilter) {
        setParams(prev => ({
          ...prev,
          status: statusFilter as TicketStatus,
        }));
      }
    }
  }, [statusFilter, initialized]);

  useEffect(() => {
    if (initialized) {
      fetchTickets();
    }
  }, [params, initialized]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await ticketsApi.list(params);
      setTickets(response.items);
      setTotal(response.total);
    } catch (err) {
      message.error("加载工单列表失败");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (actionLoading) return;
    try {
      setActionLoading(id);
      await ticketsApi.delete(id);
      message.success("删除成功");
      fetchTickets();
    } catch (err) {
      message.error("删除失败");
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusChange = async (id: string, newStatus: TicketStatus) => {
    if (actionLoading) return;
    try {
      setActionLoading(id);
      await ticketsApi.update(id, { status: newStatus });
      const statusLabels: Record<TicketStatus, string> = {
        OPEN: "待处理",
        PROCESSING: "处理中",
        COMPLETED: "已完成",
      };
      message.success(`状态已更新为：${statusLabels[newStatus]}`);
      fetchTickets();
    } catch (err) {
      message.error("状态更新失败");
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = (record: Ticket) => {
    if (actionLoading) return;
    if (!record.handleDetail || record.handleDetail.trim() === "") {
      message.warning("请先填写处理详情后再完成工单");
      navigate(`/tickets/${record.id}/edit`);
      return;
    }
    handleStatusChange(record.id, "COMPLETED");
  };

  const getStatusActions = (record: Ticket): MenuProps['items'] => {
    const items: MenuProps['items'] = [];
    items.push({
      key: 'delete',
      label: '删除',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => handleDelete(record.id),
    });
    return items;
  };

  const getStatusButton = (record: Ticket) => {
    const isLoading = actionLoading === record.id;
    switch (record.status) {
      case "OPEN":
        return (
          <Button
            type="link"
            size="small"
            icon={<PlayCircleOutlined />}
            onClick={() => handleStatusChange(record.id, "PROCESSING")}
            className="tech-action-btn tech-action-btn-cyan"
            loading={isLoading}
            disabled={!!actionLoading}
          >
            开始处理
          </Button>
        );
      case "PROCESSING":
        return (
          <Button
            type="link"
            size="small"
            icon={<CheckCircleOutlined />}
            onClick={() => handleComplete(record)}
            className="tech-action-btn tech-action-btn-green"
            loading={isLoading}
            disabled={!!actionLoading}
          >
            完成
          </Button>
        );
      default:
        return null;
    }
  };

  const handleSearch = (value: string) => {
    setParams((prev) => ({ ...prev, search: value || undefined, page: 1 }));
  };

  const handleFilterChange = (key: string, value: string | undefined) => {
    setParams((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: 1,
    }));
  };

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setParams((prev) => ({
      ...prev,
      page: pagination.current || 1,
      pageSize: pagination.pageSize || 10,
    }));
  };

  const columns: ColumnsType<Ticket> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 140,
      render: (id) => (
        <span className="tech-id-cell">
          {id}
        </span>
      ),
    },
    {
      title: "来源系统",
      dataIndex: "systemSource",
      key: "systemSource",
      width: 100,
      render: (value) => (
        <span className="tech-source-badge">
          {value}
        </span>
      ),
    },
    {
      title: "类型",
      dataIndex: "category",
      key: "category",
      width: 120,
      render: (value) => <span style={{ color: "var(--text-primary)" }}>{getCategoryLabel(value)}</span>,
    },
    {
      title: "描述",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (value) => <span style={{ color: "var(--text-secondary)" }}>{value}</span>,
    },
    {
      title: "处理类型",
      dataIndex: "handleType",
      key: "handleType",
      width: 120,
      render: (value) => (
        <span className="tech-handle-type-badge">
          {value}
        </span>
      ),
    },
    {
      title: "优先级",
      dataIndex: "priority",
      key: "priority",
      width: 80,
      render: (value: TicketPriority) => (
        <StatusBadge priority={value} />
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (value: TicketStatus) => (
        <StatusBadge status={value} animated={value === "PROCESSING"} />
      ),
    },
    {
      title: "创建人",
      dataIndex: "createdBy",
      key: "createdBy",
      width: 100,
      render: (value) => (
        <span className="tech-creator-cell">
          {value || "未知"}
        </span>
      ),
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 160,
      render: (value) => (
        <span className="tech-time-cell">
          {formatDate(value)}
        </span>
      ),
    },
    {
      title: "操作",
      key: "action",
      width: 200,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/tickets/${record.id}`)}
            className="tech-action-btn tech-action-btn-cyan"
          >
            查看
          </Button>
          {getStatusButton(record)}
          <Dropdown menu={{ items: getStatusActions(record) }} placement="bottomLeft" disabled={!!actionLoading}>
            <Button
              type="link"
              size="small"
              icon={<MoreOutlined />}
              className="tech-action-btn tech-action-btn-cyan"
              disabled={!!actionLoading}
            >
              更多
            </Button>
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <div className="tech-page-container">
      <Card
        title={
          <span className="tech-card-title">
            工单列表
          </span>
        }
        extra={
          <GlowButton
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/tickets/new")}
            glowColor="cyan"
            gradient
          >
            新建工单
          </GlowButton>
        }
        className="tech-glass-card"
      >
        {/* Filter Controls */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Search
              placeholder="搜索描述"
              onSearch={handleSearch}
              enterButton
              allowClear
              className="tech-search-input"
            />
          </Col>
          <Col span={4}>
            <Input
              placeholder="创建人"
              value={params.createdBy}
              onChange={(e) => handleFilterChange("createdBy", e.target.value || undefined)}
              allowClear
              className="tech-creator-input"
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="来源系统"
              allowClear
              value={params.systemSource}
              style={{ width: "100%" }}
              onChange={(value) => handleFilterChange("systemSource", value)}
              className="tech-select"
              popupClassName="tech-select-dropdown"
            >
              <Option value="TMS">TMS</Option>
              <Option value="OMS">OMS</Option>
              <Option value="WMS">WMS</Option>
            </Select>
          </Col>
          <Col span={3}>
            <Select
              placeholder="工单类型"
              allowClear
              value={params.category}
              style={{ width: "100%" }}
              onChange={(value) => handleFilterChange("category", value)}
              className="tech-select"
              popupClassName="tech-select-dropdown"
            >
              <Option value="TICKET_PROCESS">工单处理</Option>
              <Option value="SYSTEM_FAILURE">系统故障</Option>
              <Option value="COST_OPTIMIZATION">系统提升</Option>
            </Select>
          </Col>
          <Col span={3}>
            <Select
              placeholder="状态"
              allowClear
              value={statusFilter || undefined}
              style={{ width: "100%" }}
              onChange={(value) => {
                setStatusFilter(value || "");
                handleFilterChange("status", value);
              }}
              className="tech-select"
              popupClassName="tech-select-dropdown"
            >
              <Option value="OPEN">待处理</Option>
              <Option value="PROCESSING">处理中</Option>
              <Option value="COMPLETED">已完成</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="优先级"
              allowClear
              value={params.priority}
              style={{ width: "100%" }}
              onChange={(value) => handleFilterChange("priority", value)}
              className="tech-select"
              popupClassName="tech-select-dropdown"
            >
              <Option value="HIGH">高</Option>
              <Option value="MEDIUM">中</Option>
              <Option value="LOW">低</Option>
            </Select>
          </Col>
        </Row>

        {/* Tech-styled Table */}
        <Table
          columns={columns}
          dataSource={tickets}
          rowKey="id"
          loading={loading}
          pagination={{
            current: params.page,
            pageSize: params.pageSize,
            total,
            showSizeChanger: true,
            showTotal: (total) => <span className="tech-pagination-total">共 {total} 条</span>,
            className: "tech-pagination",
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
          className="tech-table"
          rowClassName={(_, index) =>
            index % 2 === 0 ? "tech-table-row-even" : "tech-table-row-odd"
          }
        />
      </Card>

      {/* Custom styles for tech-themed TicketList */}
      <style>{`
        /* T019: Page Container Dark Background */
        .tech-page-container {
          padding: 0;
          min-height: 100%;
          background: var(--bg-primary);
        }

        /* T023: Glass-morphism Card */
        .tech-glass-card {
          background: rgba(26, 26, 46, 0.6) !important;
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          border-radius: var(--radius-lg) !important;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3),
                      inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .tech-glass-card .ant-card-head {
          border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
          background: transparent !important;
        }

        .tech-glass-card .ant-card-body {
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

        /* T022: Search Input Styling */
        .tech-search-input .ant-input {
          background: rgba(22, 33, 62, 0.8) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          color: var(--text-primary) !important;
          border-radius: var(--radius-sm) !important;
          transition: all 0.3s ease;
        }

        .tech-search-input .ant-input:focus,
        .tech-search-input .ant-input:hover {
          border-color: var(--accent-cyan) !important;
          box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.1),
                      0 0 15px rgba(0, 212, 255, 0.2) !important;
        }

        .tech-search-input .ant-input::placeholder {
          color: var(--text-muted) !important;
        }

        .tech-search-input .ant-input-search-button {
          background: linear-gradient(135deg, var(--accent-cyan), var(--accent-purple)) !important;
          border: none !important;
          box-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
        }

        .tech-search-input .ant-input-search-button:hover {
          box-shadow: 0 0 20px rgba(0, 212, 255, 0.5) !important;
          transform: translateY(-1px);
        }

        /* T022: Select Dropdown Styling */
        .tech-select .ant-select-selector {
          background: rgba(22, 33, 62, 0.8) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          color: var(--text-primary) !important;
          border-radius: var(--radius-sm) !important;
          transition: all 0.3s ease;
        }

        .tech-select:hover .ant-select-selector,
        .tech-select-focused .ant-select-selector {
          border-color: var(--accent-cyan) !important;
          box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.1),
                      0 0 15px rgba(0, 212, 255, 0.2) !important;
        }

        .tech-select .ant-select-selection-placeholder {
          color: var(--text-muted) !important;
        }

        .tech-select .ant-select-arrow {
          color: var(--text-secondary);
        }

        .tech-select-dropdown {
          background: rgba(22, 33, 62, 0.95) !important;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: var(--radius-sm) !important;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4) !important;
        }

        .tech-select-dropdown .ant-select-item {
          color: var(--text-primary) !important;
          transition: all 0.2s ease;
        }

        .tech-select-dropdown .ant-select-item-option-active {
          background: rgba(0, 212, 255, 0.1) !important;
        }

        .tech-select-dropdown .ant-select-item-option-selected {
          background: rgba(0, 212, 255, 0.2) !important;
          color: var(--accent-cyan) !important;
        }

        /* T020: Table Styling */
        .tech-table {
          background: transparent !important;
        }

        .tech-table .ant-table-thead > tr > th {
          background: rgba(22, 33, 62, 0.6) !important;
          color: var(--text-secondary) !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
          font-weight: 500;
          text-transform: uppercase;
          font-size: 12px;
          letter-spacing: 0.5px;
        }

        .tech-table-row-even td {
          background: rgba(26, 26, 46, 0.3) !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
          transition: all 0.3s ease;
        }

        .tech-table-row-odd td {
          background: rgba(22, 33, 62, 0.3) !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
          transition: all 0.3s ease;
        }

        .tech-table-row-even:hover td,
        .tech-table-row-odd:hover td {
          background: rgba(0, 212, 255, 0.08) !important;
          box-shadow: inset 0 0 0 1px rgba(0, 212, 255, 0.15);
        }

        /* Table Cell Styles */
        .tech-id-cell {
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-weight: 500;
          color: var(--accent-cyan);
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

        .tech-time-cell {
          color: var(--text-secondary);
          font-size: 13px;
          font-family: 'JetBrains Mono', monospace;
        }

        .tech-creator-cell {
          color: var(--text-primary);
          font-size: 13px;
        }

        /* Creator Filter Input */
        .tech-creator-input {
          background: rgba(22, 33, 62, 0.8) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          color: var(--text-primary) !important;
          border-radius: var(--radius-sm) !important;
          transition: all 0.3s ease;
        }

        .tech-creator-input:focus,
        .tech-creator-input:hover {
          border-color: var(--accent-cyan) !important;
          box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.1),
                      0 0 15px rgba(0, 212, 255, 0.2) !important;
        }

        .tech-creator-input::placeholder {
          color: var(--text-muted) !important;
        }

        /* T024: Action Button Styling */
        .tech-action-btn {
          color: var(--text-secondary) !important;
          transition: all 0.3s ease !important;
        }

        .tech-action-btn-cyan:hover {
          color: var(--accent-cyan) !important;
          text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
        }

        .tech-action-btn-green:hover {
          color: var(--accent-green) !important;
          text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
        }

        /* T025: Pagination Styling */
        .tech-pagination .ant-pagination-item {
          background: rgba(22, 33, 62, 0.6) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: var(--radius-sm) !important;
        }

        .tech-pagination .ant-pagination-item a {
          color: var(--text-secondary) !important;
        }

        .tech-pagination .ant-pagination-item:hover,
        .tech-pagination .ant-pagination-item-active {
          border-color: var(--accent-cyan) !important;
          background: rgba(0, 212, 255, 0.1) !important;
        }

        .tech-pagination .ant-pagination-item:hover a,
        .tech-pagination .ant-pagination-item-active a {
          color: var(--accent-cyan) !important;
        }

        .tech-pagination .ant-pagination-prev,
        .tech-pagination .ant-pagination-next {
          color: var(--text-secondary) !important;
        }

        .tech-pagination .ant-pagination-prev:hover .ant-pagination-item-link,
        .tech-pagination .ant-pagination-next:hover .ant-pagination-item-link {
          color: var(--accent-cyan) !important;
          background: rgba(0, 212, 255, 0.1) !important;
          border-color: var(--accent-cyan) !important;
        }

        .tech-pagination .ant-pagination-options .ant-select-selector {
          background: rgba(22, 33, 62, 0.6) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }

        .tech-pagination-total {
          color: var(--text-secondary);
          font-size: 13px;
        }

        /* Empty State */
        .tech-table .ant-empty-description {
          color: var(--text-muted) !important;
        }

        /* Loading State */
        .tech-table .ant-spin-dot-item {
          background-color: var(--accent-cyan) !important;
        }

        /* Dropdown Menu Styling */
        .ant-dropdown-menu {
          background: rgba(22, 33, 62, 0.95) !important;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: var(--radius-sm) !important;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4) !important;
        }

        .ant-dropdown-menu-item {
          color: var(--text-primary) !important;
        }

        .ant-dropdown-menu-item:hover {
          background: rgba(0, 212, 255, 0.1) !important;
        }

        .ant-dropdown-menu-item-danger {
          color: #ff4d4f !important;
        }

        .ant-dropdown-menu-item-danger:hover {
          background: rgba(255, 77, 79, 0.1) !important;
        }
      `}</style>
    </div>
  );
};

export default TicketList;
