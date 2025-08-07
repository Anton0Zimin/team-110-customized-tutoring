import os
from typing import Optional
from async_lru import alru_cache
import httpx
from jose import jwt
import logging

logger = logging.getLogger(__name__)

COGNITO_USER_POOL_ID = os.getenv("COGNITO_USER_POOL_ID")
COGNITO_CLIENT_ID = os.getenv("COGNITO_CLIENT_ID")

class JwtService:
    @alru_cache
    async def _get_jwk_keys(self):
        async with httpx.AsyncClient() as client:
            response = await client.get(f"https://cognito-idp.us-west-2.amazonaws.com/{COGNITO_USER_POOL_ID}/.well-known/jwks.json")
            return response.json()["keys"]

    async def decode_id_token(self, tokens: dict) -> Optional[dict]:
        try:
            keys = await self._get_jwk_keys()
            logger.debug(keys)

            unverified_header = jwt.get_unverified_header(tokens["id_token"])
            key = next(k for k in keys if k["kid"] == unverified_header["kid"])
            return jwt.decode(tokens["id_token"], key, algorithms=["RS256"],
                            audience=COGNITO_CLIENT_ID,
                            access_token=tokens["access_token"])
        except Exception as e:
            logger.error("Failed to verify JWT token", exc_info=e)
            return None

    async def decode_access_token(self, token: str) -> bool:
        keys = await self._get_jwk_keys()

        unverified_header = jwt.get_unverified_header(token)
        key = next(k for k in keys if k["kid"] == unverified_header["kid"])
        jwt_decoded = jwt.decode(token, key, algorithms=["RS256"],
                            audience=COGNITO_CLIENT_ID)
        logger.debug(jwt_decoded)
        return jwt_decoded