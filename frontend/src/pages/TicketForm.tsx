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
  Upload,
  Modal,
  Image,
} from "antd";
import { ArrowLeftOutlined, SaveOutlined, RobotOutlined, PlusOutlined, CloseOutlined } from "@ant-design/icons";
import { ticketsApi } from "../api";
import type { Ticket, TicketCreate, TicketUpdate, TicketImage, UploadResponse } from "../types";
import type { UploadFile, UploadProps } from "antd/es/upload/interface";
import { TicketSystemSource, TicketCategory, TicketHandleType, TicketPriority } from "../types";
import GlowButton from "../components/GlowButton";
import { useAuth } from "../contexts/AuthContext";

const { TextArea } = Input;
const { Option } = Select;

const TicketForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const isEdit = !!id;
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [generatingTags, setGeneratingTags] = useState(false);
  const [generatingRecommendation, setGeneratingRecommendation] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [uploadedImages, setUploadedImages] = useState<TicketImage[]>([]);

  useEffect(() => {
    if (isEdit) {
      fetchTicket();
    } else {
      // Auto-populate createdBy with current user on create
      if (user?.username) {
        form.setFieldsValue({ createdBy: user.username });
      }
    }
  }, [id, user, form]);

  const fetchTicket = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await ticketsApi.get(id);
      setTicket(data);
      setTags(data.tags || []);
      // Load existing images into fileList
      if (data.images && data.images.length > 0) {
        setUploadedImages(data.images);
        const files: UploadFile[] = data.images.map((img: TicketImage) => ({
          uid: img.id,
          name: img.filename,
          status: 'done',
          url: img.url,
        }));
        setFileList(files);
      }
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
        images: uploadedImages,
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

  const handleGenerateTags = async () => {
    const description = form.getFieldValue("description");
    const category = form.getFieldValue("category");
    const systemSource = form.getFieldValue("systemSource");

    if (!description) {
      message.warning("请先填写问题描述");
      return;
    }

    try {
      setGeneratingTags(true);
      const result = await ticketsApi.generateTags({
        description,
        category: category || "TICKET_PROCESS",
        systemSource: systemSource || "TMS",
      });

      if (result.tags && result.tags.length > 0) {
        // Merge with existing tags, avoid duplicates
        const newTags = [...new Set([...tags, ...result.tags])];
        setTags(newTags);
        message.success(`已生成 ${result.tags.length} 个标签`);
      } else {
        message.info("未能生成标签，请手动添加");
      }
    } catch (err) {
      message.error("生成标签失败，请手动添加");
      console.error(err);
    } finally {
      setGeneratingTags(false);
    }
  };

  const handleGenerateRecommendation = async () => {
    if (!id) {
      message.warning("请先保存工单后再获取智能推荐");
      return;
    }

    try {
      setGeneratingRecommendation(true);
      message.loading({ content: "正在分析历史工单，生成推荐...", key: "recommendation" });

      const result = await ticketsApi.getRecommendation(id);

      if (result.recommendation) {
        // Set the recommendation to handleDetail field
        form.setFieldsValue({ handleDetail: result.recommendation });
        message.success({ content: "已生成处理推荐", key: "recommendation" });
      } else {
        message.warning({ content: "未能生成推荐，请手动填写", key: "recommendation" });
      }
    } catch (err) {
      message.error({ content: "生成推荐失败，请手动填写", key: "recommendation" });
      console.error(err);
    } finally {
      setGeneratingRecommendation(false);
    }
  };

  // Image upload handlers
  const handleBeforeUpload = (file: File) => {
    // Validate file type
    const isValidType = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'].includes(file.type);
    if (!isValidType) {
      message.error('仅支持 PNG、JPG、GIF、WEBP 格式的图片');
      return Upload.LIST_IGNORE;
    }
    // Validate file size (2MB)
    const isValidSize = file.size / 1024 / 1024 < 2;
    if (!isValidSize) {
      message.error('图片大小不能超过 2MB');
      return Upload.LIST_IGNORE;
    }
    // Validate max count
    if (fileList.length >= 5) {
      message.error('最多只能上传 5 张图片');
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const handleCustomRequest: UploadProps['customRequest'] = async ({ file, onSuccess, onError }) => {
    try {
      const result: UploadResponse = await ticketsApi.uploadImage(file as File);
      // Store the image info for form submission
      setUploadedImages(prev => [...prev, result.image]);
      // Update fileList with URL for display
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      message.error('上传失败，请重试');
      console.error(error);
      if (onError) {
        onError(error as Error);
      }
    }
  };

  const handleUploadChange: UploadProps['onChange'] = ({ fileList: newFileList, file }) => {
    setFileList(newFileList);
    // When a file is removed, update uploadedImages
    if (file.status === 'removed') {
      const removedUid = file.uid;
      setUploadedImages(prev => prev.filter(img => img.id !== removedUid));
    }
  };

  const handlePreview = async (file: UploadFile) => {
    setPreviewImage(file.url || file.thumbUrl || '');
    setPreviewOpen(true);
  };

  const handleRemove: UploadProps['onRemove'] = (file) => {
    return new Promise((resolve) => {
      Modal.confirm({
        title: '确认删除',
        content: '确定要删除这张图片吗？',
        okText: '确定',
        cancelText: '取消',
        onOk: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
  };

  if (loading) {
    return (
      <div className="tech-loading-container">
        <div className="tech-spinner">加载中...</div>
        <style>{`
          .tech-loading-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 400px;
            background: var(--bg-primary);
          }
          .tech-spinner {
            color: var(--accent-cyan);
            font-size: 16px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="tech-page-container">
      {/* T033: Header with back button */}
      <div className="tech-form-header">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/tickets")}
          className="tech-back-btn"
        >
          返回列表
        </Button>
      </div>

      {/* T034: Glass-morphism Card */}
      <Card
        title={<span className="tech-card-title">{isEdit ? "编辑工单" : "新建工单"}</span>}
        className="tech-glass-card"
        headStyle={{
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            systemSource: TicketSystemSource.TMS,
            category: TicketCategory.TICKET_PROCESS,
            handleType: TicketHandleType.PRODUCT,
            priority: TicketPriority.MEDIUM,
          }}
          className="tech-form"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={<span className="tech-form-label">来源系统</span>}
                name="systemSource"
                rules={[{ required: true, message: "请选择来源系统" }]}
              >
                <Select className="tech-select" popupClassName="tech-select-dropdown">
                  <Option value={TicketSystemSource.TMS}>TMS</Option>
                  <Option value={TicketSystemSource.OMS}>OMS</Option>
                  <Option value={TicketSystemSource.WMS}>WMS</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={<span className="tech-form-label">工单类型</span>}
                name="category"
                rules={[{ required: true, message: "请选择工单类型" }]}
              >
                <Select className="tech-select" popupClassName="tech-select-dropdown">
                  <Option value={TicketCategory.TICKET_PROCESS}>工单处理</Option>
                  <Option value={TicketCategory.SYSTEM_FAILURE}>系统故障</Option>
                  <Option value={TicketCategory.COST_OPTIMIZATION}>系统提升</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={<span className="tech-form-label">处理类型</span>}
                name="handleType"
                rules={[{ required: true, message: "请选择处理类型" }]}
              >
                <Select className="tech-select" popupClassName="tech-select-dropdown">
                  <Option value={TicketHandleType.PRODUCT}>产品处理</Option>
                  <Option value={TicketHandleType.DEV}>开发处理</Option>
                  <Option value={TicketHandleType.PRODUCT_DEV}>产品开发处理</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={<span className="tech-form-label">优先级</span>}
                name="priority"
                rules={[{ required: true, message: "请选择优先级" }]}
              >
                <Select className="tech-select" popupClassName="tech-select-dropdown">
                  <Option value={TicketPriority.HIGH}>高</Option>
                  <Option value={TicketPriority.MEDIUM}>中</Option>
                  <Option value={TicketPriority.LOW}>低</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={<span className="tech-form-label">创建人</span>}
                name="createdBy"
                rules={[{ required: true, message: "请输入创建人" }]}
              >
                <Input
                  placeholder="请输入创建人"
                  className="tech-input"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label={<span className="tech-form-label">问题描述</span>}
            name="description"
            rules={[{ required: true, message: "请输入问题描述" }]}
          >
            <TextArea
              rows={4}
              placeholder="请详细描述问题表现"
              className="tech-textarea"
            />
          </Form.Item>

          {/* Image Upload */}
          <Form.Item label={<span className="tech-form-label">截图</span>}>
            <Upload
              listType="picture-card"
              fileList={fileList}
              maxCount={5}
              beforeUpload={handleBeforeUpload}
              customRequest={handleCustomRequest}
              onChange={handleUploadChange}
              onPreview={handlePreview}
              onRemove={handleRemove}
              className="tech-upload"
            >
              {fileList.length >= 5 ? null : (
                <div className="tech-upload-btn">
                  <PlusOutlined />
                  <div style={{ marginTop: 8, fontSize: 12 }}>上传</div>
                </div>
              )}
            </Upload>
            <div className="tech-upload-hint">支持 PNG、JPG、GIF、WEBP 格式，单张不超过 2MB，最多 5 张</div>
          </Form.Item>

          {isEdit && ticket?.status !== "OPEN" && (
            <Form.Item
              label={
                <span className="tech-form-label">
                  处理详情
                  {/* T037: AI Button with distinctive glow */}
                  <Button
                    type="link"
                    icon={<RobotOutlined />}
                    size="small"
                    style={{ marginLeft: 8 }}
                    loading={generatingRecommendation}
                    onClick={handleGenerateRecommendation}
                    className="tech-ai-btn tech-ai-btn-inline"
                  >
                    智能推荐
                  </Button>
                </span>
              }
              name="handleDetail"
              rules={[{ required: true, message: "请输入处理详情" }]}
            >
              <TextArea
                rows={6}
                placeholder="请详细描述处理步骤，或点击'智能推荐'获取AI建议"
                className="tech-textarea"
              />
            </Form.Item>
          )}

          {/* T039: Tag display with glowing effects */}
          <Form.Item label={<span className="tech-form-label">标签</span>}>
            <div>
              <div className="tech-tags-container">
                {tags.map((tag) => (
                  <Tag
                    key={tag}
                    closable
                    onClose={() => handleRemoveTag(tag)}
                    className="tech-glow-tag"
                    closeIcon={<CloseOutlined className="tech-tag-close" />}
                  >
                    {tag}
                  </Tag>
                ))}
              </div>
              <div className="tech-tag-actions">
                {/* T037: AI feature button with distinctive glow */}
                <Button
                  icon={<RobotOutlined />}
                  onClick={handleGenerateTags}
                  loading={generatingTags}
                  className="tech-ai-btn"
                >
                  智能生成标签
                </Button>
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onPressEnter={handleAddTag}
                  placeholder="或手动输入标签"
                  className="tech-tag-input"
                />
                {inputValue && (
                  <Button
                    icon={<PlusOutlined />}
                    onClick={handleAddTag}
                    className="tech-add-tag-btn"
                  />
                )}
              </div>
            </div>
          </Form.Item>

          {/* T040: Submit and Cancel buttons */}
          <Form.Item>
            <Space size="middle">
              <GlowButton
                type="primary"
                icon={<SaveOutlined />}
                loading={submitting}
                onClick={handleSubmit}
                glowColor="cyan"
                gradient
              >
                {isEdit ? "更新" : "创建"}
              </GlowButton>
              <Button
                onClick={() => navigate("/tickets")}
                className="tech-cancel-btn"
              >
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* Image Preview Modal */}
      <Modal
        open={previewOpen}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
        className="tech-preview-modal"
      >
        <Image src={previewImage} style={{ width: '100%' }} preview={false} />
      </Modal>

      {/* Custom styles for tech-themed TicketForm */}
      <style>{`
        /* T033: Page Container Dark Background */
        .tech-page-container {
          padding: 0;
          min-height: 100%;
          background: var(--bg-primary);
        }

        /* Header */
        .tech-form-header {
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

        /* T034: Glass-morphism Card */
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

        /* Form Label */
        .tech-form-label {
          color: var(--text-secondary);
          font-weight: 500;
          font-size: 13px;
        }

        /* T035: Input Focus Glow Effects */
        .tech-form .ant-input,
        .tech-form .ant-input-password,
        .tech-form .ant-input-affix-wrapper {
          background: rgba(22, 33, 62, 0.8) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          color: var(--text-primary) !important;
          border-radius: var(--radius-sm) !important;
          transition: all 0.3s ease;
        }

        .tech-form .ant-input:hover,
        .tech-form .ant-input-affix-wrapper:hover {
          border-color: rgba(0, 212, 255, 0.3) !important;
        }

        .tech-form .ant-input:focus,
        .tech-form .ant-input-focused,
        .tech-form .ant-input-affix-wrapper-focused,
        .tech-form .ant-input-affix-wrapper:focus {
          border-color: var(--accent-cyan) !important;
          box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.1),
                      0 0 20px rgba(0, 212, 255, 0.2) !important;
        }

        .tech-form .ant-input::placeholder {
          color: var(--text-muted) !important;
        }

        /* TextArea */
        .tech-textarea {
          background: rgba(22, 33, 62, 0.8) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          color: var(--text-primary) !important;
          border-radius: var(--radius-sm) !important;
          transition: all 0.3s ease;
        }

        .tech-textarea:hover {
          border-color: rgba(0, 212, 255, 0.3) !important;
        }

        .tech-textarea:focus {
          border-color: var(--accent-cyan) !important;
          box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.1),
                      0 0 20px rgba(0, 212, 255, 0.2) !important;
        }

        /* T036: Select Dropdown Styling */
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

        /* T037: AI Feature Buttons */
        .tech-ai-btn {
          background: rgba(123, 44, 191, 0.15) !important;
          border: 1px solid rgba(255, 0, 110, 0.3) !important;
          color: var(--accent-magenta) !important;
          border-radius: var(--radius-sm) !important;
          transition: all 0.3s ease;
        }

        .tech-ai-btn:hover {
          background: rgba(123, 44, 191, 0.25) !important;
          border-color: var(--accent-magenta) !important;
          color: var(--accent-magenta) !important;
          box-shadow: 0 0 15px rgba(255, 0, 110, 0.3);
          text-shadow: 0 0 8px rgba(255, 0, 110, 0.5);
        }

        .tech-ai-btn-inline {
          padding: 0 8px !important;
          height: auto !important;
          font-size: 12px;
        }

        .tech-ai-btn-inline:hover {
          background: rgba(123, 44, 191, 0.2) !important;
        }

        /* T038: Validation Error States */
        .tech-form .ant-form-item-explain-error {
          color: #ff4d4f !important;
          font-size: 12px;
          margin-top: 4px;
          padding-left: 4px;
          border-left: 2px solid #ff4d4f;
        }

        .tech-form .ant-input-status-error,
        .tech-form .ant-input-affix-wrapper-status-error,
        .tech-form .ant-select-status-error .ant-select-selector {
          border-color: #ff4d4f !important;
          box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.1),
                      0 0 15px rgba(255, 77, 79, 0.2) !important;
        }

        .tech-form .ant-form-item-feedback-icon-error {
          color: #ff4d4f !important;
        }

        /* T039: Tag Display with Glowing Effects */
        .tech-tags-container {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 12px;
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
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .tech-glow-tag:hover {
          box-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
          transform: translateY(-1px);
        }

        .tech-tag-close {
          font-size: 10px;
          color: var(--accent-cyan);
          opacity: 0.6;
          transition: opacity 0.2s ease;
        }

        .tech-tag-close:hover {
          opacity: 1;
        }

        .tech-tag-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .tech-tag-input {
          width: 180px !important;
          background: rgba(22, 33, 62, 0.8) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          color: var(--text-primary) !important;
          border-radius: var(--radius-sm) !important;
          transition: all 0.3s ease;
        }

        .tech-tag-input:focus {
          border-color: var(--accent-cyan) !important;
          box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.1),
                      0 0 15px rgba(0, 212, 255, 0.2) !important;
        }

        .tech-add-tag-btn {
          background: rgba(0, 212, 255, 0.1) !important;
          border: 1px solid rgba(0, 212, 255, 0.3) !important;
          color: var(--accent-cyan) !important;
          border-radius: var(--radius-sm) !important;
          transition: all 0.3s ease;
        }

        .tech-add-tag-btn:hover {
          background: rgba(0, 212, 255, 0.2) !important;
          box-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
        }

        /* T040: Cancel Button */
        .tech-cancel-btn {
          background: rgba(22, 33, 62, 0.6) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          color: var(--text-secondary) !important;
          border-radius: var(--radius-sm) !important;
          transition: all 0.3s ease;
        }

        .tech-cancel-btn:hover {
          border-color: rgba(255, 255, 255, 0.3) !important;
          color: var(--text-primary) !important;
        }

        /* Image Upload Styles */
        .tech-upload .ant-upload.ant-upload-select-picture-card {
          background: rgba(22, 33, 62, 0.8) !important;
          border: 1px dashed rgba(0, 212, 255, 0.3) !important;
          border-radius: var(--radius-sm) !important;
          transition: all 0.3s ease;
        }

        .tech-upload .ant-upload.ant-upload-select-picture-card:hover {
          border-color: var(--accent-cyan) !important;
          box-shadow: 0 0 15px rgba(0, 212, 255, 0.2);
        }

        .tech-upload-btn {
          color: var(--accent-cyan);
        }

        .tech-upload .ant-upload-list-picture-card-container {
          border-radius: var(--radius-sm) !important;
        }

        .tech-upload .ant-upload-list-picture-card .ant-upload-list-item {
          background: rgba(22, 33, 62, 0.8) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: var(--radius-sm) !important;
        }

        .tech-upload .ant-upload-list-picture-card .ant-upload-list-item-actions {
          background: rgba(0, 0, 0, 0.6);
        }

        .tech-upload .ant-upload-list-picture-card .ant-upload-list-item-actions .anticon {
          color: var(--text-primary);
        }

        .tech-upload .ant-upload-list-picture-card .ant-upload-list-item-actions .anticon:hover {
          color: var(--accent-cyan);
        }

        .tech-upload-hint {
          color: var(--text-muted);
          font-size: 12px;
          margin-top: 8px;
        }

        /* Preview Modal */
        .tech-preview-modal .ant-modal-content {
          background: rgba(22, 33, 62, 0.95) !important;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: var(--radius-lg) !important;
        }

        .tech-preview-modal .ant-modal-close {
          color: var(--text-secondary);
        }

        .tech-preview-modal .ant-modal-close:hover {
          color: var(--accent-cyan);
        }
      `}</style>
    </div>
  );
};

export default TicketForm;
