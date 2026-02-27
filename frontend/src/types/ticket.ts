export enum TicketSystemSource {
  TMS = "TMS",
  OMS = "OMS",
  WMS = "WMS"
}

export enum TicketCategory {
  TICKET_PROCESS = "TICKET_PROCESS",
  SYSTEM_FAILURE = "SYSTEM_FAILURE",
  COST_OPTIMIZATION = "COST_OPTIMIZATION"
}

export enum TicketHandleType {
  PRODUCT = "PRODUCT",
  DEV = "DEV",
  PRODUCT_DEV = "PRODUCT_DEV"
}

export enum TicketPriority {
  P0 = "P0",
  P1 = "P1",
  P2 = "P2",
  P3 = "P3"
}

export enum TicketStatus {
  OPEN = "OPEN",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED"
}

export interface AIMetadata {
  keywords: string[];
  similarTickets: string[];
  suggestedSolution?: string;
}

export interface Ticket {
  id: string;
  systemSource: TicketSystemSource;
  category: TicketCategory;
  description: string;
  handleType: TicketHandleType;
  handleDetail: string;
  priority: TicketPriority;
  status: TicketStatus;
  tags: string[];
  solutionTemplate?: string;
  createdBy?: string;
  assignedTo?: string;
  createdAt?: string;
  updatedAt?: string;
  closedAt?: string;
  aiMetadata: AIMetadata;
}

export interface TicketCreate {
  systemSource: TicketSystemSource;
  category: TicketCategory;
  description: string;
  handleType: TicketHandleType;
  handleDetail: string;
  priority: TicketPriority;
  tags?: string[];
  solutionTemplate?: string;
  assignedTo?: string;
  createdBy?: string;
}

export interface TicketUpdate {
  systemSource?: TicketSystemSource;
  category?: TicketCategory;
  description?: string;
  handleType?: TicketHandleType;
  handleDetail?: string;
  priority?: TicketPriority;
  status?: TicketStatus;
  tags?: string[];
  solutionTemplate?: string;
  assignedTo?: string;
  createdBy?: string;
}

export interface TicketListParams {
  page: number;
  pageSize: number;
  systemSource?: TicketSystemSource;
  category?: TicketCategory;
  status?: TicketStatus;
  priority?: TicketPriority;
  search?: string;
  createdBy?: string;
}

export interface TicketListResponse {
  items: Ticket[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface TrendDataPoint {
  date: string;
  value: number;
  datetime?: string;
}

export interface TicketStatistics {
  overview: {
    total: number;
    open: number;
    processing: number;
    completed: number;
  };
  byCategory: Record<string, number>;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  trend: TrendDataPoint[];
}
