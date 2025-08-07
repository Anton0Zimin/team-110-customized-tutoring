from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.status import HTTP_401_UNAUTHORIZED
import logging
import os

from services.jwt_service import JwtService

logger = logging.getLogger(__name__)

# 👇 Define your middleware class
class BearerAuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # 👇 Skip middleware logic for OPTIONS requests (CORS preflight)
        if request.method == "OPTIONS":
            return await call_next(request)

        # Exclude specific paths from authentication
        if request.url.path in ["/api/auth/login/", "/api/auth/register/", "/docs", "/openapi.json"]:
            return await call_next(request)

        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(
                status_code=HTTP_401_UNAUTHORIZED,
                detail="Missing or invalid Authorization header",
            )

        token = auth_header.removeprefix("Bearer ").strip()

        try:
            decoded_token = await JwtService(token)
            request.state.access_token = decoded_token

            if "tutor" in decoded_token.get("cognito:groups", []):
                request.state.user_role = "tutor"
                request.state.tutor_id = decoded_token["username"]
            else:
                request.state.user_role = "student"

            # TODO: Check routes for student and tutor.
        except Exception as e:
            logger.error("Failed to verify JWT token", exc_info=e)
            raise HTTPException(
                status_code=HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )

        return await call_next(request)
