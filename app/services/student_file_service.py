import boto3
from models import StudentFile

class StudentFileService:
    def __init__(self):
        self.dynamodb = boto3.resource('dynamodb', region_name='us-west-2')
        self.table = self.dynamodb.Table('StudentFiles')

    def get_file(self, student_id: str) -> StudentFile:
        response = self.table.get_item(Key={'student_id': student_id})
        return response.get('Item')

    def save_file(self, student_file: StudentFile):
        return self.table.put_item(Item=student_file.model_dump())