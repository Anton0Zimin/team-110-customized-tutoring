from typing import List
from fastapi import APIRouter, HTTPException, Request
import logging
import boto3
from models import StudentProfile
from services import StudentService
from services.student_tutor_matcher import match_student_to_tutor

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
    return {
        "tutor_id": student.tutor_id,
        "tutor_name": student.tutor_name,
        "detail": "Student was created/updated."
    }

@router.get("/")
def get_all_students(web_request: Request, response_model=List[StudentProfile]):
    if web_request.state.user_role == 'student':
        raise HTTPException(status_code=403, detail="This endpoint is for tutors only.")

    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('Students')  # replace with your table name

    response = table.scan()
    items = response.get('Items', [])

    return items

@router.post("/{student_id}/match")
async def match_student_with_tutor(student_id: str, web_request: Request):
    if web_request.state.user_role == 'student' and student_id != web_request.state.user_id:
        raise HTTPException(status_code=403, detail="Student ID does not match user ID.")

    try:
        # Get student data
        student_service = StudentService()
        student = student_service.get_student(student_id)
        
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")

        # Get all tutors from database
        dynamodb = boto3.resource('dynamodb')
        tutors_table = dynamodb.Table('Tutors')
        tutors_response = tutors_table.scan()
        tutors = tutors_response.get('Items', [])

        if not tutors:
            raise HTTPException(status_code=404, detail="No tutors available")

        # Find best tutor matches
        matched_tutors = match_student_to_tutor(student, tutors)
        
        if not matched_tutors:
            raise HTTPException(status_code=404, detail="No suitable tutor matches found")

        # Return the best match (first in sorted list)
        best_tutor = matched_tutors[0]
        
        # Update student record with matched tutor info
        student_dict = student if isinstance(student, dict) else student.__dict__
        student_dict['tutor_id'] = best_tutor.get('tutor_id')
        student_dict['tutor_name'] = best_tutor.get('name', best_tutor.get('tutor_name'))
        
        # Save the updated student record
        students_table = dynamodb.Table('Students')
        students_table.put_item(Item=student_dict)
        
        logger.info(f"Student {student_id} matched with tutor {best_tutor.get('tutor_id')}")
        
        return {
            "tutor": best_tutor,
            "match_found": True,
            "message": "Successfully matched with a tutor!"
        }

    except Exception as e:
        logger.error(f"Error matching student {student_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error finding tutor match: {str(e)}")