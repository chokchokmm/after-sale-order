export enum TicketSystemSource {
  TMS = "TMS",
  OMS = "OMS",
  OTHER = "OTHER"
}

export enum TicketCategory {
  TICKET_PROCESS = "TICKET_PROCESS",
  SYSTEM_FAILURE = "SYSTEM_FAILURE",
  COST_OPTIMIZATION = "COST_OPTIMIZATION"
}

export enum TicketHandleType {
  PRODUCT = "PRODUCT",
  DEV = "DEV",
  REQUIREMENT = "REQUIREMENT",
  URGENT = "URGENT"
}

export enum TicketPriority {
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW"
}

export enum TicketStatus {
  OPEN = "OPEN",
  PROCESSING = "PROCESSING",
  CLOSED = "CLOSED",
  VERIFIED = "VERIFIED"
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
}

export interface TicketListParams {
  page: number;
  pageSize: number;
  systemSource?: TicketSystemSource;
  category?: TicketCategory;
  status?: TicketStatus;
  priority?: TicketPriority;
  search?: string;
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
    closed: number;
    verified: number;
  };
  byCategory: Record<string, number>;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  trend: TrendDataPoint[];
}
