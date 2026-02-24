import api from "./client";
import type {
  Ticket,
  TicketCreate,
  TicketUpdate,
  TicketListParams,
  TicketListResponse,
  TicketStatistics,
} from "../types";

export const ticketsApi = {
  // Get tickets list
  list: async (params: TicketListParams): Promise<TicketListResponse> => {
    const response = await api.get<TicketListResponse>("/api/tickets", { params });
    return response.data;
  },

  // Get ticket by ID
  get: async (id: string): Promise<Ticket> => {
    const response = await api.get<Ticket>(`/api/tickets/${id}`);
    return response.data;
  },

  // Create ticket
  create: async (data: TicketCreate): Promise<Ticket> => {
    const response = await api.post<Ticket>("/api/tickets", data);
    return response.data;
  },

  // Update ticket
  update: async (id: string, data: TicketUpdate): Promise<Ticket> => {
    const response = await api.put<Ticket>(`/api/tickets/${id}`, data);
    return response.data;
  },

  // Close ticket
  close: async (id: string): Promise<Ticket> => {
    const response = await api.post<Ticket>(`/api/tickets/${id}/close`);
    return response.data;
  },

  // Delete ticket
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/tickets/${id}`);
  },

  // Get statistics
  getStats: async (): Promise<TicketStatistics> => {
    const response = await api.get<TicketStatistics>("/api/tickets/stats");
    return response.data;
  },
};
