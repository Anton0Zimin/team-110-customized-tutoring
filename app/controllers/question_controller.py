from fastapi import APIRouter
from services.question_service import QuestionService

router = APIRouter(prefix="/api/questions", tags=["questions"])

@router.get("/{id}")
async def get_questions(id: int):
    question_service = QuestionService()
    return question_service.get_questions()
