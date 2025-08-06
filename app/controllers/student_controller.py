from fastapi import APIRouter, HTTPException
import logging
import boto3

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/students", tags=["students"])

@router.get("/")
async def get_student(student_id: str):
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
    if item:
        logger.debug("Item found:", item)
    else:
        logger.debug("Item not found.")

    return item