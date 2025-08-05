from fastapi import APIRouter
from services.question_service import QuestionService
import json

router = APIRouter(prefix="/api/questions", tags=["questions"])

@router.get("/{id}")
async def get_questions(id: int):
    question_service = QuestionService()
    questions_string = question_service.get_questions()
    questions = json.loads(questions_string)
    return questions
