import api from "./client";
import type { AuthUser } from "../types/auth";

export interface FeishuAuthUrlResponse {
  url: string;
  state: string;
}

export interface FeishuLoginResponse {
  success: boolean;
  message: string;
  user?: AuthUser;
}

export const authApi = {
  // Get Feishu OAuth authorization URL
  getFeishuAuthUrl: async (): Promise<FeishuAuthUrlResponse> => {
    const response = await api.get<FeishuAuthUrlResponse>("/api/auth/feishu");
    return response.data;
  },

  // Login with Feishu authorization code
  feishuLogin: async (code: string): Promise<FeishuLoginResponse> => {
    const response = await api.post<FeishuLoginResponse>("/api/auth/feishu/login", {
      code,
    });
    return response.data;
  },
};
