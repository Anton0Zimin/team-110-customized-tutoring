import boto3
from models import StudentProfile

class StudentService:
    def get_student(self, student_id: str):
        # Initialize DynamoDB client or resource
        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table('Students')

        # Replace with your actual primary key and value
        response = table.get_item(
            Key={
                'student_id': student_id
            }
        )

        # Check if the item exists
        item = response.get('Item')
        return item

    def add_student(self, student: StudentProfile):
        # Initialize DynamoDB client or resource
        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table('Students')

        # Replace with your actual primary key and value
        response = table.put_item(
            Item=student.model_dump()
        )