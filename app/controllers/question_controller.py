from fastapi import APIRouter
from services.question_service import QuestionService
import json

router = APIRouter(prefix="/api/questions", tags=["questions"])

@router.get("/{section_id}")
async def get_questions(section_id: int):
    question_service = QuestionService()
    questions_string = question_service.get_questions(section_id)
    questions = json.loads(questions_string)
    return questions
