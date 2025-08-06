from fastapi import APIRouter, HTTPException
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/students", tags=["students"])

@router.get("/{student_id}/summary")
def get_summary_plan(student_id: str):
    return {"detail": "Not implemented yet."}

@router.post("/{student_id}/chat")
def get_next_chat_message(student_id: str):
    return {"detail": "Not implemented yet."}
