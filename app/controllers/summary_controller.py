from fastapi import APIRouter
from services.summary_service import SummaryService

router = APIRouter(prefix="/api/summary", tags=["summary"])

@router.post("/{id}")
async def get_summary(id: int):
    summary_service = SummaryService()
    return summary_service.get_summary()
