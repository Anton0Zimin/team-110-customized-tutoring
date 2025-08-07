from typing import List
from fastapi import APIRouter, HTTPException, Request
import logging
import boto3
from models import StudentProfile
from services import StudentService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/students", tags=["students"])

@router.get("/{student_id}", response_model=StudentProfile)
async def get_student(student_id: str, web_request: Request):
    if web_request.state.user_role == 'student' and student_id != web_request.state.user_id:
        raise HTTPException(status_code=403, detail="Student ID does not match user ID.")

    student_service = StudentService()
    return student_service.get_student(student_id)

@router.put("/{student_id}")
async def create_or_update_student(student: StudentProfile, student_id: str, web_request: Request):
    if web_request.state.user_role == 'student' and student.student_id != web_request.state.user_id:
        raise HTTPException(status_code=403, detail="Student ID does not match user ID.")

    student.student_id = student_id

    student_service = StudentService()

    student_service.add_student(student)
    return {"detail": "Student was created/updated."}

@router.get("/")
def get_all_students(web_request: Request, response_model=List[StudentProfile]):
    if web_request.state.user_role == 'student':
        raise HTTPException(status_code=403, detail="This endpoint is for tutors only.")

    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('Students')  # replace with your table name

    response = table.scan()
    items = response.get('Items', [])

    return items