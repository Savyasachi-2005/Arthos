"""
Authentication request and response schemas.
"""
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from uuid import UUID
from datetime import datetime


class UserRegister(BaseModel):
    """Schema for user registration."""
    email: EmailStr
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=6, max_length=100)
    full_name: Optional[str] = Field(default=None, max_length=100)
    
    @validator('username')
    def username_alphanumeric(cls, v):
        """Ensure username is alphanumeric with underscores."""
        if not v.replace('_', '').isalnum():
            raise ValueError('Username must be alphanumeric (underscores allowed)')
        return v


class UserLogin(BaseModel):
    """Schema for user login."""
    username_or_email: str
    password: str


class Token(BaseModel):
    """Schema for JWT token response."""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Schema for token payload data."""
    user_id: Optional[UUID] = None
    username: Optional[str] = None


class UserResponse(BaseModel):
    """Schema for user information response."""
    id: UUID
    email: str
    username: str
    full_name: Optional[str] = None
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    """Schema for authentication success response."""
    user: UserResponse
    token: Token
