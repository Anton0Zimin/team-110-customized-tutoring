from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
import os
import logging
import boto3
from services.student_service import StudentService

# Load environment variables
KNOWLEDGE_BASE_ID = os.getenv("KNOWLEDGE_BASE_ID")

logger = logging.getLogger(__name__)

# Create separate router for student chatbot
router = APIRouter(prefix="/api/student-chat", tags=["student-chatbot"])
student_service = StudentService()

# Initialize Bedrock client
bedrock = boto3.client("bedrock-agent-runtime", region_name="us-west-2")

class ChatbotRequest(BaseModel):
    message: str
    subject: str = "General"

@router.post("/{student_id}/chatbot")
def student_chatbot_message(student_id: str, request: ChatbotRequest, web_request: Request):
    """
    Student chatbot endpoint for interactive Q&A about tutoring experience
    """
    try:
        # Verify the requesting user is the same student
        if web_request.state.user_role != "student" or web_request.state.user_id != student_id:
            raise HTTPException(status_code=403, detail="Access denied")

        # Get student data
        student = student_service.get_student(student_id)
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")

        # Build chatbot context prompt
        context_prompt = build_chatbot_prompt(student, request.message)

        # Call AWS Bedrock
        response = bedrock.retrieve_and_generate(
            input={
                'text': context_prompt
            },
            retrieveAndGenerateConfiguration={
                'type': 'KNOWLEDGE_BASE',
                'knowledgeBaseConfiguration': {
                    'knowledgeBaseId': KNOWLEDGE_BASE_ID,
                    'modelArn': f'arn:aws:bedrock:us-west-2::foundation-model/{os.getenv("BEDROCK_MODEL_ID")}',
                    'generationConfiguration': {
                        'promptTemplate': {
                            'textPromptTemplate': """
                                Answer the provided question using only the provided documents:
                                $search_results$
                            """
                        }
                    },
                }
            }
        )

        logger.debug("Bedrock session id " + response.get('sessionId', None))
        return {
            "response": response['output']['text'],
            "session_id": response.get('sessionId', None)
        }

    except Exception as e:
        logger.error(f"Error generating chatbot response: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate chatbot response")

def build_chatbot_prompt(student, user_message):
    """
    Build a student-focused chatbot prompt with disability context and support guidance
    """
    prompt = f"""
You are a friendly, helpful student support chatbot for a disability tutoring service. You help students with questions about their tutoring experience, accommodations, scheduling, and general academic support.

<Student Context>
- Primary Disability: {student["primary_disability"]}
- Learning Style: {student["learning_preferences"]["style"]}
- Preferred Format: {student["learning_preferences"]["format"]}
- Modality: {student["learning_preferences"]["modality"]}
- Accommodations: {', '.join(student["accommodations_needed"])}
</Student Context>

<Guidelines>
- Be encouraging and supportive
- Provide specific, actionable advice
- Reference their accommodations when relevant
- Keep responses concise but helpful
- If you don't know something specific, direct them to support team
- Always maintain a friendly, professional tone
</Guidelines>

Student Question: {user_message}

Provide a helpful response:
"""
    return prompt