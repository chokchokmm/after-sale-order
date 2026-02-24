import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Form,
  Input,
  Select,
  Button,
  Space,
  Card,
  message,
  Row,
  Col,
  Tag,
} from "antd";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { ticketsApi, usersApi } from "../api";
import type { Ticket, TicketCreate, TicketUpdate, User } from "../types";
import { TicketSystemSource, TicketCategory, TicketHandleType, TicketPriority, TicketStatus } from "../types";

const { TextArea } = Input;
const { Option } = Select;

const TicketForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    fetchUsers();
    if (isEdit) {
      fetchTicket();
    }
  }, [id]);

  const fetchUsers = async () => {
    try {
      const data = await usersApi.list();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const fetchTicket = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await ticketsApi.get(id);
      setTicket(data);
      setTags(data.tags || []);
      form.setFieldsValue(data);
    } catch (err) {
      message.error("加载工单失败");
      console.error(err);
      navigate("/tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const submitData: TicketCreate | TicketUpdate = {
        ...values,
        tags,
      };

      if (isEdit) {
        await ticketsApi.update(id!, submitData as TicketUpdate);
        message.success("更新成功");
      } else {
        await ticketsApi.create(submitData as TicketCreate);
        message.success("创建成功");
      }

      navigate("/tickets");
    } catch (err) {
      if (err && typeof err === "object" && "errorFields" in err) {
        message.error("请检查表单填写");
      } else {
        message.error(isEdit ? "更新失败" : "创建失败");
        console.error(err);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddTag = () => {
    if (inputValue && !tags.includes(inputValue)) {
      setTags([...tags, inputValue]);
      setInputValue("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  if (loading) {
    return <div style={{ textAlign: "center", padding: "50px" }}>加载中...</div>;
  }

  return (
    <div>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/tickets")}
        style={{ marginBottom: 16 }}
      >
        返回列表
      </Button>

      <Card title={isEdit ? "编辑工单" : "新建工单"}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            systemSource: TicketSystemSource.TMS,
            category: TicketCategory.TICKET_PROCESS,
            handleType: TicketHandleType.PRODUCT,
            priority: TicketPriority.MEDIUM,
            status: isEdit ? undefined : TicketStatus.OPEN,
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="来源系统"
                name="systemSource"
                rules={[{ required: true, message: "请选择来源系统" }]}
              >
                <Select>
                  <Option value={TicketSystemSource.TMS}>TMS</Option>
                  <Option value={TicketSystemSource.OMS}>OMS</Option>
                  <Option value={TicketSystemSource.OTHER}>其他</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="工单类型"
                name="category"
                rules={[{ required: true, message: "请选择工单类型" }]}
              >
                <Select>
                  <Option value={TicketCategory.TICKET_PROCESS}>票据处理</Option>
                  <Option value={TicketCategory.SYSTEM_FAILURE}>系统故障</Option>
                  <Option value={TicketCategory.COST_OPTIMIZATION}>成本优化</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="处理类型"
                name="handleType"
                rules={[{ required: true, message: "请选择处理类型" }]}
              >
                <Select>
                  <Option value={TicketHandleType.PRODUCT}>产品</Option>
                  <Option value={TicketHandleType.DEV}>开发</Option>
                  <Option value={TicketHandleType.REQUIREMENT}>需求</Option>
                  <Option value={TicketHandleType.URGENT}>紧急</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="优先级"
                name="priority"
                rules={[{ required: true, message: "请选择优先级" }]}
              >
                <Select>
                  <Option value={TicketPriority.HIGH}>高</Option>
                  <Option value={TicketPriority.MEDIUM}>中</Option>
                  <Option value={TicketPriority.LOW}>低</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {isEdit && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="状态" name="status">
                  <Select>
                    <Option value={TicketStatus.OPEN}>待处理</Option>
                    <Option value={TicketStatus.PROCESSING}>处理中</Option>
                    <Option value={TicketStatus.CLOSED}>已关闭</Option>
                    <Option value={TicketStatus.VERIFIED}>已验证</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="指派给" name="assignedTo">
                  <Select allowClear placeholder="选择指派人">
                    {users.map((user) => (
                      <Option key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          )}

          <Form.Item
            label="问题描述"
            name="description"
            rules={[{ required: true, message: "请输入问题描述" }]}
          >
            <TextArea rows={4} placeholder="请详细描述问题表现" />
          </Form.Item>

          <Form.Item
            label="处理详情"
            name="handleDetail"
            rules={[{ required: true, message: "请输入处理详情" }]}
          >
            <TextArea rows={4} placeholder="请详细描述处理步骤" />
          </Form.Item>

          <Form.Item label="解决方案模板（可选）" name="solutionTemplate">
            <TextArea rows={3} placeholder="可复用的解决方案，用于 FAQ 生成" />
          </Form.Item>

          <Form.Item label="标签">
            <div>
              <div style={{ marginBottom: 8 }}>
                {tags.map((tag) => (
                  <Tag
                    key={tag}
                    closable
                    onClose={() => handleRemoveTag(tag)}
                    style={{ marginBottom: 4 }}
                  >
                    {tag}
                  </Tag>
                ))}
              </div>
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onPressEnter={handleAddTag}
                placeholder="输入标签后按回车添加"
                style={{ width: 200 }}
              />
            </div>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={submitting}
                onClick={handleSubmit}
              >
                {isEdit ? "更新" : "创建"}
              </Button>
              <Button onClick={() => navigate("/tickets")}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default TicketForm;
