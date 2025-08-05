from fastapi import APIRouter
from fastapi.responses import PlainTextResponse
from services.summary_service import SummaryService
import json

router = APIRouter(prefix="/api/summary", tags=["summary"])

@router.get("/full/{id}", response_class = PlainTextResponse)
async def get_full(id: int):
    summary_service = SummaryService()
    return summary_service.get_full()

@router.get("/short/{id}")
async def get_summary(id: int):
    summary_service = SummaryService()
    summary_string = summary_service.get_summary()
    summary = json.loads(summary_string)
    return summary
