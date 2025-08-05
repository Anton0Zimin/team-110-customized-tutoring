from fastapi import APIRouter
from fastapi.responses import PlainTextResponse
from services.summary_service import SummaryService
import json

router = APIRouter(prefix="/api/summary", tags=["summary"])

@router.get("/full/{section_id}", response_class = PlainTextResponse)
async def get_full(section_id: int):
    summary_service = SummaryService()
    return summary_service.get_full(section_id)

@router.get("/short/{section_id}")
async def get_summary(section_id: int):
    summary_service = SummaryService()
    summary_string = summary_service.get_summary(section_id)
    summary = json.loads(summary_string)
    return summary
