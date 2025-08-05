from fastapi import APIRouter
from services.summary_service import SummaryService
import json

router = APIRouter(prefix="/api/summary", tags=["summary"])

@router.get("/{id}")
async def get_summary(id: int):
    summary_service = SummaryService()
    summary_string = summary_service.get_summary()
    summary = json.loads(summary_string)
    return summary