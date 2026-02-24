from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    """User role in the system."""
    ADMIN = "ADMIN"
    PRODUCT = "PRODUCT"
    DEVELOPER = "DEVELOPER"


class User(BaseModel):
    """User model for the ticket system."""
    id: Optional[str] = None
    name: str
    email: EmailStr
    role: UserRole
    createdAt: Optional[datetime] = None


class UserCreate(BaseModel):
    """Schema for creating a user."""
    name: str
    email: EmailStr
    role: UserRole


class UserUpdate(BaseModel):
    """Schema for updating a user."""
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None


class UserResponse(User):
    """Schema for user response."""
    id: str

    class Config:
        from_attributes = True
