from pydantic import BaseModel

class StudentFile(BaseModel):
    student_id: str
    content: str
    filename: str
    content_type: str
    content: str
    size_bytes: int