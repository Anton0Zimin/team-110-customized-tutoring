import boto3
from models.tutor_profile import TutorProfile

class TutorService:
    def __init__(self):
        self.dynamodb = boto3.resource('dynamodb', region_name='us-west-2')
        self.table = self.dynamodb.Table('Tutors')

    def get_tutor(self, tutor_id: str):
        response = self.table.get_item(Key={'tutor_id': tutor_id})
        return response.get('Item')

    def add_tutor(self, tutor: TutorProfile):
        return self.table.put_item(Item=tutor.model_dump())