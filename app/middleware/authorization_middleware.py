from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.status import HTTP_401_UNAUTHORIZED
import logging
import os

from services.jwt_service import JwtService

logger = logging.getLogger(__name__)

# 👇 Define your middleware class
class BearerAuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Skip auth for testing - set default values
        request.state.user_id = '50000001'
        request.state.user_role = "tutor"
        
        # Skip auth check for now
        return await call_next(request)
