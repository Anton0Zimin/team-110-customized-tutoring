from fastapi import APIRouter, HTTPException, Request
import logging
import boto3
from models import StudentProfile
from services import StudentService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/students", tags=["students"])

@router.get("/{student_id}", response_model=StudentProfile)
async def get_student(student_id: str):
    student_service = StudentService()
    return student_service.get_student(student_id)

@router.post("/")
async def create_student(student: StudentProfile):
    student_service = StudentService()
    existing_student = student_service.get_student(student.student_id)

    if existing_student:
        raise HTTPException(status_code=400, detail="Student already exists")

    student_service.add_student(student)
    return {"detail": "Student was created."}

@router.put("/{student_id}")
async def create_or_update_student(student: StudentProfile, student_id: str, web_request: Request):
    if student.student_id != web_request.state.user_id:
        raise HTTPException(status_code=403, detail="Student ID does not match user ID.")

    student.student_id = student_id

    student_service = StudentService()

    student_service.add_student(student)
    return {"detail": "Student was created/updated."}

@router.get("/")
def get_all_students():
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('Students')  # replace with your table name

    response = table.scan()
    items = response.get('Items', [])

    return items