import random
import boto3
from models import StudentFile

class StudentFileService:
    def __init__(self):
        self.dynamodb = boto3.resource('dynamodb', region_name='us-west-2')
        self.table = self.dynamodb.Table('StudentFiles')

    def copy_template(self, student_id: str):
        # template1, template2, template3
        template_number = random.randint(1, 3)
        template_name = f'template{template_number}'

        response = self.table.get_item(Key={'student_id': template_name})
        item = response.get('Item')
        if not item:
            raise Exception(f"Template {template_name} not found")

        template_text = item["text"]

        item = StudentFile(student_id=student_id, text=template_text)
        return self.table.put_item(Item=item.model_dump())

    def get_file(self, student_id: str) -> StudentFile:
        response = self.table.get_item(Key={'student_id': student_id})
        return response.get('Item')

    def save_file(self, student_file: StudentFile):
        return self.table.put_item(Item=student_file.model_dump())