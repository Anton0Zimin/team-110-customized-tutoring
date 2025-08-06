from pydantic import BaseModel
from typing import List, Optional

class TutorProfile(BaseModel):
    tutor_id: str
    display_name: str
    tutoring_style: str
    subjects: List[str]
    tools_or_technologies: List[str]
    accommodation_skills: List[str]
    additional_info: Optional[str] = ""