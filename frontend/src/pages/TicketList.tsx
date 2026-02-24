import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import {
  Table,
  Button,
  Space,
  Input,
  Select,
  Tag,
  Popconfirm,
  message,
  Card,
  Row,
  Col,
  Tooltip,
  Dropdown,
} from "antd";
import type { ColumnsType, TablePaginationConfig, MenuProps } from "antd/es/table";
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CloseCircleOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  VerifiedOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { ticketsApi } from "../api";
import type { Ticket, TicketListParams, TicketPriority, TicketStatus } from "../types";
import {
  statusConfig,
  priorityConfig,
  getCategoryLabel,
  formatDate,
} from "../utils";

const { Search } = Input;
const { Option } = Select;

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
  // 使用独立状态来控制Select显示
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [initialized, setInitialized] = useState(false);

  // 从URL参数中获取筛选条件（初始化或URL变化时）
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

  // 当statusFilter变化时，更新params并查询
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
    try {
      await ticketsApi.delete(id);
      message.success("删除成功");
      fetchTickets();
    } catch (err) {
      message.error("删除失败");
      console.error(err);
    }
  };

  const handleClose = async (id: string) => {
    try {
      await ticketsApi.close(id);
      message.success("工单已关闭");
      fetchTickets();
    } catch (err) {
      message.error("关闭失败");
      console.error(err);
    }
  };

  const handleStatusChange = async (id: string, newStatus: TicketStatus) => {
    try {
      await ticketsApi.update(id, { status: newStatus });
      const statusLabels: Record<TicketStatus, string> = {
        OPEN: "待处理",
        PROCESSING: "处理中",
        CLOSED: "已关闭",
        VERIFIED: "已验证",
      };
      message.success(`状态已更新为：${statusLabels[newStatus]}`);
      fetchTickets();
    } catch (err) {
      message.error("状态更新失败");
      console.error(err);
    }
  };

  const getStatusActions = (record: Ticket): MenuProps['items'] => {
    const items: MenuProps['items'] = [];

    if (record.status === "OPEN") {
      items.push({
        key: 'start',
        label: '开始处理',
        icon: <PlayCircleOutlined />,
        onClick: () => handleStatusChange(record.id, "PROCESSING"),
      });
    }

    if (record.status === "PROCESSING") {
      items.push({
        key: 'complete',
        label: '完成处理',
        icon: <CheckCircleOutlined />,
        onClick: () => handleStatusChange(record.id, "CLOSED"),
      });
    }

    if (record.status === "CLOSED") {
      items.push({
        key: 'verify',
        label: '验证通过',
        icon: <VerifiedOutlined />,
        onClick: () => handleStatusChange(record.id, "VERIFIED"),
      });
    }

    // 添加关闭和删除选项
    if (record.status !== "CLOSED" && record.status !== "VERIFIED") {
      items.push({ type: 'divider' });
      items.push({
        key: 'close',
        label: '关闭工单',
        icon: <CloseCircleOutlined />,
        danger: true,
        onClick: () => handleClose(record.id),
      });
    }

    items.push({ type: 'divider' });
    items.push({
      key: 'delete',
      label: '删除',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => handleDelete(record.id),
    });

    return items;
  };

  // 获取状态操作按钮
  const getStatusButton = (record: Ticket) => {
    switch (record.status) {
      case "OPEN":
        return (
          <Button
            type="link"
            size="small"
            icon={<PlayCircleOutlined />}
            onClick={() => handleStatusChange(record.id, "PROCESSING")}
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
            onClick={() => handleStatusChange(record.id, "CLOSED")}
          >
            完成
          </Button>
        );
      case "CLOSED":
        return (
          <Button
            type="link"
            size="small"
            icon={<VerifiedOutlined />}
            onClick={() => handleStatusChange(record.id, "VERIFIED")}
          >
            验证
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
      width: 100,
      render: (id) => (
        <Tooltip title={id}>
          <span style={{ cursor: "pointer" }}>{id.slice(-8)}</span>
        </Tooltip>
      ),
    },
    {
      title: "来源系统",
      dataIndex: "systemSource",
      key: "systemSource",
      width: 100,
      render: (value) => <Tag>{value}</Tag>,
    },
    {
      title: "类型",
      dataIndex: "category",
      key: "category",
      width: 120,
      render: (value) => <span>{getCategoryLabel(value)}</span>,
    },
    {
      title: "描述",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "处理类型",
      dataIndex: "handleType",
      key: "handleType",
      width: 100,
      render: (value) => <Tag color="blue">{value}</Tag>,
    },
    {
      title: "优先级",
      dataIndex: "priority",
      key: "priority",
      width: 100,
      render: (value: TicketPriority) => (
        <Tag color={priorityConfig[value].color}>{priorityConfig[value].label}</Tag>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (value: TicketStatus) => (
        <Tag color={statusConfig[value].color}>{statusConfig[value].label}</Tag>
      ),
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 160,
      render: (value) => formatDate(value),
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
          >
            查看
          </Button>
          {getStatusButton(record)}
          <Dropdown menu={{ items: getStatusActions(record) }} placement="bottomLeft">
            <Button
              type="link"
              size="small"
              icon={<MoreOutlined />}
            >
              更多
            </Button>
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="工单列表"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/tickets/new")}
          >
            新建工单
          </Button>
        }
      >
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Search
              placeholder="搜索描述"
              onSearch={handleSearch}
              enterButton
              allowClear
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="来源系统"
              allowClear
              value={params.systemSource}
              style={{ width: "100%" }}
              onChange={(value) => handleFilterChange("systemSource", value)}
            >
              <Option value="TMS">TMS</Option>
              <Option value="OMS">OMS</Option>
              <Option value="OTHER">其他</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="工单类型"
              allowClear
              value={params.category}
              style={{ width: "100%" }}
              onChange={(value) => handleFilterChange("category", value)}
            >
              <Option value="TICKET_PROCESS">票据处理</Option>
              <Option value="SYSTEM_FAILURE">系统故障</Option>
              <Option value="COST_OPTIMIZATION">成本优化</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="状态"
              value={statusFilter}
              style={{ width: "100%" }}
              onChange={(value) => {
                setStatusFilter(value || "");
                handleFilterChange("status", value);
              }}
            >
              <Option value="OPEN">待处理</Option>
              <Option value="PROCESSING">处理中</Option>
              <Option value="CLOSED">已关闭</Option>
              <Option value="VERIFIED">已验证</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="优先级"
              allowClear
              value={params.priority}
              style={{ width: "100%" }}
              onChange={(value) => handleFilterChange("priority", value)}
            >
              <Option value="HIGH">高</Option>
              <Option value="MEDIUM">中</Option>
              <Option value="LOW">低</Option>
            </Select>
          </Col>
        </Row>

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
            showTotal: (total) => `共 ${total} 条`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
};

export default TicketList;
