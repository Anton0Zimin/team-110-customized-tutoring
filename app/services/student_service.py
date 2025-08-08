import boto3
from services.student_file_service import StudentFileService
from models.student_profile import StudentProfile
from services.student_tutor_matcher import match_student_to_tutor
from services.dynamo_converter import convert_student_to_dynamo_format

class StudentService:
    def __init__(self):
        self.dynamodb = boto3.resource('dynamodb', region_name='us-west-2')
        self.table = self.dynamodb.Table('Students')

    def get_student(self, student_id: str):
        response = self.table.get_item(Key={'student_id': student_id})
        return response.get('Item')

    def add_student(self, student: StudentProfile):
        self.table.put_item(Item=student.model_dump())
        
        # Get all tutors and find best matches
        tutors_table = self.dynamodb.Table('Tutors')
        tutors_response = tutors_table.scan()
        tutors = tutors_response.get('Items', [])
        
        student_dynamo_format = convert_student_to_dynamo_format(student.model_dump())
        matched_tutors = match_student_to_tutor(student_dynamo_format, tutors)
        
        file_result = StudentFileService().copy_template(student.student_id)
        
        return {
            'file_result': file_result,
            'matched_tutors': matched_tutors
        }