from pydantic import BaseModel

class StudentFile(BaseModel):
    student_id: str
    text: str