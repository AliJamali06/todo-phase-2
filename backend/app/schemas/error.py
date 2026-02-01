"""
Error response schemas for standardized API error handling.

Based on api.yaml contract definitions.
"""
from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class ErrorResponse(BaseModel):
    """Standard error response format."""

    error_code: str
    message: str
    details: Optional[Dict[str, Any]] = None


class ValidationErrorDetail(BaseModel):
    """Single validation error detail."""

    loc: List[str]
    msg: str
    type: str


class ValidationErrorResponse(BaseModel):
    """Validation error response with field-level details."""

    error_code: str = "VALIDATION_ERROR"
    message: str = "Request validation failed"
    details: Optional[Dict[str, List[ValidationErrorDetail]]] = None


# Standard error codes
class ErrorCode:
    """Error code constants for consistency."""

    # Authentication
    UNAUTHORIZED = "UNAUTHORIZED"
    INVALID_TOKEN = "INVALID_TOKEN"
    TOKEN_EXPIRED = "TOKEN_EXPIRED"

    # Authorization
    FORBIDDEN = "FORBIDDEN"

    # Resources
    TASK_NOT_FOUND = "TASK_NOT_FOUND"
    USER_NOT_FOUND = "USER_NOT_FOUND"

    # Validation
    VALIDATION_ERROR = "VALIDATION_ERROR"
    INVALID_INPUT = "INVALID_INPUT"
    TITLE_REQUIRED = "TITLE_REQUIRED"
    TITLE_TOO_LONG = "TITLE_TOO_LONG"

    # Server
    INTERNAL_ERROR = "INTERNAL_ERROR"
