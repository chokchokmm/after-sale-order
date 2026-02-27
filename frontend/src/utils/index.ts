import { TicketStatus, TicketPriority, TicketCategory, TicketSystemSource } from "../types";

// Status mapping to display text and color
export const statusConfig: Record<
  TicketStatus,
  { label: string; color: string; badge: string }
> = {
  [TicketStatus.OPEN]: { label: "待处理", color: "orange", badge: "warning" },
  [TicketStatus.PROCESSING]: { label: "处理中", color: "blue", badge: "processing" },
  [TicketStatus.COMPLETED]: { label: "已完成", color: "green", badge: "success" },
};

// Priority mapping to display text and color
export const priorityConfig: Record<
  TicketPriority,
  { label: string; color: string; badge: string; description: string }
> = {
  [TicketPriority.P0]: { label: "P0", color: "#ff006e", badge: "error", description: "系统崩溃，功能失效" },
  [TicketPriority.P1]: { label: "P1", color: "#ff4d4f", badge: "error", description: "阻塞型BUG" },
  [TicketPriority.P2]: { label: "P2", color: "#faad14", badge: "warning", description: "非主流程BUG" },
  [TicketPriority.P3]: { label: "P3", color: "#52c41a", badge: "success", description: "优化问题" },
};

// Category mapping to display text
export const categoryConfig: Record<TicketCategory, { label: string }> = {
  [TicketCategory.TICKET_PROCESS]: { label: "工单处理" },
  [TicketCategory.SYSTEM_FAILURE]: { label: "系统故障" },
  [TicketCategory.COST_OPTIMIZATION]: { label: "系统提升" },
};

// System source mapping to display text
export const systemSourceConfig: Record<TicketSystemSource, { label: string }> = {
  [TicketSystemSource.TMS]: { label: "TMS" },
  [TicketSystemSource.OMS]: { label: "OMS" },
  [TicketSystemSource.WMS]: { label: "WMS" },
};

// Get status label
export const getStatusLabel = (status: TicketStatus): string => {
  return statusConfig[status].label;
};

// Get priority label
export const getPriorityLabel = (priority: TicketPriority): string => {
  return priorityConfig[priority].label;
};

// Get category label
export const getCategoryLabel = (category: TicketCategory): string => {
  return categoryConfig[category].label;
};

// Format date
export const formatDate = (dateString?: string): string => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Calculate total pages
export const getTotalPages = (total: number, pageSize: number): number => {
  return Math.ceil(total / pageSize);
};

// Get system source label
export const getSystemSourceLabel = (source: TicketSystemSource): string => {
  return systemSourceConfig[source].label;
};
