from pydantic import BaseModel, EmailStr
from typing import List, Optional
from enum import Enum


class Day(str, Enum):
    Monday = "Monday"
    Tuesday = "Tuesday"
    Wednesday = "Wednesday"
    Thursday = "Thursday"
    Friday = "Friday"
    Saturday = "Saturday"
    Sunday = "Sunday"


class AvailabilityItem(BaseModel):
    day: Day
    start_time: str  # You can use time type if you want strict validation
    end_time: str


class LearningPreferences(BaseModel):
    format: str
    style: str
    modality: str


class StudentProfile(BaseModel):
    student_id: str
    email: Optional[EmailStr] = None
    display_name: str
    primary_disability: str
    preferred_subjects: List[str]
    accommodations_needed: List[str]
    availability: List[AvailabilityItem]
    learning_preferences: LearningPreferences
    additional_info: Optional[str] = ""
