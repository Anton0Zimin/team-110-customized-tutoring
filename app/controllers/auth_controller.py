from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, constr
import logging
import os
import httpx
from enum import Enum
import boto3
from botocore.exceptions import ClientError

from services.jwt_service import JwtService
from models.student_profile import StudentProfile
from models.tutor_profile import TutorProfile
from services.student_service import StudentService
from services.tutor_service import TutorService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["auth"])

COGNITO_DOMAIN = os.getenv("COGNITO_DOMAIN")
COGNITO_USER_POOL_ID = os.getenv("COGNITO_USER_POOL_ID")
COGNITO_CLIENT_ID = os.getenv("COGNITO_CLIENT_ID")
COGNITO_CLIENT_SECRET = os.getenv("COGNITO_CLIENT_SECRET")

class LoginRequest(BaseModel):
    code: str
    redirect_uri: str # http://localhost:3000

class LoginResponse(BaseModel):
    user_id: str
    role: str
    email: str
    name: str
    access_token: str

@router.post("/login/")
async def login(request: LoginRequest):
    logger.debug(request)

    tokens = await get_jwk_tokens(request)
    logger.debug(tokens)

    jwt_decoded = await JwtService().decode_id_token(tokens)
    logger.debug(jwt_decoded)

    response = LoginResponse(
        user_id=jwt_decoded["cognito:username"],
        email=jwt_decoded["email"],
        name=jwt_decoded["name"],
        role=jwt_decoded["custom:role"],
        access_token=tokens["access_token"]
    )

    return response

async def get_jwk_tokens(request: LoginRequest):
    # Prepare headers and data
    headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }
    data = {
        "grant_type": "authorization_code",
        "client_id": COGNITO_CLIENT_ID,
        "code": request.code,
        "redirect_uri": request.redirect_uri
    }

    # If using client secret, add Basic Auth header
    auth = (COGNITO_CLIENT_ID, COGNITO_CLIENT_SECRET) if COGNITO_CLIENT_SECRET else None

    logger.debug(data)

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

class Role(str, Enum):
    Student = "student"
    Tutor = "tutor"

class RegisterRequest(BaseModel):
    user_id: constr(pattern=r'^\d{8}$')
    display_name: str
    role: Role
    email: EmailStr

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
            {'Name': 'name', 'Value': request.display_name},
            {'Name': 'email', 'Value': request.email},
            {'Name': 'email_verified', 'Value': 'true'},  # optional but recommended
            {'Name': 'custom:role', 'Value': user.role},  # optional but recommended
        ]
    )

    try:
        response = cognito_client.admin_add_user_to_group(
            UserPoolId=COGNITO_USER_POOL_ID,
            Username=request.user_id,
            GroupName=user.role
        )
        logger.info(f"User {request.user_id} added to group {user.role}")

    except ClientError as e:
        print(f"Error adding user to group: {e}")

    # Replace with your actual primary key and value
    response = table.put_item(
        Item = user.model_dump()
    )

    if request.role == Role.Student:
        student_profile = StudentProfile(
            student_id=request.user_id,
            display_name=request.display_name,
            primary_disability="None",
            preferred_subjects=[],
            accommodations_needed=[],
            availability=[],
            additional_info=""
        )

        StudentService().add_student(student_profile)
    else:
        tutor_profile = TutorProfile(
            tutor_id=request.user_id,
            display_name=request.display_name,
            tutoring_style="",
            subjects=[],
            tools_or_technologies=[],
            accommodation_skills=[],
            additional_info="")

        TutorService().add_tutor(tutor_profile)

    return {"detail": "User was created."}
