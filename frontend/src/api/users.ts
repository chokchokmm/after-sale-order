import api from "./client";
import type { User, UserCreate, UserUpdate } from "../types";

export const usersApi = {
  // Get all users
  list: async (): Promise<User[]> => {
    const response = await api.get<User[]>("/api/users");
    return response.data;
  },

  // Get user by ID
  get: async (id: string): Promise<User> => {
    const response = await api.get<User>(`/api/users/${id}`);
    return response.data;
  },

  // Create user
  create: async (data: UserCreate): Promise<User> => {
    const response = await api.post<User>("/api/users", data);
    return response.data;
  },

  // Update user
  update: async (id: string, data: UserUpdate): Promise<User> => {
    const response = await api.put<User>(`/api/users/${id}`, data);
    return response.data;
  },
};
