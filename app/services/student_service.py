import boto3
from services.student_file_service import StudentFileService
from models.student_profile import StudentProfile

class StudentService:
    def __init__(self):
        self.dynamodb = boto3.resource('dynamodb', region_name='us-west-2')
        self.table = self.dynamodb.Table('Students')

    def get_student(self, student_id: str):
        response = self.table.get_item(Key={'student_id': student_id})
        return response.get('Item')

    def add_student(self, student: StudentProfile):
        self.table.put_item(Item=student.model_dump())
        return StudentFileService().copy_template(student.student_id)