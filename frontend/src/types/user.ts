export enum UserRole {
  ADMIN = "ADMIN",
  PRODUCT = "PRODUCT",
  DEVELOPER = "DEVELOPER"
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

export interface UserCreate {
  name: string;
  email: string;
  role: UserRole;
}

export interface UserUpdate {
  name?: string;
  email?: string;
  role?: UserRole;
}
