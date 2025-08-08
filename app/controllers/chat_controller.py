from typing import Optional
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
import os
import logging
from services.student_file_service import StudentFileService
from services.student_service import StudentService
from services.tutor_service import TutorService
from prompts import summary_plan_prompt

KNOWLEDGE_BASE_ID = os.getenv("KNOWLEDGE_BASE_ID")

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/chat", tags=["chat"])
student_service = StudentService()
tutor_service = TutorService()

class ChatRequest(BaseModel):
    message: str
    subject: str = "General"
    session_id: Optional[str] = None

@router.get("/{student_id}/summary")
def get_summary_plan(student_id: str):
    try:
        # Get real data from DynamoDB
        student = student_service.get_student(student_id)
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")

        class_material = StudentFileService().get_file(student_id)

        prompt = build_prompt(student, tutor, class_material)

        response = bedrock.retrieve_and_generate(
            input={
                'text': prompt
            },
            retrieveAndGenerateConfiguration={
                'type': 'KNOWLEDGE_BASE',
                'knowledgeBaseConfiguration': {
                    'knowledgeBaseId': KNOWLEDGE_BASE_ID,
                    'modelArn': 'arn:aws:bedrock:us-west-2::foundation-model/anthropic.claude-3-5-sonnet-20241022-v2:0',
                    'generationConfiguration': {
                        'promptTemplate': {
                            'textPromptTemplate': summary_plan_prompt.kb_prompt
                        }
                    },
                }

            }
        )

        return json.loads(response['output']['text'])

    except Exception as e:
        logger.error(f"Error generating summary: {e}")
        logger.error(f"Error type: {type(e).__name__}")
        logger.error(f"Error details: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate summary: {str(e)}")

@router.post("/{student_id}/chat")
def get_next_chat_message(student_id: str, request: ChatRequest, web_request: Request):
    try:
        logger.info(f"Chat request for student_id: {student_id}")
        logger.info(f"KNOWLEDGE_BASE_ID: {KNOWLEDGE_BASE_ID}")

        # Get student data from DynamoDB
        student = student_service.get_student(student_id)
        logger.info(f"Student found: {student is not None}")
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")

        # Get tutor data
        tutor = tutor_service.get_tutor(web_request.state.user_id)
        logger.info(f"Tutor found: {tutor is not None}")

        class_material = StudentFileService().get_file(student_id)

        # Build chat-specific prompt for tutor assistance
        prompt = build_tutor_chat_prompt(
            student,
            tutor,
            request.message,
            request.subject,
            class_material
        )
        logger.info(f"Generated prompt length: {len(prompt)}")

        # Create a base dictionary with the required parameters
        request_params = {
            "input": {
                "text": prompt
            },
            "retrieveAndGenerateConfiguration": {
                "type": "KNOWLEDGE_BASE",
                "knowledgeBaseConfiguration": {
                    "knowledgeBaseId": KNOWLEDGE_BASE_ID,
                    "modelArn": f'arn:aws:bedrock:us-west-2::foundation-model/{os.getenv("BEDROCK_MODEL_ID")}',
                    'generationConfiguration': {
                        'promptTemplate': {
                            'textPromptTemplate': "Answer user questions using the documents: $search_results$. Be concise and specific. "
                        }
                    }
                }
            }
        }

        # Conditionally add sessionId if it's not None
        if request.session_id:
            request_params["sessionId"] = request.session_id

        logger.info("Calling Bedrock...")

        # Call AWS Bedrock
        response = bedrock.retrieve_and_generate(**request_params)

        logger.info("Bedrock response received")

        result = {
            "response": response['output']['text'],
            "session_id": response.get('sessionId', None)
        }

        logger.info(f"Returning response length: {len(result['response'])}")

        return result

    except Exception as e:
        logger.error(f"Error generating chat response: {e}")
        logger.error(f"Error type: {type(e).__name__}")
        logger.error(f"Error details: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate chat response: {str(e)}")


import boto3
import json
bedrock = boto3.client("bedrock-agent-runtime", region_name="us-west-2")


# Your base prompt — we'll improve this in the next steps
def build_prompt(student, tutor, subject, class_material=None):
    # Create concise profile strings
    student_profile = f"{student['primary_disability']} | {student['learning_preferences']['style']} | {student['learning_preferences']['format']} | {', '.join(student['accommodations_needed'])}"
    
    prompt = f"Student: {student_profile}\nSubject: {subject}\n"
    
    if tutor:
        tutor_profile = f"{tutor['tutoring_style']} | {', '.join(tutor['subjects'])} | {', '.join(tutor['accommodation_skills'])}"
        prompt += f"Tutor: {tutor_profile}\n"
    
    if class_material:
        prompt += f"Material: {class_material[:300]}...\n"
    
    prompt += "Generate a personalized study plan focusing on accessibility and learning effectiveness. Be concise and specific."
    
    return prompt

def build_tutor_chat_prompt(student, tutor, message, subject, class_material=None):
    # Concise profile summary
    student_profile = f"{student['primary_disability']} | {student['learning_preferences']['style']} | {student['learning_preferences']['format']} | {', '.join(student['accommodations_needed'])}"
    
    prompt = f"""
TUTOR QUESTION: "{message}"

STUDENT: {student_profile}
SUBJECT: {subject}
"""
    
    if tutor:
        tutor_profile = f"{tutor['tutoring_style']} | {', '.join(tutor['subjects'])} | {', '.join(tutor['accommodation_skills'])}"
        prompt += f"TUTOR: {tutor_profile}\n"
    
    if class_material:
        prompt += f"MATERIAL: {class_material[:200]}...\n"
    
    prompt += f"""
Provide practical guidance:
1. **Strategies** for {student['primary_disability']} in {subject}
2. **Accommodation steps** for: {', '.join(student['accommodations_needed'])}
3. **Learning tips** for {student['learning_preferences']['style']} style
4. **Immediate actions** for the tutor

Be concise and specific. Return only relevant information without extra dialogue or fluff.
"""
    prompt += f"""
<examples>
    <example>
    H: The student has ADHD. How can I help them stay focused during this lesson?
    A: Break the lesson into short 5–10 minute segments, use timers or visual countdowns, and incorporate brief interactive activities between sections.
    </example>

    <example>
    H: The student struggles with reading due to dyslexia. How can I adapt this lesson for them?
    A: Use audio support or text-to-speech tools, provide key terms with phonetic spelling, and break reading materials into short, manageable chunks with visual aids.
    </example>

    <example>
    H: Can you explain what the main objective of this lesson plan is?
    A: The objective is for the student to understand Newton’s Second Law and apply F=ma to real-world problems while practicing unit analysis.
    </example>

    <example>
    H: How can I check if the student understood today’s lesson?
    A: Ask them to explain the concept in their own words and solve one example problem without guidance. If they can do both correctly, they’ve likely grasped the material.
    </example>

    <example>
    H: What should I do if the student gets frustrated halfway through?
    A: Pause the lesson, acknowledge their frustration, and offer a short, low-pressure activity before returning to the main task. Break the remaining material into smaller steps.
    </example>
</examples>

    """
    
    return prompt

# Example student and tutor (replace with real data later)
student = {
    "primary_disability": "Dyslexia",
    "accommodations_needed": ["Text-to-speech software", "Braille materials"],
    "learning_preferences": {
        "style": "Reading/Writing",
        "format": "1-on-1",
        "modality": "Hybrid"
    }
}

tutor = {
    "tutoring_style": "Reading/Writing",
    "subjects": ["English", "Communication"],
    "tools_or_technologies": ["Screen readers", "Whiteboard tools"],
    "accommodation_skills": ["Assistive technology", "Flexible scheduling"]
}

subject = "Introduction to Essay Writing"

