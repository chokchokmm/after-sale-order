import api from "./client";
import type { AskResponse } from "../types/chat";

export const chatApi = {
  // Ask a question (single Q&A mode)
  ask: async (message: string): Promise<AskResponse> => {
    const response = await api.post<AskResponse>("/api/chat/ask", { message });
    return response.data;
  },
};
