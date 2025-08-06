from uuid import UUID, uuid4
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, constr
import logging
from jose import jwt
from typing import Optional
import os
import httpx
from enum import Enum
import boto3
from boto3.dynamodb.conditions import Key

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["auth"])

COGNITO_DOMAIN = os.getenv("COGNITO_DOMAIN")
COGNITO_USER_POOL_ID = os.getenv("COGNITO_USER_POOL_ID")
COGNITO_CLIENT_ID = os.getenv("COGNITO_CLIENT_ID")
COGNITO_CLIENT_SECRET = os.getenv("COGNITO_CLIENT_SECRET")
COGNITO_REDIRECT_URI = os.getenv("COGNITO_REDIRECT_URI")

class LoginRequest(BaseModel):
    code: str

class LoginResponse(BaseModel):
    email: str
    name: str
    access_token: str

@router.post("/login/")
async def login(request: LoginRequest):
    logger.debug(request)

    tokens = await get_jwk_tokens(request.code)
    logger.debug(tokens)

    jwt_decoded = await verify_jwt_token(tokens)
    logger.debug(jwt_decoded)

    response = LoginResponse(
        email=jwt_decoded["email"],
        name=jwt_decoded["name"],
        access_token=tokens["access_token"]
    )

    return response

async def get_jwk_tokens(code: str):
    # Prepare headers and data
    headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }
    data = {
        "grant_type": "authorization_code",
        "client_id": COGNITO_CLIENT_ID,
        "code": code,
        "redirect_uri": COGNITO_REDIRECT_URI
    }

    # If using client secret, add Basic Auth header
    auth = (COGNITO_CLIENT_ID, COGNITO_CLIENT_SECRET) if COGNITO_CLIENT_SECRET else None

    logger.debug(data)

    # response = requests.post(f"{COGNITO_REDIRECT_URI}/oauth2/token", headers=headers, data=data, auth=auth)
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{COGNITO_DOMAIN}/oauth2/token",
            headers=headers,
            data=data,
            auth=auth # tuple like ("client_id", "client_secret")
        )

    if response.status_code != 200:
        json = response.json()

        # Check if error_code exists and handle it
        if "error" in json and json["error"] == 'invalid_grant':
            raise HTTPException(status_code=401, detail="Authorize in AWS Cognito again.")

        raise Exception("Failed to get JWK keys. " + response.text)

    tokens = response.json()

    logger.debug(tokens)
    return tokens

async def get_jwk_keys():
    async with httpx.AsyncClient() as client:
        response = await client.get(f"https://cognito-idp.us-west-2.amazonaws.com/{COGNITO_USER_POOL_ID}/.well-known/jwks.json")
        return response.json()["keys"]

async def verify_jwt_token(tokens: dict) -> Optional[dict]:
    try:
        keys = await get_jwk_keys()
        logger.debug(keys)

        unverified_header = jwt.get_unverified_header(tokens["id_token"])
        key = next(k for k in keys if k["kid"] == unverified_header["kid"])
        return jwt.decode(tokens["id_token"], key, algorithms=["RS256"],
                          audience=COGNITO_CLIENT_ID,
                          access_token=tokens["access_token"])
    except Exception as e:
        logger.error("Failed to verify JWT token", exc_info=e)
        return None

class Role(str, Enum):
    Student = "Student"
    Tutor = "Tutor"

class RegisterRequest(BaseModel):
    user_id: constr(pattern=r'^\d{8}$')
    display_name: str
    role: Role

class UserProfile(BaseModel):
    user_id: constr(pattern=r'^\d{8}$')
    display_name: str
    role: Role

@router.post("/register/")
async def login(request: RegisterRequest):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('Users')

    # Replace with your actual primary key and value
    response = table.get_item(
        Key={
            'user_id': request.user_id
        }
    )

    # Check if the item exists
    item = response.get('Item')

    if item:
        raise HTTPException(status_code=400, detail="User already exists")

    email = request.user_id + '@customized-training.org'
    user = UserProfile(user_id=request.user_id,
                       email="email",
                       display_name=request.display_name,
                       role=request.role)

    cognito_client = boto3.client('cognito-idp')

    response = cognito_client.admin_create_user(
        UserPoolId=COGNITO_USER_POOL_ID,
        Username=request.user_id,
        UserAttributes=[
            {'Name': 'email', 'Value': email},
            {'Name': 'email_verified', 'Value': 'true'},  # optional but recommended
            {'Name': 'custom:role', 'Value': user.role},  # optional but recommended
        ],
        TemporaryPassword='TempPass123!',  # User must change this at first login
        MessageAction='SUPPRESS'  # Optional: suppress sending invitation email
    )

    # Replace with your actual primary key and value
    response = table.put_item(
        Item = user.model_dump()
    )
