import boto3
from models.student_profile import StudentProfile

class StudentService:
    def __init__(self):
        self.dynamodb = boto3.resource('dynamodb', region_name='us-west-2')
        self.table = self.dynamodb.Table('Students')

    def get_student(self, student_id: str):

        response = self.table.get_item(Key={'student_id': student_id})
        return response.get('Item')

    def add_student(self, student: StudentProfile):
        return self.table.put_item(Item=student.model_dump())