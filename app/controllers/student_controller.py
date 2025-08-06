from fastapi import APIRouter, HTTPException
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